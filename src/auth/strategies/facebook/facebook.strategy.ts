import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy } from "passport-facebook";
import { userDataFromProvider } from "../../../user/interfaces/userDataFromProvider.interface";
import { UserService } from "../../../user/user.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            clientID: process.env.FACEBOOK_APPID,
            clientSecret: process.env.FACEBOOK_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            scope: 'email',
            profileFields: ['emails', 'name']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any, info?: any) => void): Promise<any> {
        const userDataFromProvider: userDataFromProvider = {
            username: profile.name.givenName + ' ' + profile.name.familyName,
            email: profile.emails[0].value,
            provider: profile.provider
        }
        done(null, userDataFromProvider)
    }
}