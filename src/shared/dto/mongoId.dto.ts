import { IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

// Shared Dto to validate MongoId (We could create an own validation pipe for this)
export class MongoIdDto {
    @IsOptional()
    @IsMongoId()
    id: ObjectId;
}
