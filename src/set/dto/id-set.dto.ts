import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";

export class IdSetDto {
    
    @IsMongoId()
    id: ObjectId
}