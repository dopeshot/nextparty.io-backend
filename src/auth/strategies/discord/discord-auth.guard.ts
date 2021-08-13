import { AuthGuard } from "@nestjs/passport";

export class DiscordAuthGuard extends AuthGuard('discord') {}