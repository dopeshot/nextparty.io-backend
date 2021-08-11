import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

export class DeleteTaskDto {
    
    @IsMongoId()
    id: ObjectId
}