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

    async search(searchString: string, page: number, limit: number, type = 'all') {
        if (searchString.length < 3) { return "Search too short";throw new Error('Search too short') }
        const subStrings = searchString.toLowerCase().split(" ")

        // all the variables setup
        const skip = page * limit
        limit += skip

        let taskResult = []
        let setResult = []
        let userResult = []
        let regexQuery = []

        if (type == 'all' || type == 'task') {
            // Find in tasks content.message
            // Only return active objects
            regexQuery.push({ status: 'active' })
            // Build a regex search for every substring
            subStrings.forEach(string => {
                regexQuery.push({ 'content.message': { $regex: RegExp(string), $options: 'i' } })
            })

            taskResult = await this.taskSchema.aggregate([{ $match: { $and: regexQuery } }, { $limit: limit }, { $skip: skip }])
            if (type == 'task') {
                return {
                    tasks: {
                        itemsCount: taskResult.length,
                        items: taskResult
                    }
                }
            }
        }

        if (type == 'all' || type == 'set') {
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
            setResult = await this.setSchema.aggregate([{ $unset: 'taskList' }, { $match: { $or: [{ $and: extraRegexQuery }, { $and: regexQuery }] } }, { $limit: limit }, { $skip: skip }])
            // Consider also searching through the name with $or

            if (type == 'set') {
                return {
                    sets: {
                        itemsCount: setResult.length,
                        items: setResult
                    }
                }
            }
        }

        if (type == 'all' || type == 'user') {
            regexQuery = [] // Setting below line as initial creates conflicts with adding new different object types into the array
            // Only return active objects
            regexQuery.push({ status: 'active' })
            // Build a regex search for every substring
            subStrings.forEach(string => {
                regexQuery.push({ username: { $regex: RegExp(string), $options: 'i' } })
            })
            userResult = await this.userSchema.aggregate([{ $match: { $and: regexQuery } }, { $limit: limit }, { $skip: skip },{$unset: 'password'}])

            if (type == 'user') {
                return {
                    users: {
                        itemsCount: userResult.length,
                        items: userResult
                    }
                }
            }
        }


        if (type == 'all') {
            return {
                tasks: {
                    itemsCount: taskResult.length,
                    items: taskResult
                },
                sets: {
                    itemsCount: setResult.length,
                    items: setResult
                },
                users: {
                    itemsCount: userResult.length,
                    items: userResult
                }
            }
        }
    }
}