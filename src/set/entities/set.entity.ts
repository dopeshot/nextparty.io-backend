import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { Status } from '../enums/status.enum'
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Set {
    @Prop({ required: true})
    setName: string

    /*
    @Prop({ required: true, type: [{ type: Types.ObjectId, ref: 'Task' }]})
    taskList: Task[]
    */

    @Prop({ default: Status.Active })
    status: Status

    @Prop()
    description: string

    @Prop({required: true})
    creator: string
    /*
    @Prop({ type: Schema.Types.ObjectId, ref: 'TaskImages' })
    image: TaskImages
    */
}

export type SetDocument = Set & Document
export const SetSchema = SchemaFactory.createForClass(Set)

