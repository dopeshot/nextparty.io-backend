import { IsEnum, IsString, Length } from "class-validator";
import { Language } from "../../shared/enums/language.enum";
import { CurrentPlayerGender } from "../enums/currentplayergender.enum";
import { TaskType } from "../enums/tasktype.enum";

export class CreateTaskDto {
    @IsEnum(Language)
    language: Language

    @IsEnum(TaskType)
    type: TaskType

    @IsEnum(CurrentPlayerGender)
    currentPlayerGender: CurrentPlayerGender | CurrentPlayerGender.ANYONE

    @IsString()
    @Length(10, 280)
    message: string

}