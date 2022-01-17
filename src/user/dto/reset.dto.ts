import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetDTo {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @Length(8, 124)
    password: string;
}
