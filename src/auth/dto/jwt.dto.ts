import { ObjectId } from "mongoose"

export class JwtPayloadDto {
    sub: ObjectId
    username: string
}

export class JwtUserDto {
    userId: ObjectId
    username: string
}