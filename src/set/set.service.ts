import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
import { Set, SetDocument } from './entities/set.entity';
import { Model, ObjectId, Types } from 'mongoose';
import { SetStatus } from './enums/setstatus.enum';
import { UpdateSetDto } from './dto/update-set-metadata.dto';

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

  async alterTasks(id: ObjectId, mode: string, Tasks: UpdateSetTasksDto){
    let set = await this.setSchema.findById(id)
    
    if (!set) { throw new NotFoundException() }

    for(let task of Tasks.tasks){
      if (mode==="add"){
        //Check if element is not already in array
        if (set.taskList.indexOf(id) == -1){
          set.taskList.push(id)
        } 
      }else{
        //Check if element exists and therefore can be deleted
        const index = set.taskList.indexOf(id)
        if ( index != -1){
          set.taskList.splice(index, 1)
        }
      }
    }
    const result = await set.save()

    return result;
  }

  async findAll(): Promise<SetDocument[]> {
    return await this.setSchema.find()
  }

  async findOne(id: ObjectId) {
    let task = await this.setSchema.findById(id).lean()
    if (!task)
      throw new NotFoundException()
    return task;
  }

  async updateMetadata(id: ObjectId, updateSetDto: UpdateSetDto) {

      // Find Object
      let set = await this.setSchema.findById(id)
      
      if (!set) { throw new NotFoundException() }
  
      
      try {
        if (updateSetDto.hasOwnProperty("description")) { set.description = updateSetDto.description}
        if (updateSetDto.hasOwnProperty("name")) { set.name = updateSetDto.name }

      } catch (error) {throw new UnprocessableEntityException }
      const result = await set.save()
  
      return result;
  }

  async remove(id: ObjectId, type: string): Promise<void> {
    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    // true is for admin check later
    if (true && isHardDelete) {
      // Check if there is a task with this id and remove it
      const task = await this.setSchema.findByIdAndDelete(id)
      if (!task)
        throw new NotFoundException()

      // We have to return here to exit process
      return
    }

    // Soft delete
    const task = await this.setSchema.findByIdAndUpdate(id, {
      status: SetStatus.DELETED
    }, {
      new: true
    })
    if (!task)
      throw new NotFoundException()
  }
}
