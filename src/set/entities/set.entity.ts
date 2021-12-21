import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, SchemaTypes, Document } from 'mongoose';
import { Status } from '../../shared/enums/status.enum';
import { Language } from '../../shared/enums/language.enum';
import { Task, TaskSchema } from './task.entity';

@Schema({ timestamps: true, _id: true })
export class Set {
    _id: ObjectId;

    @Prop({ required: true, index: true })
    name: string;

    @Prop({ required: false, type: [{ type: TaskSchema }] })
    tasks: Task[];

    @Prop({ default: Status.ACTIVE })
    status: Status | Status.ACTIVE;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    createdBy: ObjectId;

    @Prop({ required: true })
    language: Language;

    @Prop({ default: 0 })
    truthCount: number;

    @Prop({ default: 0 })
    dareCount: number;

    @Prop({ default: 'placeholder' })
    previewImage: string;

    @Prop({ default: 'placeholder2' })
    bannerImage: string;
}

export type SetDocument = Set & Document;
export const SetSchema = SchemaFactory.createForClass(Set);
