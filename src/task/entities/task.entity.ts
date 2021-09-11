import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, SchemaTypes, Types } from "mongoose";
import { Factory } from "nestjs-seeder";
import { CurrentPlayerGender } from "../enums/currentplayergender.enum";
import { Language } from "../../shared/enums/language.enum";
import { TaskStatus } from "../enums/taskstatus.enum";
import { TaskType } from "../enums/tasktype.enum";

/*
DISCLAIMER!
When altering this please also update the interface used as the return type for task creation.
Ignoring this would lead to incomplete data being returned to the client.
*/

// Check
@Schema({ _id: false })
export class TaskContent {
    @Factory('@ca')
    @Prop({ default: CurrentPlayerGender.ANYONE })
    currentPlayerGender: CurrentPlayerGender

    @Prop({ default: 0 })
    maleCount: number

    @Prop({ default: 0 })
    femaleCount: number

    @Prop({ default: 0 })
    anyoneCount: number

    @Factory(faker => faker.lorem.sentence(10))
    @Prop({ required: true, index: true })
    message: string
}

export const TaskContentSchema = SchemaFactory.createForClass(TaskContent)

@Schema({ timestamps: true })
export class Task {
    @Factory('en')
    @Prop({ required: true })
    language: Language

    @Factory('en')
    @Prop({ required: true })
    type: TaskType

    @Factory((faker) => ({
        currentPlayerGender: '@ca',
        message: faker.lorem.sentence(10)
    }))
    @Prop({ type: TaskContentSchema, required: true })
    content: TaskContent

    @Factory(() => Types.ObjectId())
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    author: ObjectId

    @Prop({ default: 0 })
    likes: number | 0

    @Prop({ default: 0 })
    dislikes: number | 0

    @Prop({ default: 0 })
    difference: number | 0

    @Factory('active')
    @Prop({ default: TaskStatus.ACTIVE })
    status: TaskStatus | TaskStatus.ACTIVE
}

export type TaskDocument = Task & Document
export const TaskSchema = SchemaFactory.createForClass(Task)
// doesn't work in nestjs/mongoose currently
// TaskSchema.pre('deleteOne', async function(next) {
//     console.log('middleware is called')
//     const task = this
//     await task.model('SetDocument').findById(Types.ObjectId("611adde031fc65699861a11e"))
//     return next()
// })
//$pullAll: { 'taskList': Types.ObjectId(task.id.toString()) }