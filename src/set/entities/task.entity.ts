import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Status } from '../../shared/enums/status.enum';
import { CurrentPlayerGender } from '../enums/currentplayergender.enum';
import { TaskType } from '../enums/tasktype.enum';

@Schema({ timestamps: true, _id: true })
export class Task {
    @Prop({ required: true })
    type: TaskType;

    @Prop({ default: CurrentPlayerGender.ANYONE })
    currentPlayerGender: CurrentPlayerGender;

    @Prop({ required: true })
    message: string;

    @Prop({ default: Status.ACTIVE })
    status: Status | Status.ACTIVE;
}

export type TaskDocument = Task & Document;
export const TaskSchema = SchemaFactory.createForClass(Task);
