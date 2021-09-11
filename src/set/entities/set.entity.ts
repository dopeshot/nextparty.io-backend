import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ObjectId, SchemaTypes, Document } from 'mongoose';
import { Status } from "../../shared/enums/status.enum";
import { Language } from "../../shared/enums/language.enum";

@Schema({ timestamps: true })
export class Set {
    @Prop({ required: true, index: true })
    name: string

    @Prop({ required: true, type: [{ type: SchemaTypes.ObjectId, ref: 'Task' }] })
    taskList: ObjectId[]

    @Prop({ default: Status.ACTIVE })
    status: Status | Status.ACTIVE

    @Prop({ default: "", index: true })
    description: string

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    createdBy: ObjectId

    @Prop({ default: 0 })
    likes: number | 0

    @Prop({ default: 0 })
    dislikes: number | 0

    @Prop({ default: 0 })
    difference: number | 0

    @Prop({ required: true })
    language: Language

    @Prop({ default: 0 })
    truthCount: number

    @Prop({ default: 0 })
    daresCount: number

    /*
    @Prop({ type: Schema.Types.ObjectId, ref: 'TaskImages' })
    image: TaskImages
    */
}

export type SetDocument = Set & Document
export const SetSchema = SchemaFactory.createForClass(Set)

