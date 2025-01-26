import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { requirePermissionsMeta } from './custom.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return true;
    }
    const permissions = user.permissions;
    console.log('permissions: !!!!!', permissions);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      requirePermissionsMeta,
      [context.getClass(), context.getHandler()],
    );
    console.log('requiredPermissions: ', requiredPermissions);
    if (!requiredPermissions) return true;
    for (let i = 0; i < requiredPermissions.length; i++) {
      const curPermission = requiredPermissions[i];
      if (!permissions.find((item) => item.code === curPermission)) {
        throw new UnauthorizedException('当前用户暂无该接口权限');
      }
    }
    return true;
  }
}
