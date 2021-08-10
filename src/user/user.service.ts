import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userSchema: Model<UserDocument>) {}

  async create(credentials: CreateUserDto) {
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

  findAll() {
    return this.userSchema.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
