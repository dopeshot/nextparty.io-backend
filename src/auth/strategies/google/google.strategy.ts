import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, VerifyCallback } from "passport-google-oauth20"
import { UserService } from "../../../user/user.service"
import { AuthService } from "../../auth.service"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENTID,
            clientSecret: process.env.GOOGLE_CLIENTKEY,
            callbackURL: 'http://localhost:3000/api/auth/google/redirect',
            scope: ['email', 'profile']
        })
    }

    /**
     * For store userdata in @Request req
     * @param access_token token from google
     * @param refreshToken  token from google
     * @param profile  user data
     * @param done callback
     */
    async validate(access_token: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const user = profile

        const checkUser = await this.userService.findOneByEmail(user.emails[0].value)
        if (checkUser)
            throw new InternalServerErrorException("User already has an Account")

        // Set @Request req user
        done(null, user)
    }
}