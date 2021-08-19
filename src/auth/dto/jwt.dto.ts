import { ObjectId } from "mongoose"
import { Role } from "../../user/enums/role.enum"

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