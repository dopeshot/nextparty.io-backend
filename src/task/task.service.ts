import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskContent, TaskDocument, TaskSchema, TaskContentSchema } from './entities/task.entity';
import { TaskStatus } from './enums/taskstatus.enum';

@Injectable()
export class TaskService {
  constructor(@InjectModel('Task') private taskSchema: Model<TaskDocument>) { }
  
  // Creates a new Task and checks if the message content accounts for extra user interaction
  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    try {
      const task = new this.taskSchema({
        ...createTaskDto
      })
      this.parseForPersonCounts(task)
      const result = await task.save()

      return result
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }

  // Returns all Tasks
  async findAll(): Promise<TaskDocument[]> {
    return await this.taskSchema.find()
  }

  // Returns the Task with matching id
  async findOne(id: ObjectId): Promise<TaskDocument> {
    let task = await this.taskSchema.findById(id).lean()
    if (!task)
      throw new NotFoundException()

    return task;
  }

  // Updates the content language and type of a Task
  async update(id: ObjectId, updateTaskDto: UpdateTaskDto): Promise<TaskDocument> {

    // Find Object
    let task = await this.taskSchema.findById(id)
    //console.log(task)
    if (!task) { throw new NotFoundException() }

    //console.log(updateTaskDto)
    try {
      if (updateTaskDto.content.hasOwnProperty("message")) { task.content.message = updateTaskDto.content.message; this.parseForPersonCounts(task) }
      if (updateTaskDto.content.hasOwnProperty("currentPlayerGender")) { task.content.currentPlayerGender = updateTaskDto.content.currentPlayerGender }
      if (updateTaskDto.hasOwnProperty("language")) { task.language = updateTaskDto.language }
      if (updateTaskDto.hasOwnProperty("type")) { task.type = updateTaskDto.type }

    } catch (error) {throw new UnprocessableEntityException }
    const result = await task.save()

    return result;
  }

  // Up- Downvotes a Task
  async vote(id: ObjectId, vote: string): Promise<TaskDocument> {
    // Find Object
    let task = await this.taskSchema.findById(id)
    console.log(task)
    if (!task) { throw new NotFoundException() }

    // Query check
    const isUpvote = vote ? vote.includes('upvote') : false
    const isDownvote = vote ? vote.includes('downvote') : false

    // Handle vote
    if (isUpvote) { task.likes += 1 }
    if (isDownvote) { task.dislikes += 1 }

    return await task.save()
  }

  async remove(id: ObjectId, type: string): Promise<void> {
    // Check query
    const isHardDelete = type ? type.includes('hard') : false

    // true is for admin check later
    if (true && isHardDelete) {
      // Check if there is a task with this id and remove it
      const task = await this.taskSchema.findByIdAndDelete(id)
      if (!task)
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
    if (!task)
      throw new NotFoundException()
  }

  private parseForPersonCounts(task: Task): void {
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

