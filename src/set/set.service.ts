import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { Status } from '../shared/enums/status.enum';
import { SharedService } from '../shared/shared.service';
import { Role } from '../user/enums/role.enum';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SetDocument } from './entities/set.entity';
import { TaskDocument } from './entities/task.entity';
import { TaskType } from './enums/tasktype.enum';
import { SetSampleData } from './set.data';
import { ResponseSet, ResponseSetMetadata, ResponseSetWithTasks, ResponseTask, ResponseTaskWithStatus, UpdatedCounts } from './types/set.response';

@Injectable()
export class SetService {
  constructor(
    @InjectModel('Set') private setSchema: Model<SetDocument>,
    @InjectModel('Task') private taskSchema: Model<TaskDocument>,
    private readonly sharedService: SharedService
  ) { }


  async createSet(createSetDto: CreateSetDto, user: JwtUserDto): Promise<ResponseSet> {
    try {

      const set: SetDocument = await this.setSchema.create({ ...createSetDto, createdBy: user.userId })

      return {
        _id: set.id,
        daresCount: set.daresCount,
        truthCount: set.truthCount,
        language: set.language,
        name: set.name,
        createdBy: {
          _id: user.userId,
          username: user.username
        },
        previewImage: set.previewImage,
        bannerImage: set.bannerImage
      }

    } catch (error) {
      if (error.code == '11000') {
        throw new ConflictException('This set already exists')
      }
      console.error(error)
      throw new InternalServerErrorException()
    }
  }

  async getAllSets(): Promise<ResponseSet[]> {

    const sets: ResponseSet[] = await this.setSchema.find(
      { status: Status.ACTIVE },
      { _id: 1, daresCount: 1, truthCount: 1, name: 1, language: 1, createdBy: 1, previewImage: 1, bannerImage: 1 }
    ).populate<ResponseSet[]>('createdBy', '_id username')

    if (sets.length === 0)
      throw new NotFoundException()

    return sets

  }

  async getOneSet(id: ObjectId): Promise<ResponseSetWithTasks> {

    const set: (ResponseSet & { tasks: ResponseTaskWithStatus[] }) = await this.setSchema.findOne(
      { _id: id, status: Status.ACTIVE },
      { _id: 1, daresCount: 1, truthCount: 1, name: 1, language: 1, createdBy: 1, tasks: 1, previewImage: 1, bannerImage: 1 }
    ).populate<(ResponseSet & { tasks: ResponseTaskWithStatus[] })>('createdBy', '_id username').lean()

    if (!set)
      throw new NotFoundException()

    // Remove tasks from array that are not active
    const result: ResponseSetWithTasks = this.onlyActiveTasks(set)

    return result;
  }

  async updateSetMetadata(id: ObjectId, updateSetDto: UpdateSetDto, user: JwtUserDto): Promise<ResponseSetMetadata> {

    let queryMatch: { _id: ObjectId, createdBy?: ObjectId } = { _id: id }

    if (user.role !== Role.Admin) {
      queryMatch.createdBy = user.userId
    }

    const set: ResponseSetMetadata = await this.setSchema.findOneAndUpdate(queryMatch, updateSetDto, { new: true, select: "_id daresCount truthCount language name createdBy" })

    if (!set)
      throw new NotFoundException()

    return set

  }

  async deleteSet(id: ObjectId, deleteType: string, user: JwtUserDto): Promise<void> {

    // Hard delete
    if (deleteType === 'hard') {
      if (user.role != 'admin')
        throw new ForbiddenException()

      const set = await this.setSchema.findByIdAndDelete(id)

      if (!set)
        throw new NotFoundException()

      return

    }

    // Soft delete
    const queryMatch: { _id: ObjectId, createdBy?: ObjectId } = { _id: id }

    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    const set = await this.setSchema.findOneAndUpdate(queryMatch, { status: Status.DELETED })

    if (!set)
      throw new NotFoundException()

    return

  }

  /*------------------------------------\
  |                Tasks                |
  \------------------------------------*/

  async createTask(setId: ObjectId, createTaskDto: CreateTaskDto, user: JwtUserDto): Promise<ResponseTask> {

    const task: TaskDocument = new this.taskSchema({ ...createTaskDto })
    const queryMatch: { _id: ObjectId, createdBy?: ObjectId } = { _id: setId }

    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    const incrementType = createTaskDto.type == TaskType.TRUTH ? { $push: { tasks: task }, $inc: { truthCount: 1 } } : { $push: { tasks: task }, $inc: { daresCount: 1 } }

    const set: SetDocument = await this.setSchema.findOneAndUpdate(queryMatch, incrementType, { new: true })

    if (!set)
      throw new NotFoundException()

    return {
      _id: task._id,
      currentPlayerGender: task.currentPlayerGender,
      type: task.type,
      message: task.message
    }

  }

