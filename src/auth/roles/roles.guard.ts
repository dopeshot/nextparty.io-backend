import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRole = this.reflector.getAllAndOverride<string[]>('role', [context.getHandler(), context.getClass()])

        if (!requiredRole) 
            return true

        const { user } = context.switchToHttp().getRequest()
        return requiredRole.some(role => user.role?.includes(role))
    }
}