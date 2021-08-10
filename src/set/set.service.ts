import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { Set, SetDocument } from './entities/set.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class SetService {
  constructor(@InjectModel('Set') private setSchema: Model<SetDocument>) { }

  async create(metaData: CreateSetDto): Promise<SetDocument> {
    try {
      const set = new this.setSchema({
        ...metaData
      })
      const result = await set.save()

      return result
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }


  async findAll(): Promise<SetDocument[]> {
    return await this.setSchema.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} set`;
  }

  update(id: number, updateSetDto: UpdateSetDto) {
    return `This action updates a #${id} set`;
  }

  remove(id: number) {
    return `This action removes a #${id} set`;
  }
}
