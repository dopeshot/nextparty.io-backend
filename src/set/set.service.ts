import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, ObjectId, Types } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { Status } from '../shared/enums/status.enum';
import { SharedService } from '../shared/shared.service';
import { Role } from '../user/enums/role.enum';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Set, SetDocument } from './entities/set.entity';
import { TaskDocument } from './entities/task.entity';
import { AggregationSetWithTasks } from './types/set.aggregation';
import { ResponseSet, ResponseSetWithTasks, ResponseTask, ResponseUpdatedSet } from './types/set.response';

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
        }
      }

    } catch (error) {
      if (error.code = '11000') {
        throw new ConflictException('This table number already exists')
      }
      console.error(error)
      throw new InternalServerErrorException()
    }
  }

  async getAllSets(): Promise<ResponseSet[]> {

    const sets: ResponseSet[] = await this.setSchema.aggregate([
      {
        $match: {
          'status': Status.ACTIVE
        }
      }, {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy"
        }
      }, {
        $unwind: '$createdBy'
      }, {
        $project: {
          '_id': 1,
          'daresCount': 1,
          'truthCount': 1,
          'name': 1,
          'language': 1,
          'createdBy.username': 1,
          'createdBy._id': 1
        }
      }
    ])

    return sets

  }

  /**
   * Returns every Set in the Database no matter the status for admin purposes
   * @param user that requests all sets
   */
  // async getAllSetsFull(user: JwtUserDto): Promise<Set[]> {
  //   try {
  //     if (user.role !== Role.Admin) {
  //       throw new UnauthorizedException()
  //     }

  //     const sets: Set[] = await this.setSchema.find().populate('createdBy', 'username _id')

  //     return sets
  //   } catch (error) {
  //     console.log(error)
  //     throw new InternalServerErrorException()
  //   }
  // }


  async getOneSet(id: ObjectId): Promise<ResponseSetWithTasks> {
    // This might not be best practice, but the alternitaves don't make the code easier to read
    const sets: AggregationSetWithTasks[] = await this.setSchema.aggregate([
      {
        $match: {
          '_id': Types.ObjectId(id.toString())
        }
      }, {
        $match: {
          'status': Status.ACTIVE
        }
      }, {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy"
        }
      }, {
        $unwind: '$createdBy'
      }, {
        $project: {
          '_id': 1,
          'daresCount': 1,
          'truthCount': 1,
          'name': 1,
          'language': 1,
          'createdBy.username': 1,
          'createdBy._id': 1,
          'tasks': 1
        }
      }

    ])

    if (sets.length === 0)
      throw new NotFoundException()

    // There is only one set if matching with id, aggregation returns arrays per default though
    const set: AggregationSetWithTasks = sets[0]

    // Remove tasks from array that are not active
    const finalSet: ResponseSetWithTasks = this.onlyActiveTasks(set)

    return finalSet;
  }

  /**
   * get One Set Full: Returns full information for admin services
   * @param id of the requested set
   * @param user that requests the set
   */
  // async getOneSetFull(id: ObjectId, user: JwtUserDto): Promise<Set> {
  //   try {
  //     if (user.role !== Role.Admin) {
  //       throw new UnauthorizedException()
  //     }
  //     const set = await this.setSchema.findById(id).populate('createdBy', 'username _id')
  //     if (!set)
  //       throw new NotFoundException()

  //     return set;

  //   } catch (error) {
  //     console.log(error)
  //     throw new InternalServerErrorException()
  //   }
  // }

  /**
   * Get a set without it tasks
   * @param id of the set
   */
  // async getSetMetadata(id: ObjectId) {
  //   try {
  //     const set = await this.setSchema.aggregate([
  //       {
  //         '$match': {
  //           '_id': Types.ObjectId(id.toString())
  //         }
  //       }, {
  //         '$unset': ['tasks']
  //       }
  //     ])

  //     return set

  //   } catch (error) {
  //     console.log(error)
  //     throw new InternalServerErrorException()
  //   }
  // }

  /**
    * get one set:
    * @param id of the user which sets are requested
  */
  // async getSetsByUser(id: ObjectId) {
  //   try {
  //     let userSets = await this.setSchema.aggregate([
  //       {
  //         '$match': {
  //           'createdBy': Types.ObjectId(id.toString())
  //         }
  //       }
  //     ])
  //     return userSets
  //   } catch (error) {
  //     console.log(error)
  //     throw new InternalServerErrorException()
  //   }
  // }

  /**
    * get one set:
    * @param id of the requested set
    * @param updateSetDto contains the updated metaData
    * @param user is the account requesting to patch the set 
  */
  async updateSetMetadata(id: ObjectId, updateSetDto: UpdateSetDto, user: JwtUserDto): Promise<ResponseUpdatedSet> {

    let set: SetDocument
    if (user.role === Role.User) {
      set = await this.setSchema.findOneAndUpdate({ _id: id, createdBy: user.userId }, updateSetDto, { new: true })
    }
    else if (user.role === Role.Admin) {
      set = await this.setSchema.findByIdAndUpdate(id, updateSetDto, { new: true })
    }

    if (!set)
      throw new NotFoundException()

    return {
      _id: set._id,
      daresCount: set.daresCount,
      truthCount: set.truthCount,
      createdBy: set.createdBy,
      language: set.language,
      name: set.name
    }

  }

  /**
    * Delete set: If type is hard ==> hard delete, If type is soft or anything else => soft delete
    * @param id of the set
    * @param type soft/anything else or hard delete
  */
  async deleteSet(id: ObjectId, type: string, user: JwtUserDto): Promise<void> {

    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    // Check if Hard delete is allowed
    if (isHardDelete && user.role != 'admin') {
      throw new ForbiddenException()
    }

    // Hard delete
    if (isHardDelete) {

      // Check if there is a set with this id and remove it
      const set = await this.setSchema.findByIdAndDelete(id)

      if (!set) {
        throw new NotFoundException
      }

      // We have to return here to exit process
      return

    }

    // Soft delete
    if (user.role === Role.User) {
      const set = await this.setSchema.findOneAndUpdate({ _id: id, createdBy: user.userId }, { status: Status.DELETED })
      if (!set)
        throw new NotFoundException('There is no set with this id that belongs to you')
    }
    else if (user.role === Role.Admin) {
      const set = await this.setSchema.findByIdAndUpdate(id, { status: Status.DELETED })
      if (!set)
        throw new NotFoundException()
    }

  }

  // There may be a better method to directly update in the database with pushing to the array (If so adjust the method can be adjusted to 2 ifs and no unesessary db call)
  async createTask(setId: ObjectId, createTaskDto: CreateTaskDto, user: JwtUserDto): Promise<TaskDocument> {
    const set: SetDocument = await this.setSchema.findById(setId)
    if (!set)
      throw new NotFoundException()

    // Check if User is Creator of Set or Admin
    if (!(user.userId == set.createdBy || user.role == "admin"))
      throw new ForbiddenException()

    // Create a new Task
    const task: TaskDocument = new this.taskSchema({ ...createTaskDto })

    // Add Task to the Sets task array
    set.tasks.push(task)

    // Save the Set
    await set.save()
    return task

    //TODO! what to return, has to be the task with id, when is the id generated??
  }

  //REWORK=====================================================================================
  // Updates the content language and type of a Task
  async updateTask(setId: ObjectId, taskId: ObjectId, updateTaskDto: UpdateTaskDto, user: JwtUserDto): Promise<any> {
    // Find Set
    let set = await this.setSchema.findById(setId)

    if (!set)
      throw new NotFoundException()

    // Find if requested Task is in this set

    // Update the tasks data

    // Save the changes


    // // Check if User is Creator of Task or Admin
    // if (!(user.userId == task.createdBy || user.role == "admin"))
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

    const result = await set.save()
    return result
  }

  //REWORK=====================================================================================
  async removeTask(id: ObjectId, taskId: ObjectId, type: string, user: JwtUserDto): Promise<void> {
    let task = await this.setSchema.findById(id)

    if (!task)
      throw new NotFoundException()

    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    if (isHardDelete) {
      if (user.role != "admin")
        throw new ForbiddenException()

      // Check if there is a task with this id and remove it
      try {
        const task = await this.setSchema.findByIdAndDelete(id)
      }
      catch (error) {
        throw new InternalServerErrorException()
      }
      // We have to return here to exit process
      return
    }

    // Soft delete
    // Check if User is Creator of Task or Admin
    if (!(user.userId == task.createdBy || user.role == "admin"))
      throw new ForbiddenException()

    task = await this.setSchema.findByIdAndUpdate(id, { status: Status.DELETED }, { new: true })
  }

  // TODO: type any should be fixed later on
  private onlyActiveTasks(set: AggregationSetWithTasks): ResponseSetWithTasks {

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

    // Remove the old tasks array
    delete set.tasks

    return {
      ...set,
      tasks: reducedTasks
    }
  }
}