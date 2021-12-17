import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'


// Used to disable endpoints in production
@Injectable()
export class ENVGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        if (process.env.RUNTIME_ENV !== 'prod') return true
        return false
    }
}
