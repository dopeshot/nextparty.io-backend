import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Provider,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './entities/user.entity'
import * as bcyrpt from 'bcrypt'
import { userDataFromProvider } from './interfaces/userDataFromProvider.interface'
import { UserStatus } from './enums/status.enum'
import { MailService } from '../mail/mail.service'
import { EmailVerify, VerifyDocument } from './entities/verify.entity'
import * as crypto from 'crypto'
import { MailVerifyDto } from '../mail/dto/mail-verify.dto'
import { MailPwResetDto } from '../mail/dto/mail-pw-reset.dto'
import { Role } from './enums/role.enum'
import { isInstance } from 'class-validator'
import { Roles } from '../auth/roles/roles.decorator'
import { JwtUserDto } from '../auth/dto/jwt.dto'

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private userSchema: Model<UserDocument>,
        @InjectModel('Verify') private verifySchema: Model<VerifyDocument>,
        @InjectModel('Reset') private resetSchema: Model<VerifyDocument>,
        private readonly mailService: MailService,
    ) {}

    /**
     * Create new user with credentials
     * @param credentials of the user
     * @returns User
     */
    async create(credentials: CreateUserDto): Promise<User> {
        try {
            const hash = await bcyrpt.hash(credentials.password, 12)
            const user = new this.userSchema({
                ...credentials,
                status: UserStatus.UNVERIFIED,
                password: hash,
            })

            await this.createVerification(user)

            const result = await user.save()

            

            return result
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.username)
                throw new ConflictException('Username is already taken.')
            else if (error.code === 11000 && error.keyPattern.email)
                throw new ConflictException('Email is already taken.')
            else if (error instanceof ServiceUnavailableException )
                throw error
            throw new InternalServerErrorException('User Create failed')
        }
    }

    async parseJWTtOUsable(JWTuser): Promise<UserDocument> {
        const user = await this.userSchema.findById(JWTuser.userId)

        if (!user) {
            throw new NotFoundException()
        }

        return user
    }

    async createVerification(user: User): Promise<void> {
        const verifyCode = crypto.randomBytes(64).toString('hex')
        const verifyObject = new this.verifySchema({
            userId: user._id,
            verificationCode: verifyCode,
        })
        await verifyObject.save()


        await this.mailService.sendMail( user.email, 'MailVerify', {name: user.username, link: `${process.env.HOST}/user/verify/${verifyCode}`} as MailVerifyDto, 'Verify your email')
    }

    /**
     * Create new User for auth without password
     * @param credentials user data
     * @returns user
     */
    async createUserFromProvider(
        userDataFromProvider: userDataFromProvider,
    ): Promise<User> {
        try {
            const user: UserDocument = new this.userSchema(userDataFromProvider)
            const result = await user.save()

            return result
        } catch (error) {
            throw new InternalServerErrorException(
                'Error occured while saving user from provider.',
            )
        }
    }

    /**
     * Find all user
     * @returns Array aus allen User
     */
    async findAll(): Promise<User[]> {
        const users = await this.userSchema.find()

        if (!users) throw new NotFoundException()

        return users
    }

    /**
     * Find user by id
     * @param id of the user
     * @returns User
     */
    async findOneById(id: ObjectId): Promise<User> {
        const user = await this.userSchema.findById(id).lean()

        if (!user) throw new NotFoundException()

        return user
    }

    /**
     * Find user by username
     * @param username of the user
     * @returns User
     */
    async findOneByUsername(username: string): Promise<User> {
        const user = await this.userSchema.findOne({ username }).lean()

        if (!user) throw new NotFoundException()

        return user
    }

    /**
     * Find user by email
     * @param email of the user
     * @returns User
     */
    async findOneByEmail(email: string): Promise<User | null> {
        const user = await this.userSchema.findOne({ email }).lean()

        if (!user) return null

        return user
    }

    /**
     * FOR TESTING update role
     * @param id object id
     * @param role
     * @returns User
     */
    async patchRole(id: ObjectId, role: any): Promise<User> {
        try {
            const updatedUser: User = await this.userSchema.findByIdAndUpdate(
                id,
                {
                    role: role.role,
                },
                {
                    new: true,
                },
            )

            return updatedUser
        } catch (error) {
            throw new InternalServerErrorException('Update Role failed')
        }
    }

    /**
     * Update the user
     * @param id ObjectId
     * @param updateUserDto Dto for updates
     * @returns updated user (with changed fields)
     */
    async updateUser(
        id: ObjectId,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        try {
            const updatedUser: User = await this.userSchema.findByIdAndUpdate(
                id,
                {
                    ...updateUserDto,
                },
                {
                    new: true,
                },
            )

            return updatedUser
        } catch (error) {
            if (error.code === 11000)
                throw new ConflictException('Username is already taken.')
            else throw new InternalServerErrorException('Update User failed')
        }
    }

    async remove(id: ObjectId, requestingUser: JwtUserDto): Promise<User> {
        if (requestingUser.role !== Role.Admin && id !== requestingUser.userId){
            throw new UnauthorizedException()
        }
        
        const user = await this.userSchema.findByIdAndDelete(id)

        if (!user) throw new NotFoundException()

        return user
    }

    async findVerify(userId: ObjectId): Promise<EmailVerify> {
        const verifyObject = await this.verifySchema
            .findOne({
                userId: userId,
            })
            .lean()
        if (!verifyObject) {
            return null
        }
        return verifyObject
    }

    async veryfiyUser(code: string): Promise<User> {
        const verifyObject = await this.verifySchema
            .findOne({
                verificationCode: code,
            })
            .lean()

        if (!verifyObject) {
            throw new NotFoundException()
        }

        if ( Date.now() - verifyObject._id.getTimestamp() > +process.env.VERIFY_TTL) {
            throw new BadRequestException('Verification code expired')
        }

        const user = await this.userSchema.findByIdAndUpdate(verifyObject.userId, {status: UserStatus.ACTIVE})

        if (!user) {
            throw new NotFoundException()
        }

        return user
    }

    /**
     * Sends the code for a password reset to the mail adress
     * @param mail - usermail
     */
    async requestResetPassword(mail: string) {
        const user = await this.userSchema
            .findOne({
                email: mail,
            })
            .lean()

        if (!user) {
            throw new NotFoundException()
        }

        const resetCode = crypto.randomBytes(64).toString('hex')
        const resetObject = new this.resetSchema({
            userId: user._id,
            verificationCode: resetCode,
        })
        await resetObject.save()

        await this.mailService.sendMail( user.email, 'PasswordReset', {name: user.username, link: `${process.env.HOST}/user/reset-form/${resetCode}`} as MailPwResetDto , 'Reset your password')
    }

    async findReset(userId: ObjectId): Promise<EmailVerify> {
        const verifyObject = await this.resetSchema
            .findOne({
                userId: userId,
            })
            .lean()
        if (!verifyObject) {
            throw new NotFoundException()
        }
        return verifyObject
    }

    /**
     * Overwrites the password with the new one
     * @param code - resetcode as passed in url
     * @param password new password
     * @returns
     */
    async validatePasswordReset(code: string, password: string) {
        const resetObject = await this.resetSchema.findOneAndDelete({
            verificationCode: code,
        })

        if (!resetObject) {
            throw new NotFoundException()
        }

        if (
            Date.now() - resetObject._id.getTimestamp() >
            +process.env.RESET_TTL
        ) {
            throw new BadRequestException('Token expired.')
        }

        const hash = await bcyrpt.hash(password, 12)

        const updatedUser: User = await this.userSchema.findByIdAndUpdate(
            resetObject.userId,
            {
                password: hash,
            },
            {
                new: true,
            },
        )

        if (!updatedUser) {
            throw new NotFoundException()
        }

        return updatedUser
    }
}
