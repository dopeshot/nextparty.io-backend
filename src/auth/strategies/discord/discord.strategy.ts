import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { doesNotMatch } from "assert";
import { Strategy } from 'passport-discord'
import { UserService } from "../../../user/user.service";
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(private readonly userService: UserService) {
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: ['identify', 'email']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void) {
        const user = profile
        done(null, user)
    }
}