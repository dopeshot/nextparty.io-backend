import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async findOneById(id: Types.ObjectId): Promise<UserDocument> {
    let user = await this.userSchema.findById(id).lean()

    if (!user)
      throw new NotFoundException()

    return user
  }

  async findOneByUsername(username: string): Promise<UserDocument> {
    let user = await this.userSchema.findOne({ username }).lean()

    if (!user)
      throw new NotFoundException()

    return user
  }

  //TODO
  updateUser(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }


  async remove(id: Types.ObjectId): Promise<UserDocument> {
    let user = await this.userSchema.findByIdAndDelete(id)

    if (!user)
      throw new NotFoundException()
    
    return user 
  }
}
