import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { Status } from '../shared/enums/status.enum';
import { PaginationPayload } from '../shared/interfaces/paginationPayload.interface';
import { SharedService } from '../shared/shared.service';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Set, SetDocument } from './entities/set.entity';

@Injectable()
export class SetService {
  constructor(
    @InjectModel('Set') private setSchema: Model<SetDocument>,
    private readonly sharedService: SharedService
  ) { }

  async create(metaData: CreateSetDto, user: JwtUserDto): Promise<SetDocument> {
    try {
      const set = new this.setSchema({
        createdBy: user.userId,
        ...metaData
      })
      const result = await set.save()

      return result
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }

  async findAll(page: number, limit: number): Promise<PaginationPayload<Set>> {
    const documentCount = await this.setSchema.estimatedDocumentCount()
    const sets: Set[] = await this.setSchema.find().limit(limit).skip(limit * page)

    return this.sharedService.createPayloadWithPagination(documentCount, page, limit, sets)
  }

  async findOne(id: ObjectId): Promise<Set> {
    const set = await this.setSchema.findById(id).populate('createdBy', 'username _id')
    if (!set)
      throw new NotFoundException()
    return set;
  }

  async userSets(id: ObjectId, page: number, limit: number) {
    let userSets = await this.setSchema.aggregate([
      {
        '$match': {
          'creator': Types.ObjectId(id.toString())
        }
      }, {
        $skip: page * limit
      }, {
        $limit: limit
      }
    ])
    return userSets
  }

  async updateMetadata(id: ObjectId, updateSetDto: UpdateSetDto, user: JwtUserDto) {
    // Find Object
    let set = await this.setSchema.findById(id)

    if (!set)
      throw new NotFoundException()

    // Check if user is Creator of set or Admin
    if (!(user.userId == set.createdBy || user.role == "admin"))
      throw new ForbiddenException()

    try {
      if (updateSetDto.hasOwnProperty("description"))
        set.description = updateSetDto.description
      if (updateSetDto.hasOwnProperty("name"))
        set.name = updateSetDto.name
    } catch (error) {
      throw new UnprocessableEntityException()
    }
    const result = await set.save()

    return result;
  }

  /**
    * Delete set: If type is hard ==> hard delete, If type is soft or anything else => soft delete
    * @param id of the set
    * @param type soft/anything else or hard delete
  */
  async remove(id: ObjectId, type: string, user: JwtUserDto): Promise<void> {
    let set = await this.setSchema.findById(id)

    if (!set)
      throw new NotFoundException()

    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    if (isHardDelete) {
      if (user.role != 'admin')
        throw new ForbiddenException()

      try {
        // Check if there is a set with this id and remove it
        const set = await this.setSchema.findByIdAndDelete(id)

        // We have to return here to exit process
        return
      } catch (error) {
        throw new InternalServerErrorException()
      }
    }

    // Soft delete
    // Check if user is Creator of set or Admin
    if (!(user.userId == set.createdBy || user.role == "admin"))
      throw new ForbiddenException()

    set = await this.setSchema.findByIdAndUpdate(id, {
      status: Status.DELETED
    }, {
      new: true
    })
  }

  async getTasks2(id: ObjectId, page: number, limit: number): Promise<Set> {
    const skip = page * limit
    limit += skip
    const set: Set = await this.setSchema.findById(id).populate('taskList')

    return set
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

  //REWORK=====================================================================================
  // Creates a new Task and checks if the message content accounts for extra user interaction
  async createTask(createTaskDto: CreateTaskDto, creator: JwtUserDto, set: ObjectId): Promise<any> {
  }

  //REWORK=====================================================================================
  // Updates the content language and type of a Task
  async updateTask(id: ObjectId, updateTaskDto: UpdateTaskDto, user: JwtUserDto): Promise<any> {
    // Find Object
    let task = await this.taskSchema.findById(id)

    if (!task)
      throw new NotFoundException()

    // // Check if User is Creator of Task or Admin
    // if (!(user.userId == task.author || user.role == "admin"))
    //     throw new ForbiddenException()

    // try {
    //     if (updateTaskDto.content.hasOwnProperty('message')) {
    //         task.content.message = updateTaskDto.content.message
    //         this.countPersons(task)
    //     }
    //     if (updateTaskDto.content.hasOwnProperty('currentPlayerGender')) {
    //         task.content.currentPlayerGender = updateTaskDto.content.currentPlayerGender
    //     }
    //     if (updateTaskDto.hasOwnProperty('language')) {
    //         task.language = updateTaskDto.language
    //     }
    //     if (updateTaskDto.hasOwnProperty('type')) {
    //         task.type = updateTaskDto.type
    //     }
    // } catch (error) {
    //     throw new UnprocessableEntityException()
    // }

    const result = await task.save()
    return result
  }

  //REWORK=====================================================================================
  async removeTask(id: ObjectId, type: string, user: JwtUserDto): Promise<void> {
    let task = await this.taskSchema.findById(id)

    if (!task)
      throw new NotFoundException()

    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    if (isHardDelete) {
      if (user.role != "admin")
        throw new ForbiddenException()

      // Check if there is a task with this id and remove it
      try {
        const task = await this.taskSchema.findByIdAndDelete(id)
      }
      catch (error) {
        throw new InternalServerErrorException()
      }
      // We have to return here to exit process
      return
    }

    // Soft delete
    // Check if User is Creator of Task or Admin
    if (!(user.userId == task.author || user.role == "admin"))
      throw new ForbiddenException()

    task = await this.taskSchema.findByIdAndUpdate(id, { status: Status.DELETED }, { new: true })
  }
}