import { IsNotEmpty, IsString } from 'class-validator';

export class ResetRequestDto {
    @IsString()
    @IsNotEmpty()
    mail: string;
}
