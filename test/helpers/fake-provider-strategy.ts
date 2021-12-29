import { Injectable, Module } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class ThirdPartyGuardMock extends PassportStrategy(Strategy, 'third party mock') {

    async validate(request: any): Promise<any> {
        // Return the user that was passed => normally this would be parsed from the third party response
        return request.body.user ;
      }
}