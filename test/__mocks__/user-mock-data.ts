import { Role } from "../../src/user/enums/role.enum"

// TODO: Is this the best way to do this?
import { UserService } from "../../src/user/user.service";
import { AuthService } from "../../src/auth/auth.service";

import { JwtService } from "@nestjs/jwt"
import { UserStatus } from "../../src/user/enums/status.enum";

let jwtService: JwtService = new JwtService({
    secret: 'secretkey',
    signOptions: {
        expiresIn: '10h'
    }
})
const userService: UserService = new UserService(null, null, null)
const authService: AuthService = new AuthService(null, jwtService)

let user = {
    _id: '61bb7c9983fdff2f24bf77a8' ,
    username: 'mock',
    email: 'mock@mock.mock',
    password: '',
    role: Role.User,
    status: UserStatus.ACTIVE,
    provider: ''
}

let admin = {
    _id: '61bb7c9883fdff2f24bf779d',
    username: 'admin',
    email: 'discordmod@admin.mock',
    password: '',
    role: Role.Admin,
    status: UserStatus.ACTIVE,
    provider: ''
}

export const getTestUser = async () => {
    // This ensures that altering the hashing algorith does not interfer with unit tests
    const pw = await userService.hashPassword('mock password')
    return {...user, password: pw}
};

export const getTestUserJWT = async () => {
    let token = await authService.createLoginPayload(user as any)
    return token.access_token 
}

export const getTestAdmin = async () => {
       // This ensures that altering the hashing algorith does not interfer with unit tests
       const pw = await userService.hashPassword('mock password')
       return {...admin, password: pw}
}

export const getTestAdminJWT = async () => {
    let token = await authService.createLoginPayload(admin as any)
    return token.access_token
}