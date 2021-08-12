import { IsString, Length } from "class-validator"
import { ObjectId } from "mongoose"

export class LoginDto {
    _id: ObjectId

    @IsString()
    @Length(3, 24)
    email: string

    @IsString()
    @Length(8, 124)
    password: string
}