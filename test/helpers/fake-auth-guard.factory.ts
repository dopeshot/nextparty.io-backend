// Testing these is not necessary
/* istanbul ignore file */

import { ExecutionContext } from '@nestjs/common';

export class FakeAuthGuardFactory {
    private user;
    private isActive: boolean = true;

    setUser(user) {
        this.user = user;
    }

    setActive(bool: boolean) {
        this.isActive = bool;
    }

    getGuard() {
        return {
            canActivate: (context: ExecutionContext) => {
                context.switchToHttp().getRequest().user = this.user;
                return this.isActive;
            }
        };
    }
}
