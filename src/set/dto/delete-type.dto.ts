import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeleteType } from '../enums/delete-type.enum';

export class DeleteTypeDto {
    @IsOptional()
    @IsEnum(DeleteType)
    type: DeleteType;
}
