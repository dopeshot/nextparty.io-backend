import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Can´t use AuthGuard(jwt) as that interfers with other jwt guards...passport is global because reasons
export class OptionalJWTGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info, context: ExecutionContext) {
        const req: any = context.switchToHttp().getRequest<Request>();

        // If user did not provide jwt token, continue without user
        if (!req.headers.authorization) {
            req.user = null;
            return null;
        }

        // If user provided invalid token, throw error
        if (req.authInfo) {
            throw new UnauthorizedException(
                'Your are not allowed to use this service.'
            );
        }

        req.user = user;
        return user;
    }
}
