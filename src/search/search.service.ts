import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { SetDocument } from 'src/set/entities/set.entity';
import { UserDocument } from 'src/user/entities/user.entity';
import { Task, TaskContent, TaskDocument, TaskSchema, TaskContentSchema } from '../task/entities/task.entity';
import { SearchDto } from './dto/search.dto';


@Injectable()
export class SearchService {
    constructor(@InjectModel('Set') private setSchema: Model<SetDocument>,
        @InjectModel('Task') private taskSchema: Model<TaskDocument>,
        @InjectModel('User') private userSchema: Model<UserDocument>) { }

    async search(searchString: string) {
        if (searchString.length < 3) { throw new UnprocessableEntityException }
        const subStrings = searchString.toLowerCase().split(" ")

        // Find in tasks content.message
        let regexQuery = []
        // Only return active objects
        regexQuery.push({ status: 'active' })
        // Build a regex search for every substring
        subStrings.forEach(string => {
            regexQuery.push({ 'content.message': { $regex: RegExp(string), $options: 'i' } })
        })

        const taskResult = await this.taskSchema.find({ $and: regexQuery })

        // Find in sets name and description without the taskList!
        regexQuery = [] // Setting below line as initial creates conflicts with adding new different object types into the array
        // Only return active objects
        regexQuery.push({ status: 'active' })
        // Build a regex search for every substring
        subStrings.forEach(string => {
            regexQuery.push({ description: { $regex: RegExp(string), $options: 'i' } })
        })
        // Also checking name
        let extraRegexQuery = []
        extraRegexQuery.push({ status: 'active' })
        subStrings.forEach(string => {
            extraRegexQuery.push({ name: { $regex: RegExp(string), $options: 'i' } })
        })
        const setResult = await this.setSchema.aggregate([{ $unset: 'taskList' }, { $match: { $or: [{ $and: extraRegexQuery }, { $and: regexQuery }] } }])
        // Consider also searching through the name with $or


        regexQuery = [] // Setting below line as initial creates conflicts with adding new different object types into the array
        // Only return active objects
        regexQuery.push({ status: 'active' })
        // Build a regex search for every substring
        subStrings.forEach(string => {
            regexQuery.push({ username: { $regex: RegExp(string), $options: 'i' } })
        })
        const userResult = await this.userSchema.aggregate([{ $match: { $and: regexQuery } }])

        return {
            task: {
                itemsCount: taskResult.length,
                items: taskResult
            },
            set: {
                itemsCount: setResult.length,
                items: setResult
            },
            user: {
                itemsCount: userResult.length,
                items: userResult
            }
        }
    }
}
