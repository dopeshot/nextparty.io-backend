import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class SetUserMongoIdDto {
    @IsMongoId()
    setId: ObjectId;

    @IsMongoId()
    userId: ObjectId;
}
