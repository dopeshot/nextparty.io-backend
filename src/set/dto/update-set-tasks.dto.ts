import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class UpdateSetTasksDto {
    @IsMongoId()
    tasks: ObjectId[]
}
