import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

export class IdTaskDto {
    
    @IsMongoId()
    id: ObjectId
}