import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, VerifyCallback } from "passport-google-oauth20"
import { userDataFromProvider } from "../../../user/interfaces/userDataFromProvider.interface"
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
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
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
        const userDataFromProvider: userDataFromProvider = {
            username: profile.displayName,
            email: profile.emails[0].value,
            provider: profile.provider
        }

        done(null, userDataFromProvider)
    }
}