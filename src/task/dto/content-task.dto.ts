import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNumber, IsString, Length } from 'class-validator';
import { CurrentPlayerGender } from '../enums/currentplayergender.enum';
import { CreateTaskDto } from './create-task.dto';

export class ContentTaskDto {
    @IsEnum(CurrentPlayerGender)
    currentPlayerGender: CurrentPlayerGender | CurrentPlayerGender.ANYONE

    @IsString()
    @Length(10,280)
    message: string
}
