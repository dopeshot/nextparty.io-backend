import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { userDataFromProvider } from '../../../user/interfaces/userDataFromProvider.interface'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENTID,
            clientSecret: process.env.GOOGLE_CLIENTKEY,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile'],
        })
    }

    /**
     * For store userdata in @Request req
     * @param access_token token from google
     * @param refreshToken  token from google
     * @param profile  user data
     * @param done callback
     */
    // Eslint has to be disabled for this as google passes these params anyway
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        console.log('\n \n \n profile', profile, '\n \n \n')
        const userDataFromProvider: userDataFromProvider = {
            username: profile.displayName,
            email: profile.emails[0].value,
            provider: profile.provider,
        }

        done(null, userDataFromProvider)
    }
}
