import { IsEmail, IsString, Length } from "class-validator"

export class RegisterDto {
    @IsString()
    @Length(3, 24)
    username: string

    @IsEmail()
    email: string

    @IsString()
    @Length(8, 124)
    password: string
}
