import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ObjectId, SchemaTypes, Document } from 'mongoose';
import { Status } from "../../shared/enums/status.enum";
import { Language } from "../../shared/enums/language.enum";
import { Task, TaskSchema } from "./task.entity";

@Schema({ timestamps: true })
export class Set {
    @Prop({ required: true, index: true })
    name: string

    @Prop({ required: false, type: [{ type: TaskSchema}] })
    tasks: Task[]

    @Prop({ default: Status.ACTIVE })
    status: Status | Status.ACTIVE

    @Prop({ default: "", index: true })
    description: string

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    createdBy: ObjectId

    @Prop({ required: true })
    language: Language

    @Prop({ default: 0 })
    truthCount: number

    @Prop({ default: 0 })
    daresCount: number
}

export type SetDocument = Set & Document
export const SetSchema = SchemaFactory.createForClass(Set)

