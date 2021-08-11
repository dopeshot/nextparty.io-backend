import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskSchema } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(@InjectModel('Task') private taskSchema: Model<TaskDocument>) { }
  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    try {
      const task = new this.taskSchema({
        ...createTaskDto
      })
      const result = await task.save()

      return result
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }

  async findAll(): Promise<TaskDocument[]> {
    return await this.taskSchema.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}

