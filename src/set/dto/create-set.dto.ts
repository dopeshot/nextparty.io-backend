import { IsString, Length } from "class-validator"

export class CreateSetDto  {
    @IsString()
    @Length(3, 32)
    setName: string

    @IsString()
    @Length(0, 124)
    description: string
}
