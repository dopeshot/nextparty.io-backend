import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DeleteType } from '../enums/delete-type.enum';

export class DeleteTypeDto {
    @IsOptional()
    @IsEnum(DeleteType)
    @ApiPropertyOptional()
    type: DeleteType;
}
