import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    ServiceUnavailableException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import { Model, ObjectId } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { MailService } from '../mail/mail.service';
import { MailVerifyDto } from '../mail/types/mail-verify.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserStatus } from './enums/status.enum';
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
                password: hash
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

    async generateVerifyCode(user: User): Promise<string> {
        const payload = {
            mail: user.email,
            name: user.username,
            id: user._id,
            create_time: Date.now()
        };

        return this.jwtService.sign(payload, {
            secret: process.env.VERIFY_JWT_SECRET,
            expiresIn: process.env.VERIFY_JWT_EXPIRESIN
        });
    }

    async createVerification(user: User): Promise<string> {
        const verifyCode = await this.generateVerifyCode(user);

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
            const user: UserDocument = new this.userModel(userDataFromProvider);
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
        return await this.userModela.find().lean();
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

        try {
            updatedUser = await this.userModel.findByIdAndUpdate(
                id,
                {
                    ...updateUserDto
                },
                {
                    new: true
                })
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
}
