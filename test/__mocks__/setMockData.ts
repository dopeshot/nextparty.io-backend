import { JwtService } from "@nestjs/jwt"
let jwtService: JwtService

export const getSetSetupData = () => {
    return [
        { language: "en", name: "Set number 1" },
        { language: "de", name: "Set number 2" }
    ]
}

export const getMockSet = () => {
    return { language: "de", name: "Set number 0" }
}

export const getUserSetupData = () => {
    return [
        { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", name: "Set number 1" },
        { _id: "aaaaaaaaaaaaaaaaaaaaaaab", name: "Set number 2" }
    ]
}

let user = {
    _id: "aaaaaaaaaaaaaaaaaaaaaaac",
    username: "TestUserName",
    email: "Hahaxd@gmail.com",
    password: "12345678"
}

export const getMockUser = () => {
    let token = jwtService.sign(user)
    return { user, token }
}