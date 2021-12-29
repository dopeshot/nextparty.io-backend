import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

// Used to disable endpoints in production
@Injectable()
export class ENVGuard implements CanActivate {
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        return process.env.RUNTIME_ENV !== 'prod';
    }
}
