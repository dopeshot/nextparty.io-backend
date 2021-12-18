import { ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ObjectId } from 'mongoose'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { MailVerifyJWTDto } from '../dto/verify-jwt.dto'
import { UserService } from '../user.service'

// Set verify-jwt as strategy name
export class JWTVerifyStrategy extends PassportStrategy(Strategy, "verify-jwt") {
    constructor(@Inject(UserService) private userService:UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromUrlQueryParameter("code"),
            ignoreExpiration: false,
            secretOrKey: process.env.VERIFY_JWT_SECRET,
        })
    }

    /**
     * After passport verifies the JWT signature and decoding from payload, this method gets called
     * @param payload from JWT tokem
     * @returns decoded payload from JWT token
     */
    async validate(payload: MailVerifyJWTDto): Promise<ObjectId> {
        // Validate if user still exists. This keeps tokens from being valid for users that have been deleted
        if (!(await this.userService.validateVerifyCode(payload.id))) {
            throw new UnauthorizedException(
                'Your are not allowed to use this service.',
            )
        }
        return payload.id
    }
}
