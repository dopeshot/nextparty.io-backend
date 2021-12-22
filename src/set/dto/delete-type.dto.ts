import { IsOptional, IsString } from 'class-validator';

export class DeleteTypeDto {
    @IsOptional()
    @IsString()
    type: string;
}
