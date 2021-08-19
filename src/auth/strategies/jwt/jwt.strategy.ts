import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayloadDto, JwtUserDto } from "../../dto/jwt.dto";

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        })
    }

    /**
     * After passport verifies the JWT signature and decoding from payload, this method gets called
     * @param payload from JWT tokem
     * @returns decoded payload from JWT token
     */
    async validate(payload: JwtPayloadDto): Promise<JwtUserDto> {
        // If needed, here could be some bussiness logic (like a database lookup) if we need more information about the user
        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role
        }
    }
}