import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../../auth.service";
import { User } from "../../../user/entities/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            role: 'role'
        })
    }

    /**
     * Validate User with Email and Password 
     * @param email of the user
     * @param password of the user
     * @returns a user if he is valid, if not throw an Unauthorized Exception
     */
    async validate(email: string, password: string): Promise<User> {
        const user = await this.authService.validateUserWithEmailPassword(email, password)
        if (!user)
            throw new UnauthorizedException()
        return user
    }
}