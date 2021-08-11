import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, VerifyCallback } from "passport-google-oauth20"
import { AuthService } from "src/auth/auth.service"
import { Provider } from "src/auth/enums/provider.enum"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENTID,
            clientSecret: process.env.GOOGLE_CLIENTKEY,
            callbackURL: 'http://localhost:3000/api/auth/google/redirect',
            scope: ['email', 'profile']
        })
    }

    async validate(access_token: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const {
            name,
            emails,
            photos
        } = profile

        const user = {
            email: emails[0],
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            access_token: await this.authService.createOAuthLoginJwt(profile.id, Provider.GOOGLE)
        }
        done(null, user)
    }
}