import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { User } from "src/user/entities/user.entity"

import { Language } from "../enums/language.enum"
import { TaskType } from "../enums/tasktype.enum"
import { TaskStatus } from "../enums/taskstatus.enum"
import { ContentTaskDto } from "../dto/content-task.dto"
import { ObjectId, SchemaTypes, Document } from "mongoose"
import { CurrentPlayerGender } from "../enums/currentplayergender.enum"

@Schema()
class TaskContent {
    @Prop({ default: CurrentPlayerGender.ANYONE })
    currentPlayerGender: CurrentPlayerGender

    @Prop({ default: 0 })
    maleCount: number

    @Prop({ default: 0 })
    femaleCount: number

    @Prop({ required: true, default: 0 })
    anyoneCount: number

    @Prop({ required: true })
    message: string
}

const TaskContentSchema = SchemaFactory.createForClass(TaskContent)

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    language: Language

    @Prop({ required: true })
    type: TaskType

    @Prop({ type: TaskContentSchema, required: true })
    content: TaskContent

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    author: ObjectId

    @Prop({ default: 0 })
    likes: number | 0

    @Prop({ default: 0 })
    dislikes: number | 0

    @Prop({ default: TaskStatus.ACTIVE })
    status: TaskStatus | TaskStatus.ACTIVE
}

export type TaskDocument = Task & Document
export const TaskSchema = SchemaFactory.createForClass(Task)
