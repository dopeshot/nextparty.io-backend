import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId, Types } from 'mongoose'
import { AnyARecord } from 'node:dns'
import { JwtUserDto } from 'src/auth/dto/jwt.dto'
import { CreateTaskDto } from './dto/create-task.dto'
import { VoteType } from './dto/task-vote-dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task, TaskDocument } from './entities/task.entity'
import { TaskStatus } from './enums/taskstatus.enum'

@Injectable()
export class TaskService {
    // Constructor
    constructor(@InjectModel('Task') private taskSchema: Model<TaskDocument>) { }

    // Creates a new Task and checks if the message content accounts for extra user interaction
    async create(createTaskDto: CreateTaskDto, creator: JwtUserDto): Promise<Task> {
        try {
            const task: TaskDocument = new this.taskSchema({
                ...createTaskDto,
                author: creator.userId
            })
            this.countPersons(task)
            const result: Task = await task.save()

            return result
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }

    // Returns all Tasks
    async findAll(page: number, limit: number): Promise<any> {
        const documentCount = await this.taskSchema.estimatedDocumentCount()
        const pageCount = Math.floor(documentCount / limit)

        if (page > pageCount)
            throw new NotFoundException()

        const previous = page - 1 >= 0 ? page - 1 : null
        const next = page + 1 < pageCount ? page + 1 : null

        //console.time()
        //const tasks = await this.taskSchema.find().limit(limit + limit*page).skip(limit * page)

        const tasks = await this.taskSchema.aggregate([
            {
                $limit: limit + limit * page
            }, {
                $skip: limit * page
            }

        ])
        //console.timeEnd()

        return {
            paging: {
                documentCount,
                pageCount,
                ...previous !== null && { previousPage: previous },
                currentPage: page,
                ...next && { nextPage: next }
            },
            tasks
        }
    }

    // Returns the Task with matching id
    async findOne(id: ObjectId): Promise<Task> {
        let task: TaskDocument = await this.taskSchema.findById(id)
        if (!task) throw new NotFoundException(`There is no task with the id ${id}`)

        return task
    }

    async findTop10Tasks(): Promise<TaskDocument[]> {
        const topTasks = await this.taskSchema.aggregate([
            {
                $sort: {
                    difference: -1, '_id': 1
                },
            },
            {
                $limit: 10,
            }
        ])
        return topTasks
    }

    async userTasks(id: ObjectId, page: number, limit: number) {
        let userSets = await this.taskSchema.aggregate([
            {
                '$match': {
                    'author': Types.ObjectId(id.toString())
                }
            }, {
                $skip: page * limit
            }, {
                $limit: limit
            }
        ])
        return userSets
    }

    // Updates the content language and type of a Task
    async update(id: ObjectId, updateTaskDto: UpdateTaskDto, user: JwtUserDto): Promise<Task> {
        // Find Object
        let task = await this.taskSchema.findById(id)

        if (!task)
            throw new NotFoundException()

        // Check if User is Creator of Task or Admin
        if (!(user.userId == task.author || user.role == "admin"))
            throw new ForbiddenException()

        try {
            if (updateTaskDto.content.hasOwnProperty('message')) {
                task.content.message = updateTaskDto.content.message
                this.countPersons(task)
            }
            if (updateTaskDto.content.hasOwnProperty('currentPlayerGender')) {
                task.content.currentPlayerGender = updateTaskDto.content.currentPlayerGender
            }
            if (updateTaskDto.hasOwnProperty('language')) {
                task.language = updateTaskDto.language
            }
            if (updateTaskDto.hasOwnProperty('type')) {
                task.type = updateTaskDto.type
            }
        } catch (error) {
            throw new UnprocessableEntityException()
        }

        const result = await task.save()
        return result
    }

    // Up- Downvotes a Task
    async vote(id: ObjectId, vote: VoteType): Promise<Task> {
        // Find Object
        let task = await this.taskSchema.findById(id)

        if (!task) throw new NotFoundException()

        // Query check
        const isUpvote = vote && vote === 'upvote'
        const isDownvote = vote && vote === 'downvote'

        // Handle vote
        if (isUpvote) {
            task.likes += 1;
            task.difference++
        }

        if (isDownvote) {
            task.dislikes += 1;
            task.difference--
        }

        return await task.save()
    }

    async remove(id: ObjectId, type: string, user: JwtUserDto): Promise<void> {
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

        task = await this.taskSchema.findByIdAndUpdate(id, { status: TaskStatus.DELETED }, { new: true })
    }

    /*-------------------------------------------------------|
    |                     Logic Helpers                      |
    | -------------------------------------------------------*/

    private countPersons(task: Task): void {
        const maleCountSymbol = "@m"
        const femaleCountSymbol = "@f"
        const anyoneCountSymbol = "@a"
        task.content.maleCount = this.countOccurrence(task.content.message, maleCountSymbol)
        task.content.femaleCount = this.countOccurrence(task.content.message, femaleCountSymbol)
        task.content.anyoneCount = this.countOccurrence(task.content.message, anyoneCountSymbol)
    }

    private countOccurrence(string: string, substring: string): number {
        return string.split(substring).length - 1
    }

}
