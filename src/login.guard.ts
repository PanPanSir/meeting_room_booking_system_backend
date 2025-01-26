import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permission } from './user/entities/permission.entity';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { requireLoginMeta } from './constants';

interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const requireLogin = this.reflector.getAllAndOverride(requireLoginMeta, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!requireLogin) return true;
    const authorization = request.headers.authorization;
    if (!authorization) throw new UnauthorizedException('用户未登录');

    try {
      const token = authorization.split(' ')[0];
      const data = this.jwtService.verify(token);
      const userInfo = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions,
      };
      request.user = userInfo;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }
}
