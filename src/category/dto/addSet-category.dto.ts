import { PartialType } from "@nestjs/mapped-types";
import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";
import { MongoIdDto } from "src/shared/dto/mongoId.dto";


export class addSetIdCategoryDto extends PartialType(MongoIdDto){
    @IsMongoId()
    setId: ObjectId
}
