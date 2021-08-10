import { Injectable } from '@nestjs/common';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';

@Injectable()
export class SetService {
  create(createSetDto: CreateSetDto) {
    return 'This action adds a new set';
  }

  findAll() {
    return `This action returns all set`;
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
