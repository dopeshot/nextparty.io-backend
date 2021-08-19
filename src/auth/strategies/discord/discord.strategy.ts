import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { doesNotMatch } from "assert";
import { Strategy } from 'passport-discord'
import { userDataFromProvider } from "../../../user/interfaces/userDataFromProvider.interface";
import { UserService } from "../../../user/user.service";
import { DiscordUser } from "./discord-user.interface";
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

    async validate(accessToken: string, refreshToken: string, profile: DiscordUser, done: (err: any, user: any, info?: any) => void) {
        const {
            username,
            email,
            provider
        } = profile

        const userDataFromProvider: userDataFromProvider = {
            username,
            email,
            provider
        }
        done(null, userDataFromProvider)
    }
}