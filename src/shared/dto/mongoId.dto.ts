import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

// Shared Dto to validate MongoId (We could create an own validation pipe for this)
export class MongoIdDto {
    @IsMongoId()
    id: ObjectId;
}
