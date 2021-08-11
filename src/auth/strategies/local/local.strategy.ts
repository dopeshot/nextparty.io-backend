import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super()
    }

    /**
     * Validate User with Username and Password 
     * @param username of the user
     * @param password of the user
     * @returns a user if he is valid, if not throw an Unauthorized Exception
     */
    async validate(username: string, password: string): Promise<User> {
        const user = await this.authService.validateUserWithUsernamePassword(username, password)
        if (!user)
            throw new UnauthorizedException()
        return user
    }
}