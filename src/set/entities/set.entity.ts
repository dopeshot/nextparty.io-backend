import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { Language } from '../../shared/enums/language.enum';
import { Status } from '../../shared/enums/status.enum';
import { User } from '../../user/entities/user.entity';
import { SetCategory } from '../enums/setcategory';
import { Task, TaskSchema } from './task.entity';

@Schema({ timestamps: true, _id: true })
export class Set {
    @Prop({ required: true, index: true })
    name: string;

    @Prop({ required: false, type: [{ type: TaskSchema }] })
    tasks: Task[];

    @Prop({ required: true })
    category: SetCategory;

    @Prop({ default: Status.ACTIVE })
    status: Status | Status.ACTIVE;

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
    createdBy: ObjectId;

    @Prop({ required: true })
    language: Language;

    @Prop({ default: 0 })
    truthCount: number;

    @Prop({ default: 0 })
    dareCount: number;
}

export type SetDocument = Set & Document;
export const SetSchema = SchemaFactory.createForClass(Set);
