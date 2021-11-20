import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcyrpt from 'bcrypt'
import { userDataFromProvider } from './interfaces/userDataFromProvider.interface';
import { UserStatus } from './enums/status.enum';
import { MailService } from '../mail/mail.service';
import { VerifyDocument } from './entities/verify.entity';
import * as crypto from 'crypto'

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userSchema: Model<UserDocument>,
    @InjectModel('Verify') private verifySchema: Model<VerifyDocument>,
    @InjectModel('Reset') private resetSchema: Model<VerifyDocument>,
    private readonly mailService: MailService) { }

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
        password: hash
      })
      const result = await user.save()

      await this.createVerification(result)

      return result
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.username)
        throw new ConflictException('Username is already taken.')
      else if (error.code === 11000 && error.keyPattern.email)
        throw new ConflictException('Email is already taken.')
      throw new InternalServerErrorException("User Create failed")

    }
  }

  async parseJWTtOUsable(JWTuser): Promise<UserDocument> {
    let user = await this.userSchema.findById(JWTuser.userId)

    if (!user) {
      throw new NotFoundException()
    }

    return user
  }

  async createVerification(user: User) {
    const verifyCode = crypto.randomBytes(64).toString('hex');
    const verifyObject = new this.verifySchema({
      userId: user._id,
      verificationCode: verifyCode
    })
    await verifyObject.save()

    await this.mailService.generateVerifyMail(user.username, user.email, verifyCode)
  }

  /**
   * Create new User for auth without password
   * @param credentials user data
   * @returns user
   */
  async createUserFromProvider(userDataFromProvider: userDataFromProvider): Promise<User> {
    try {
      const user: UserDocument = new this.userSchema(userDataFromProvider)
      const result = await user.save()

      return result
    } catch (error) {
      throw new InternalServerErrorException('Error occured while saving user from provider.')
    }
  }

  /**
   * Find all user
   * @returns Array aus allen User 
   */
  async findAll(): Promise<User[]> {
    return await this.userSchema.find()
  }

  /**
   * Find user by id
   * @param id of the user
   * @returns User
   */
  async findOneById(id: ObjectId): Promise<User> {
    let user = await this.userSchema.findById(id).lean()

    if (!user)
      throw new NotFoundException()

    return user
  }

  /**
   * Find user by username
   * @param username of the user
   * @returns User
   */
  async findOneByUsername(username: string): Promise<User> {
    let user = await this.userSchema.findOne({ username }).lean()

    if (!user)
      throw new NotFoundException()

    return user
  }

  /**
   * Find user by email
   * @param email of the user
   * @returns User
   */
  async findOneByEmail(email: string): Promise<User | null> {
    let user = await this.userSchema.findOne({ email }).lean()

    if (!user)
      return null

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
      const updatedUser: User = await this.userSchema.findByIdAndUpdate(id, {
        role: role.role
      }, {
        new: true
      })

      return updatedUser
    } catch (error) {
      throw new InternalServerErrorException("Update Role failed")
    }
  }

  /**
   * Update the user
   * @param id ObjectId
   * @param updateUserDto Dto for updates 
   * @returns updated user (with changed fields)
   */
  async updateUser(id: ObjectId, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser: User = await this.userSchema.findByIdAndUpdate(id, {
        ...updateUserDto
      }, {
        new: true
      })

      return updatedUser
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Username is already taken.')
      else
        throw new InternalServerErrorException("Update User failed")
    }
  }


  /**
   * Remove User by Id
   * @param id User id
   * @returns Removed User
   */
  async remove(id: ObjectId): Promise<User> {
    let user = await this.userSchema.findByIdAndDelete(id)

    if (!user)
      throw new NotFoundException()

    return user
  }

  async veryfiyUser(code: string) {

    const verifyObject = await this.verifySchema.findOne({
      'verificationCode': code
    }).lean()

    if (!verifyObject) {
      throw new NotFoundException()
    }

    if (Date.now() - verifyObject._id.getTimestamp() > +process.env.VERIFY_TTL) {
      return { "error": "Expired" }
    }

    const user = await this.userSchema.findById(verifyObject.userId)

    if (!user) {
      throw new NotFoundException()
    }

    user.status = UserStatus.ACTIVE

    const result = await user.save()


    return result
  }

  /**
   * Sends the code for a password reset to the mail adress
   * @param mail - usermail
   */
  async requestResetPassword(mail: string) {
    const user = await this.userSchema.findOne({
      'email': mail
    }).lean()

    if (!user) {
      throw new NotFoundException()
    }

    const resetCode = crypto.randomBytes(64).toString('hex');
    const resetObject = new this.resetSchema({
      userId: user._id,
      verificationCode: resetCode
    })
    const result = await resetObject.save()

    await this.mailService.sendPasswordReset(user.username, user.email, resetCode)

  }

  /**
   * Overwrites the password with the new one
   * @param code - resetcode as passed in url
   * @param password new password
   * @returns 
   */
  async validatePasswordReset(code: string, password: string) {
    const resetObject = await this.resetSchema.findOneAndDelete({
      'verificationCode': code
    })

    if (!resetObject) {
      throw new NotFoundException()
    }

    if (Date.now() - resetObject._id.getTimestamp() > +process.env.RESET_TTL) {
      throw new BadRequestException('Token expired.')
    }

    const hash = await bcyrpt.hash(password, 12)

    const updatedUser: User = await this.userSchema.findByIdAndUpdate(resetObject.userId, {
        password: hash
      }, {
        new: true
    })

    if (!updatedUser) {
      throw new NotFoundException()
    }

    return updatedUser
  }
}
