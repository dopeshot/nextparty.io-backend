import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskContent, TaskDocument, TaskSchema, TaskContentSchema } from './entities/task.entity';
import { TaskStatus } from './enums/taskstatus.enum';

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

  async findOne(id: ObjectId): Promise<TaskDocument> {
    let task = await this.taskSchema.findById(id).lean()
    if (!task)
      throw new NotFoundException()
  
    return task;
  }

  async update(id: ObjectId, createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    let task = await this.taskSchema.findById(id)
    if (!task)
      throw new NotFoundException()
    
    task.content.message = createTaskDto.content.message
    task.content.currentPlayerGender = createTaskDto.content.currentPlayerGender
    task.language = createTaskDto.language
    task.type = createTaskDto.type
    task.save()
      
    return task;
  }

  async remove(id: ObjectId, type: string): Promise<void> {    
    // Check query
    const isHardDelete = type ? type.includes('hard') : false
    
    // true is for admin check later
    if(true && isHardDelete) {
      // Check if there is a task with this id and remove it
      const task = await this.taskSchema.findByIdAndDelete(id)
      if(!task)
        throw new NotFoundException()
      
      // We have to return here to exit process
      return
    }

    // Soft delete
    const task = await this.taskSchema.findByIdAndUpdate(id, {
      status: TaskStatus.DELETED
    }, {
      new: true
    })
    if(!task)
      throw new NotFoundException()
  }

  private parseForPersonCounts(createTaskDto: CreateTaskDto): TaskContent {
    const maleCountSymbol = "@m"
    const femaleCountSymbol = "@"
    createTaskDto.content.message.split
    return 
  }

  private countOccurrence(string: string, substring: string): number {
    return string.split(substring).length-1
  }

}

