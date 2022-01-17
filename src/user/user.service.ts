import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    ServiceUnavailableException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import { Model, ObjectId } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { MailService } from '../mail/mail.service';
import { MailPwResetDto } from '../mail/types/mail-pw-reset.type';
import { MailVerifyDto } from '../mail/types/mail-verify.type';
import { createSlug } from '../shared/global-functions/create-slug';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserStatus } from './enums/status.enum';
import { PwResetJWTDto } from './interfaces/reset-jwt.interface';
import { userDataFromProvider } from './interfaces/userDataFromProvider.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) {}

    // Allows for changing the hashing algo without breaking tests and other linked functionality
    async hashPassword(plaintext: string) {
        return await bcyrpt.hash(plaintext, 12);
    }

    /**
     * Create new user with credentials
     * @param credentials of the user
     * @returns User
     */
    async create(credentials: CreateUserDto): Promise<User> {
        try {
            const hash = await this.hashPassword(credentials.password);
            const user = new this.userModel({
                ...credentials,
                status: UserStatus.UNVERIFIED,
                password: hash,
                slug: createSlug(credentials.username)
            });

            // This order of operations is important
            // The user is saved first, then the verification code is generated
            // If the verification code generation fails, it can be rerequested later

            const result = await user.save();

            await this.createVerification(result);

            return result;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.username)
                throw new ConflictException('Username is already taken.');
            else if (error.code === 11000 && error.keyPattern.email)
                throw new ConflictException('Email is already taken.');
            else if (error instanceof ServiceUnavailableException) throw error;
            /* istanbul ignore next */
            throw new InternalServerErrorException('User Create failed');
        }
    }

    async generateToken(user: User, secret, expiration): Promise<string> {
        const payload = {
            mail: user.email,
            name: user.username,
            id: user._id
        };

        return this.jwtService.sign(payload, {
            secret: secret,
            expiresIn: expiration
        });
    }

    async createVerification(user: User): Promise<string> {
        const verifyCode = await this.generateToken(
            user,
            process.env.VERIFY_JWT_SECRET,
            process.env.VERIFY_JWT_EXPIRESIN
        );

        await this.mailService.sendMail<MailVerifyDto>(
            user.email,
            'MailVerify',
            {
                name: user.username,
                link: `${
                    process.env.FRONTEND_DOMAIN || 'https://app.nextparty.io'
                }/account/verify-account/${verifyCode}`
            },
            'Confirm your email address'
        );

        return verifyCode;
    }

    /**
     * Create new User for auth without password
     * @param credentials user data
     * @returns user
     */
    async createUserFromProvider(
        userDataFromProvider: userDataFromProvider
    ): Promise<User> {
        try {
            const user: UserDocument = new this.userModel({
                ...userDataFromProvider,
                slug: createSlug(userDataFromProvider.username)
            });
            const result = await user.save();

            return result;
        } catch (error) {
            throw new InternalServerErrorException(
                'Error occured while saving user from provider.'
            );
        }
    }

    /**
     * Find all user
     * @returns Array aus allen User
     */
    async findAll(): Promise<User[]> {
        return await this.userModel.find().lean();
    }

    /**
     * Find user by id
     * @param id of the user
     * @returns User
     */
    async findOneById(id: ObjectId): Promise<User> {
        const user = await this.userModel.findById(id).lean();

        if (!user) throw new NotFoundException();

        return user;
    }

    /**
     * Find user by email
     * @param email of the user
     * @returns User
     */
    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).lean();

        if (!user) throw new NotFoundException();

        return user;
    }

    /**
     * Update the user
     * @param id ObjectId
     * @param updateUserDto Dto for updatesparseJWTtOUsable
     * @returns updated user (with changed fields)
     */
    async updateUser(
        id: ObjectId,
        updateUserDto: UpdateUserDto,
        actingUser: JwtUserDto
    ): Promise<User> {
        // User should only be able to update his own data (Admin can update all)
        if (
            id.toString() !== actingUser.userId.toString() &&
            actingUser.role !== Role.ADMIN
        ) {
            throw new ForbiddenException();
        }
        let updatedUser: User;

        if (updateUserDto.username) {
            updateUserDto.slug = createSlug(updateUserDto.username);
        }

        try {
            updatedUser = await this.userModel
                .findByIdAndUpdate(
                    id,
                    {
                        ...updateUserDto
                    },
                    {
                        new: true
                    }
                )
                .lean();
        } catch (error) {
            if (error.code === 11000)
                throw new ConflictException('Username is already taken.');
            else throw new InternalServerErrorException('Update User failed');
        }
        // Seperate exception to ensure that user gets a specific error
        if (!updatedUser) throw new NotFoundException('User not found');
        return updatedUser;
    }

    async remove(id: ObjectId, actingUser: JwtUserDto): Promise<User> {
        // User should only be able to delete own account (Admin can delete all)
        if (
            id.toString() !== actingUser.userId.toString() &&
            actingUser.role !== Role.ADMIN
        ) {
            throw new ForbiddenException();
        }

        const user = await this.userModel.findByIdAndDelete(id);

        if (!user) throw new NotFoundException();

        return user;
    }

    async isValidVerifyCode(userId: ObjectId): Promise<boolean> {
        let user: User;
        try {
            user = await this.findOneById(userId);
        } catch (error) {
            // This is necessary as a not found exception would overwrite the guard response
            return false;
        }
        if (!user) return false; // This should never happen but just in case
        if (user.status !== UserStatus.UNVERIFIED) {
            return false;
        }
        return true;
    }

    async verifyMail(userId: ObjectId): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(userId, {
            status: UserStatus.ACTIVE
        });

        //failsave that should never occur so istanbul ignore\
        /* istanbul ignore next */
        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async requestReset(mail: string) {
        let user: User;
        try {
            user = await this.findOneByEmail(mail);
        } catch (e) {
            // This prevents not found exceptions. Therefore it is not possible to use this endpoint to see if a mail address
            // has an account attached to it
            user = undefined;
        }
        if (user.provider || !user || user.status === UserStatus.UNVERIFIED) {
            // Catch not found users, users from seperate providers and users without an email adress that has been verified => security stuff
            return;
        }

        const token = await this.generateToken(
            user,
            process.env.RESET_JWT_SECRET,
            process.env.RESET_JWT_EXPIRESIN
        );

        this.mailService.sendMail<MailPwResetDto>(
            user.email,
            'PasswordReset',
            {
                name: user.username,
                link: `${
                    process.env.FRONTEND_DOMAIN || 'https://app.nextparty.io'
                }/account/reset-password/${token}`
            },
            'Reset your Password'
        );
        console.log('send');
    }

    validateResetToken(token: string) {
        let sendUserData: PwResetJWTDto;
        try {
            sendUserData = this.jwtService.verify(token, {
                secret: process.env.RESET_JWT_SECRET,
                ignoreExpiration: false
            });
        } catch (e) {
            throw new UnauthorizedException();
        }

        if (!sendUserData) {
            throw new UnauthorizedException();
        }

        const user = this.findOneById(sendUserData.id);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }

    async setPassword(userId: ObjectId, password: string) {
        const hash = await this.hashPassword(password);

        const user = await this.userModel
            .findByIdAndUpdate(userId, {
                password: hash
            })
            .lean();

        if (!user) {
            throw new NotFoundException();
        }

        // This should never occur
        if (user.provider || user.status === UserStatus.UNVERIFIED) {
            throw new BadRequestException(
                'This account cannot reset their password.'
            );
        }

        return user;
    }
}
