import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateSetDto } from './create-set.dto';
import { CreateTaskDto } from './create-task.dto';

export class CreateFullSetDto extends CreateSetDto {
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => CreateTaskDto)
    tasks: CreateTaskDto[];
}
