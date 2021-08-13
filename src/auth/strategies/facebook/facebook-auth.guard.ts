import { AuthGuard } from "@nestjs/passport";

export class FacebookAuthGuard extends AuthGuard('facebook') {}