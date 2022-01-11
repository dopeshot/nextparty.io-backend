import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { Language } from '../../shared/enums/language.enum';
import { Status } from '../../shared/enums/status.enum';
import { User } from '../../user/entities/user.entity';
import { SetCategory } from '../enums/setcategory.enum';
import { Visibility } from '../enums/visibility.enum';
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

    @Prop({ required: true, default: Language.DE })
    language: Language;

    @Prop({ default: 0 })
    truthCount: number;

    @Prop({ default: 0 })
    dareCount: number;

    @Prop({ default: 0 })
    played: number;

    @Prop({ default: Visibility.PUBLIC })
    visibility: Visibility;
}

export type SetDocument = Set & Document;
export type SetDocumentPopulated = SetDocument & { createdBy: User };
export const SetSchema = SchemaFactory.createForClass(Set);
