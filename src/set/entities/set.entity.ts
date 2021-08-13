import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { SetStatus } from '../enums/setstatus.enum'
import { ObjectId, SchemaTypes } from 'mongoose';
import { Language } from "../enums/language.enum";

@Schema({ timestamps: true })
export class Set {

    @Prop({ required: true})
    name: string
  
    @Prop({ required: true, type: [{ type: SchemaTypes.ObjectId, ref: 'Task' }]})
    taskList: ObjectId[]
    
    @Prop({ default: SetStatus.ACTIVE })
    status: SetStatus | SetStatus.ACTIVE

    @Prop()
    description: string

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    creator: ObjectId

    @Prop({ default: 0 })
    likes: number | 0

    @Prop({ default: 0 })
    dislikes: number | 0

    @Prop()
    language: Language

    /*
    @Prop({ type: Schema.Types.ObjectId, ref: 'TaskImages' })
    image: TaskImages
    */
}

export type SetDocument = Set & Document
export const SetSchema = SchemaFactory.createForClass(Set)

