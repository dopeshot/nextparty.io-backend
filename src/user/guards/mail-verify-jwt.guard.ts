import { AuthGuard } from '@nestjs/passport';

// Can´t use AuthGuard(jwt) as that interfers with other jwt guards...passport is global because reasons
export class VerifyJWTGuard extends AuthGuard('verify-jwt') {}
