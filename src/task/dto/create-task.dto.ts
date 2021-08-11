import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, ValidateNested } from "class-validator";
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
