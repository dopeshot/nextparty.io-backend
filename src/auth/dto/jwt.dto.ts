import { ObjectId } from "mongoose"
import { Role } from "src/user/enums/role.enum"

export class JwtPayloadDto {
    sub: ObjectId
    username: string
    role: Role
}

export class JwtUserDto {
    userId: ObjectId
    username: string
    role: Role
}

export class AccessTokenDto {
    access_token: string
}