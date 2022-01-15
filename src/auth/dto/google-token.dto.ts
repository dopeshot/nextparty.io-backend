import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleToken {
    @IsString()
    @IsNotEmpty()
    token: string;
}
