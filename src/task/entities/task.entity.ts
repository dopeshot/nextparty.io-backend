import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { User } from "src/user/entities/user.entity"

import { Language } from "../enums/language.enum"
import { TaskType } from "../enums/tasktype.enum"
import { TaskStatus } from "../enums/taskstatus.enum"

@Schema({ timestamps: true })
export class Task {
    @Prop({required: true})
    lang: Language

    @Prop({required: true})
    type: TaskType

    @Prop({required: true})
    task: string

    @Prop({required: true})
    author: User

    @Prop()
    votes: any // Standard should be 0, then +x and -x

    @Prop({default: TaskStatus.NORMAL})
    status: TaskStatus
}

export type TaskDocument = Task & Document
export const TaskSchema = SchemaFactory.createForClass(Task)
