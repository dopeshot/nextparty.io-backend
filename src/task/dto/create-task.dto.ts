import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNotEmpty, IsObject, ValidateNested } from "class-validator";
import { isValidObjectId, ObjectId } from "mongoose";
import { Language } from "../enums/language.enum";
import { TaskType } from "../enums/tasktype.enum";
import { ContentTaskDto } from "./content-task.dto";

export class CreateTaskDto {
    @IsEnum(Language)
    language: Language

    @IsEnum(TaskType)
    type: TaskType

    @ValidateNested()
    @Type(()=> ContentTaskDto)
    @IsNotEmpty()
    content: ContentTaskDto
}
