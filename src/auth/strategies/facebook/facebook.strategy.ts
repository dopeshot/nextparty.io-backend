import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy } from "passport-facebook";
import { UserService } from "src/user/user.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            clientID: process.env.FACEBOOK_APPID,
            clientSecret: process.env.FACEBOOK_SECRET,
            callbackURL: 'http://localhost:3000/api/auth/facebook/redirect',
            scope: 'email',
            profileFields: ['emails', 'name']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any, info?: any) => void): Promise<any> {
        const user = profile
        user.displayName = user.name.givenName + ' ' + user.name.familyName

        done(null, user)
    }
}