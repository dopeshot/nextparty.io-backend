import { AuthGuard } from "@nestjs/passport"

export class ProviderGuardFaker extends AuthGuard('third party mock') {}