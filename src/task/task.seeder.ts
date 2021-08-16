import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DataFactory, Seeder } from "nestjs-seeder";
import { Task, TaskDocument } from "./entities/task.entity";

@Injectable()
export class TaskSeeder implements Seeder {
    constructor(@InjectModel('Task') private readonly task: Model<TaskDocument>) {}

    async seed(): Promise<any> {
        const tasks = DataFactory.createForClass(Task).generate(100000)

        return this.task.insertMany(tasks)
    }
    async drop(): Promise<any> {
        return this.task.deleteMany()
    }

}