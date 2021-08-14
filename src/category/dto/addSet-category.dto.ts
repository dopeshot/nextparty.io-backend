import { PartialType } from "@nestjs/mapped-types";
import { IsMongoId } from "class-validator";
import { ObjectId } from "mongoose";
import { IdTaskDto } from "../../task/dto/id-task.dto";

export class addSetIdCategoryDto extends PartialType(IdTaskDto){
    @IsMongoId()
    id2: ObjectId
}
