import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { doesNotMatch } from "assert";
import { Strategy } from 'passport-discord'
import { UserService } from "../../../user/user.service";
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(private readonly userService: UserService) {
        super({
            clientID: '875779982390075402',
            clientSecret: 'nHZS2G3QwWJR3OYF9W5W51V4utS-U1cQ',
            callbackURL: 'http://localhost:3000/api/auth/discord/redirect',
            scope: ['identify', 'email']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void) {
        const user = profile
        done(null, user)
    }
}