  // Depending on the updateTaskDto: message, type and currentPlayerGender are updated
  async updateTask(setId: ObjectId, taskId: ObjectId, updateTaskDto: UpdateTaskDto, user: JwtUserDto): Promise<UpdatedCounts> {

    const queryMatch: { _id: ObjectId, 'tasks._id': ObjectId, createdBy?: ObjectId } = { _id: setId, 'tasks._id': taskId }
    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    let queryUpdate = { 'tasks.$.type': updateTaskDto.type, 'tasks.$.message': updateTaskDto.message, 'tasks.$.currentPlayerGender': updateTaskDto.currentPlayerGender }

    const set = await this.setSchema.findOneAndUpdate(queryMatch, queryUpdate, { new: true })

    if (!set)
      throw new NotFoundException()

    const updatedResult = await this.updateCounts(setId)

    return updatedResult
  }

  async removeTask(setId: ObjectId, taskId: ObjectId, deleteType: string, user: JwtUserDto): Promise<UpdatedCounts> {

    // Hard delete
    if (deleteType === 'hard') {
      if (user.role != 'admin')
        throw new ForbiddenException()

      const set = await this.setSchema.findOneAndUpdate({ _id: setId }, { $pull: { tasks: { _id: taskId } } })

      if (!set) {
        throw new NotFoundException
      }

      const updatedResult = await this.updateCounts(setId)

      return updatedResult

    }

    // Soft delete
    const queryMatch: { _id: ObjectId, 'tasks._id': ObjectId, createdBy?: ObjectId } = { _id: setId, 'tasks._id': taskId }
    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    const set = await this.setSchema.findOneAndUpdate(queryMatch, { 'tasks.$.status': Status.DELETED })

    if (!set)
      throw new NotFoundException()

    const updatedResult = await this.updateCounts(setId)

    return updatedResult

  }


  /*------------------------------------\
  |               Helpers               |
  \------------------------------------*/


  private onlyActiveTasks(set: (ResponseSet & { tasks: ResponseTaskWithStatus[] })): ResponseSetWithTasks {

    const reducedTasks: ResponseTask[] = [];

    // Iterate over the tasks array and only push those that are active
    set.tasks.forEach((task) => {
      if (task.status === Status.ACTIVE) {
        reducedTasks.push({
          currentPlayerGender: task.currentPlayerGender,
          _id: task._id,
          type: task.type,
          message: task.message
        })
      }
    })

    return {
      ...set,
      tasks: reducedTasks
    }
  }

  // Uses 2 additional database calls to update the task counts and return the new settings
  private async updateCounts(setId: ObjectId): Promise<UpdatedCounts> {

    // Recounts the active truths and dares, projects the new counts and merges them back into the existing document
    const update = await this.setSchema.aggregate([
      {
        '$match': {
          '_id': new Types.ObjectId(setId.toString())
        }
      }, {
        '$set': {
          'daresCount': {
            '$size': {
              '$filter': {
                'input': '$tasks',
                'as': 'a',
                'cond': {
                  '$and': [
                    {
                      '$eq': [
                        '$$a.type', 'dare'
                      ]
                    }, {
                      '$eq': [
                        '$$a.status', 'active'
                      ]
                    }
                  ]
                }
              }
            }
          },
          'truthCount': {
            '$size': {
              '$filter': {
                'input': '$tasks',
                'as': 'a',
                'cond': {
                  '$and': [
                    {
                      '$eq': [
                        '$$a.type', 'truth'
                      ]
                    }, {
                      '$eq': [
                        '$$a.status', 'active'
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      }, {
        '$project': { _id: 1, truthCount: 1, daresCount: 1 }
      }, {
        '$merge': {
          'into': 'sets',
          'on': '_id',
          'whenMatched': 'merge',
          'whenNotMatched': 'discard'
        }
      }
    ])
    // Since the aggregation has no return value, We have to make another call to get the updated data 
    const result = await this.setSchema.findById(setId, { _id: 1, truthCount: 1, daresCount: 1 })
    if (!result)
      throw new InternalServerErrorException

    return {
      _id: result._id,
      truthCount: result.truthCount,
      daresCount: result.daresCount
    }
  }

  // Migrations / Seeder
  public async createExampleSets(user: JwtUserDto) {

    SetSampleData.forEach(async (setData) => {
      const set = await this.createSet({
        name: setData.name,
        language: setData.language
      }, user)
      setData.tasks.forEach(async (task) => {
        await this.createTask(set._id, {
          type: task.type,
          currentPlayerGender: task.currentPlayerGender,
          message: task.message
        }, user)
      })
    })

    return {
      statusCode: 201,
      message: "Sample data created"
    }
  }
}