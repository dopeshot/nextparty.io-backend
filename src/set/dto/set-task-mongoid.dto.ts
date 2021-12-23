import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class SetTaskMongoIdDto {
    @IsMongoId()
    setId: ObjectId;

    @IsMongoId()
    taskId: ObjectId;
}
