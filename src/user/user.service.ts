import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userSchema: Model<UserDocument>) { }

  async create(credentials: CreateUserDto): Promise<UserDocument> {
    try {
      const user = new this.userSchema({
        ...credentials
      })
      const result = await user.save()

      return result
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return await this.userSchema.find()
  }

  async findOneById(id: ObjectId): Promise<UserDocument> {
    const user = await this.userSchema.findById(id)

    if (!user)
      throw new NotFoundException()

    return user
  }

  async findOneByUsername(username: string): Promise<UserDocument> {
    const user = await this.userSchema.findOne({ username })

    if (!user)
      throw new NotFoundException()

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
    } catch(error) {
      if(error.code === 11000)
        throw new ConflictException('Username is already taken.')
      else
        throw new InternalServerErrorException()
    }
  }


  async remove(id: ObjectId): Promise<UserDocument> {
    let user = await this.userSchema.findByIdAndDelete(id)

    if (!user)
      throw new NotFoundException()
    
    return user 
  }
}
