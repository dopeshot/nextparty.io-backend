import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { Auth, google } from 'googleapis';
import { Strategy } from 'passport-custom';
import { ParsedQs } from 'qs';
import { userDataFromProvider } from '../../../user/interfaces/userDataFromProvider.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    configService: ConfigService;
    oauthClient: Auth.OAuth2Client;
    constructor() {
        super();
        const clientID = process.env.GOOGLE_AUTH_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;

        this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
    }

    async authenticate(
        req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
    ): Promise<userDataFromProvider> {
        const token = req.body.token;
        const infoClient = google.oauth2('v2').userinfo;

        this.oauthClient.setCredentials({
            access_token: token
        });

        const userInfoResponse = await infoClient.get({
            auth: this.oauthClient
        });

        const userdata = userInfoResponse.data;

        return {
            username: userdata.given_name,
            email: userdata.email,
            provider: 'google'
        };
    }
}
