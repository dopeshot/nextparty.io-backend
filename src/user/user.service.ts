import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Provider,
    ServiceUnavailableException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument, UserSchema } from './entities/user.entity';
import * as bcyrpt from 'bcrypt';
import { userDataFromProvider } from './interfaces/userDataFromProvider.interface';
import { UserStatus } from './enums/status.enum';
import { MailService } from '../mail/mail.service';
import { MailVerifyDto } from '../mail/dto/mail-verify.dto';
import { Role } from './enums/role.enum';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { JwtService } from '@nestjs/jwt';
import { returnUser } from './dto/return-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
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
            const user = new this.userSchema({
                ...credentials,
                status: UserStatus.UNVERIFIED,
                password: hash
            });

            await this.createVerification(user);

            const result = await user.save();

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

    async parseJWTtOUsable(JWTuser): Promise<UserDocument> {
        const user = await this.userSchema.findById(JWTuser.userId);

        // this should be unreachable if the guard works correctly
        /* istanbul ignore next */
        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async generateVerifyCode(user: User): Promise<string> {
        const payload = {
            mail: user.email,
            name: user.username,
            id: user._id,
            create_time: Date.now()
        };

        return this.jwtService.sign(payload);
    }

    async createVerification(user: User): Promise<string> {
        const verifyCode = await this.generateVerifyCode(user);

        //console.log(`${process.env.HOST}/api/user/verify/?code=${verifyCode}`);

        await this.mailService.sendMail(
            user.email,
            'MailVerify',
            {
                name: user.username,
                link: `${process.env.HOST}/user/verify/${verifyCode}`
            } as MailVerifyDto,
            'Verify your email'
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
            const user: UserDocument = new this.userSchema(
                userDataFromProvider
            );
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
        const users = await this.userSchema.find();

        if (!users) throw new NotFoundException();

        return users;
    }

    /**
     * Find user by id
     * @param id of the user
     * @returns User
     */
    async findOneById(id: ObjectId): Promise<User> {
        const user = await this.userSchema.findById(id).lean();

        if (!user) throw new NotFoundException();

        return user;
    }

    /**
     * Find user by email
     * @param email of the user
     * @returns User
     */
    async findOneByEmail(email: string): Promise<User | null> {
        const user = await this.userSchema.findOne({ email }).lean();

        if (!user) return null;

        return user;
    }

    /**
     * Update the user
     * @param id ObjectId
     * @param updateUserDto Dto for updates
     * @returns updated user (with changed fields)
     */
    async updateUser(
        id: ObjectId,
        updateUserDto: UpdateUserDto
    ): Promise<User> {
        try {
            const updatedUser: User = await this.userSchema.findByIdAndUpdate(
                id,
                {
                    ...updateUserDto
                },
                {
                    new: true
                }
            );

            return updatedUser;
        } catch (error) {
            if (error.code === 11000)
                throw new ConflictException('Username is already taken.');
            else throw new InternalServerErrorException('Update User failed');
        }
    }

    async remove(id: ObjectId, requestingUser: JwtUserDto): Promise<User> {
        if (
            requestingUser.role !== Role.Admin &&
            id !== requestingUser.userId
        ) {
            throw new UnauthorizedException();
        }

        const user = await this.userSchema.findByIdAndDelete(id);

        if (!user) throw new NotFoundException();

        return user;
    }

    async validateVerifyCode(userId: ObjectId): Promise<boolean> {
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

    async veryfiyUser(userId: ObjectId): Promise<User> {
        const user = await this.userSchema.findByIdAndUpdate(userId, {
            status: UserStatus.ACTIVE
        });

        //failsave that should never occur so istanbul ignore\
        /* istanbul ignore next */
        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async transformToReturn(user: User): Promise<returnUser> {
        const strip = {
            _id: user._id,
            username: user.username,
            email: user.email,
            status: user.status,
            role: user.role,
            provider: user.provider
        };
        return strip;
    }
}
