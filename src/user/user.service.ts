import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcyrpt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userSchema: Model<UserDocument>) { }

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
        password: hash
      })
      const result = await user.save()

      return result
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.username)
        throw new ConflictException('Username is already taken.')
      else if (error.code === 11000 && error.keyPattern.email)
        throw new ConflictException('Email is already taken.')
      throw new InternalServerErrorException("User Create failed")
    }
  }

  /**
   * Create new User for auth without username and password
   * @param credentials user data
   * @returns user
   */
  async createWithoutPassword(credentials: any): Promise<any> {
    try {
      const user = new this.userSchema({
        username: credentials.displayName,
        email: credentials.emails[0].value,
        provider: credentials.provider
      })
      const result = await user.save()

      return result
    } catch (error) {
      throw new InternalServerErrorException(error)
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
  async findOneByEmail(email: string): Promise<User | null > {
    let user = await this.userSchema.findOne({ email })

    if (!user)
      return null

    return user
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
}
