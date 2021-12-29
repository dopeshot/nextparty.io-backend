import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { CurrentPlayerGender } from '../enums/currentplayergender.enum';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(
    OmitType(CreateTaskDto, ['currentPlayerGender'])
) {
    @IsEnum(CurrentPlayerGender)
    currentPlayerGender: CurrentPlayerGender;
}
