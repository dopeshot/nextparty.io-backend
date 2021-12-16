import { ExecutionContext } from "@nestjs/common"
import { Observable } from "rxjs"

export class AuthGuardFaker {
    private canActivate: boolean
    setActivation = (bool) => {
        this.canActivate = bool
    }
    getGuard = (strategy?: string) => {
        if (!strategy) {
            strategy = 'jwt'
        }
        return {
            canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
                //const { user } = context.switchToHttp().getRequest()
                return true;
            },
        }
    }

}