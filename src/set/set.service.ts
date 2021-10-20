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
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
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

  // Up- Downvotes a Task
  async vote(id: ObjectId, vote: string): Promise<SetDocument> {
    // Find Object
    let set = await this.setSchema.findById(id)
    if (!set) { throw new NotFoundException() }

    // Query check
    const isUpvote = vote && vote === 'upvote'
    const isDownvote = vote && vote === 'downvote'

    // Handle vote
    if (isUpvote) {
      set.likes += 1;
      set.difference++
    }

    if (isDownvote) {
      set.dislikes += 1;
      set.difference--
    }

    return await set.save()
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

  async getTasks(id: ObjectId, page: number) {

    const isPaged = page ? true : false
    //console.time()
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
    //console.timeEnd()
    return taskList
  }

  async getTasks2(id: ObjectId, page: number, limit: number): Promise<Set> {
    const skip = page * limit
    limit += skip
    const idd = id.toString()
    const set: Set = await this.setSchema.findById(id).populate('taskList')
    //console.time()
    /*const result = await this.setSchema.aggregate([
      { '$match': { '_id': Types.ObjectId(idd) } },
      {
        '$lookup': {
          'from': 'tasks',
          'localField': 'taskList',
          'foreignField': '_id',
          'pipeline': [
            {
              '$sort': {
                'difference': -1, '_id': 1
              }
            }, {
              '$skip': skip
            }, {
              '$limit': limit
            }
          ],
          'as': 'objects'
        }
      }, {
        '$project': {
          'objects': 1
        }
      }
    ])*/

    //console.timeEnd()
    //if (result.length == 0) { throw new NotFoundException }
    return set
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

  async healthCheck(user: JwtUserDto) {
    if (user.role != 'admin')
      throw new ForbiddenException()
    // TODO: if(true) shoudln't be in production
    if (true) {
      let taskIdsInSets = []
      // Get all referenced task ids
      const result = await this.setSchema.aggregate([
        {
          '$project': {
            'taskList': 1
          }
        }
      ])

      // Map all elements in one row
      result.forEach(set => taskIdsInSets.push(...set.taskList.map(x => x.toString())))

      // Delete duplicates of taskIds here
      taskIdsInSets.filter((item, index) => taskIdsInSets.indexOf(item) != index)

      // Get the existing task ids that are referenced in a Set
      const result2 = await this.taskSchema.aggregate([
        {
          '$match': {
            '_id': {
              '$in': [...taskIdsInSets.map(x => Types.ObjectId(x.toString()))]
            }
          }
        }, {
          '$project': {
            '_id': 1
          }
        }
      ])

      let existingIdsInTasks = []
      // Getting ids from result2 Object into
      result2.forEach(set => existingIdsInTasks.push(set._id.toString()))

      // Filtering out the ids that don't actually exist
      let nonExistingTaskIds = taskIdsInSets.filter(x => existingIdsInTasks.indexOf(x) === -1);

      // Deleting the ids that don't actually exist but are in Sets
      const finalResult = await this.setSchema.updateMany(
        {
          $pullAll: {
            taskList: [...nonExistingTaskIds.map(x => Types.ObjectId(x.toString()))]
          }
        })
      console.log(finalResult)
      return finalResult
    }
    const result = await this.setSchema.aggregate(
      [
        {
          '$lookup': {
            'from': 'tasks',
            'let': {
              'taskList': '$taskList'
            },
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$in': [
                      '$_id', '$$taskList'
                    ]
                  }
                }
              }
            ],
            'as': 'valid'
          }
        }, {
          '$addFields': {
            'valid': {
              '$map': {
                'input': '$valid',
                'as': 'v',
                'in': '$$v._id'
              }
            }
          }
        }, {
          '$addFields': {
            'taskList': {
              '$filter': {
                'input': '$taskList',
                'as': 't',
                'cond': {
                  '$in': [
                    '$$t', '$valid'
                  ]
                }
              }
            }
          }
        }, {
          '$unset': [
            'valid'
          ]
        }
      ]
    )

    return result
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