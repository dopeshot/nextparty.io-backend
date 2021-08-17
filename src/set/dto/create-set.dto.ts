import { IsString, Length } from "class-validator"

export class CreateSetDto  {
    @IsString()
    @Length(3, 32)
    name: string

    @IsString()
    @Length(0, 555555)
    description: string

    @IsString()
    language: string
}
