import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task, TaskDocument } from './entities/task.entity'
import { TaskStatus } from './enums/taskstatus.enum'

@Injectable()
export class TaskService {
    // Constructor
    constructor(@InjectModel('Task') private taskSchema: Model<TaskDocument>) {}

    // Creates a new Task and checks if the message content accounts for extra user interaction
    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        try {
            const task: TaskDocument = new this.taskSchema({
                ...createTaskDto,
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

		if(page > pageCount)
			throw new NotFoundException()

		const previous = page - 1 >= 0 ? page - 1: null
		const next = page + 1 < pageCount ? page + 1: null

		const tasks = await this.taskSchema.find().limit(limit).skip(limit * page)

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
        if (!task) throw new NotFoundException()

        return task
    }

    async findTop10Tasks(): Promise<TaskDocument[]> {
        const topTasks = await this.taskSchema.aggregate([
            {
                $addFields: {
                    difference: {
                        $subtract: ['$likes', '$dislikes'],
                    },
                },
            },
            {
                $sort: {
                    difference: -1, '_id': 1
                },
            },
            {
                $limit: 10,
            },
        ])
        return topTasks
    }

    // Updates the content language and type of a Task
    async update(
        id: ObjectId,
        updateTaskDto: UpdateTaskDto,
    ): Promise<TaskDocument> {
        // Find Object
        let task = await this.taskSchema.findById(id)
        //console.log(task)
        if (!task) {
            throw new NotFoundException()
        }

        //console.log(updateTaskDto)
        try {
            if (updateTaskDto.content.hasOwnProperty('message')) {
                task.content.message = updateTaskDto.content.message
                this.countPersons(task)
            }
            if (updateTaskDto.content.hasOwnProperty('currentPlayerGender')) {
                task.content.currentPlayerGender =
                    updateTaskDto.content.currentPlayerGender
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
    async vote(id: ObjectId, vote: string): Promise<TaskDocument> {
        // Find Object
        let task = await this.taskSchema.findById(id)

        if (!task) throw new NotFoundException()

        // Query check
        const isUpvote = vote && vote === 'upvote'
        const isDownvote = vote && vote === 'downvote'

        // Handle vote
        if (isUpvote) task.likes += 1

        if (isDownvote) task.dislikes += 1

        return await task.save()
    }

    async remove(id: ObjectId, type: string): Promise<void> {
        // Check query
        const isHardDelete = type ? type.includes('hard') : false

        // true is for admin check later
        if (true && isHardDelete) {
            // Check if there is a task with this id and remove it
            const task = await this.taskSchema.findByIdAndDelete(id)
            if (!task) throw new NotFoundException()

            // We have to return here to exit process
            return
        }

        // Soft delete
        const task = await this.taskSchema.findByIdAndUpdate(
            id,
            {
                status: TaskStatus.DELETED,
            },
            {
                new: true,
            },
        )
        if (!task) throw new NotFoundException()
    }

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
