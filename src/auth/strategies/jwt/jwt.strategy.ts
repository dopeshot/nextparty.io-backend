import { Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../auth.service';
import { JwtPayloadDto, JwtUserDto } from '../../dto/jwt.dto';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(@Inject(AuthService) private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    /**
     * After passport verifies the JWT signature and decoding from payload, this method gets called
     * @param payload from JWT tokem
     * @returns decoded payload from JWT token
     */
    async validate(payload: JwtPayloadDto): Promise<JwtUserDto> {
        const user = await this.authService.isValidJWT(payload.sub);
        console.log('this jwt');

        // Validate if user still exists. This keeps tokens from being valid for users that have been deleted
        if (!user) {
            console.log('no user found');
            throw new UnauthorizedException(
                'Your are not allowed to use this service.'
            );
        }

        return {
            userId: payload.sub,
            username: payload.username,
            role: user.role
        };
    }
}
