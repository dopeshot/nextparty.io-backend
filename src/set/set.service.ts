import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
import { Set, SetDocument } from './entities/set.entity';
import { Model, ObjectId, Types } from 'mongoose';
import { SetStatus } from './enums/setstatus.enum';
import { UpdateSetDto } from './dto/update-set-metadata.dto';
import { Task, TaskContent, TaskDocument, TaskSchema, TaskContentSchema } from '../task/entities/task.entity';

@Injectable()
export class SetService {
  constructor(@InjectModel('Set') private setSchema: Model<SetDocument>,
    @InjectModel('Task') private taskSchema: Model<TaskDocument>) { }

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

  async alterTasks(id: ObjectId, mode: string, Tasks: UpdateSetTasksDto) {
    let set = await this.setSchema.findById(id)

    if (!set) { throw new NotFoundException() }

    for (let task of Tasks.tasks) {
      if (mode === "add") {
        //Check if element is not already in array
        if (set.taskList.indexOf(task) == -1) {
          set.taskList.push(task)
        }
      } else {
        //Check if element exists and therefore can be deleted
        const index = set.taskList.indexOf(task)
        if (index != -1) {
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
      if (updateSetDto.hasOwnProperty("description")) { set.description = updateSetDto.description }
      if (updateSetDto.hasOwnProperty("name")) { set.name = updateSetDto.name }

    } catch (error) { throw new UnprocessableEntityException }
    const result = await set.save()

    return result;
  }

  // Up- Downvotes a Task
  async vote(id: ObjectId, vote: string): Promise<SetDocument> {
    // Find Object
    let set = await this.setSchema.findById(id)
    if (!set) { throw new NotFoundException() }

    // Query check
    const isUpvote = vote && vote === 'upvote'
    const isDownvote = vote && vote === 'downvote'

    // Handle vote
    if (isUpvote) set.likes += 1

    if (isDownvote) set.dislikes += 1

    return await set.save()
  }

  async remove(id: ObjectId, type: string): Promise<void> {
    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    // true is for admin check later
    if (true && isHardDelete) {
      // Check if there is a set with this id and remove it
      const set = await this.setSchema.findByIdAndDelete(id)
      if (!set)
        throw new NotFoundException()

      // We have to return here to exit process
      return
    }

    // Soft delete
    const set = await this.setSchema.findByIdAndUpdate(id, {
      status: SetStatus.DELETED
    }, {
      new: true
    })
    if (!set)
      throw new NotFoundException()
  }

  async getTasks(id: ObjectId, page: number) {

    const isPaged = page ? true : false
    const startTime = Date.now();
    const set = await this.setSchema.findById(id)

    if (!set) {
      throw new NotFoundException()
    }

    let taskList: TaskDocument[] = []

    let list = set.taskList

    if (isPaged) {
      if (list.length > +process.env.SET_PAGE_LENGTH * (page)) {
        list = list.slice(+process.env.SET_PAGE_LENGTH * (page))
      }
    }

    for (const taskId of list) {
      let task = await this.taskSchema.findById(taskId)
      if (task) {
        taskList.push(task)
      }

      // break if page length is reached
      if (isPaged && taskList.length === +process.env.SET_PAGE_LENGTH) {
        break
      }

    }
    console.log("Runtime in ms: ", Date.now() - startTime)
    return taskList
  }

  async getTasks2(id: ObjectId, page: number, limit: number): Promise<TaskDocument[]> {
    const skip = page * limit
    limit += skip
    const idd = id.toString()

    const startTime = Date.now();
    const result = await this.setSchema.aggregate([
      { '$match': { '_id': Types.ObjectId(idd) } },
      {
        '$lookup': {
          'from': 'tasks',
          'localField': 'taskList',
          'foreignField': '_id',
          'pipeline': [
            {
              '$addFields': {
                'difference': {
                  '$subtract': [
                    '$likes', '$dislikes'
                  ]
                }
              }
            }, {
              '$sort': {
                'difference': -1, '_id': 1
              }
            }, {
              '$limit': limit
            }, {
              '$skip': skip
            }
          ],
          'as': 'objects'
        }
      }, {
        '$project': {
          'objects': 1
        }
      }
    ])
    console.log("Runtime in ms: ", Date.now() - startTime)
    if (result.length == 0) { throw new NotFoundException }
    return result
  }

  async findTopTenTasks(id: ObjectId): Promise<TaskDocument[]> {
    const idd = id.toString()
    const result = await this.setSchema.aggregate([
      { '$match': { '_id': Types.ObjectId(idd) } },
      {
        '$lookup': {
          'from': 'tasks',
          'localField': 'taskList',
          'foreignField': '_id',
          'pipeline': [
            {
              '$addFields': {
                'difference': {
                  '$subtract': [
                    '$likes', '$dislikes'
                  ]
                }
              }
            }, {
              '$sort': {
                'difference': -1, '_id': 1
              }
            }, {
              '$limit': 10
            }
          ],
          'as': 'objects'
        }
      }, {
        '$project': {
          'objects': 1
        }
      }
    ])
    if (!result) { throw new NotFoundException }
    return result
  }

  async getMetadata(id: ObjectId) {
    const set = await this.setSchema.findById(id)

    if (!set)
      throw new NotFoundException()

    return {
      "description": set.description,
      "name": set.name
    }
  }
}
