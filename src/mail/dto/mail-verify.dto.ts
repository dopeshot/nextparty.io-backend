import { IsString, Length } from 'class-validator'

export class MailVerifyDto {
    @IsString()
    @Length(3, 24)
    name: string

    @IsString()
    link: string
}