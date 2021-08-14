import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsMongoId, IsNotEmpty, IsObject } from "class-validator";
import { ObjectId } from "mongoose";
import { Set } from "src/set/entities/set.entity";
import { IdTaskDto } from "src/task/dto/id-task.dto";
import { Language } from "src/task/enums/language.enum";

export class addSetIdCategoryDto extends PartialType(IdTaskDto){
    @IsMongoId()
    id2: ObjectId
}
