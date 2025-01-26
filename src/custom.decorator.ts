import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';

export const requireLoginMeta = 'require-login';

export const requirePermissionsMeta = 'require-permissions';

export const RequireLogin = () => SetMetadata(requireLoginMeta, true);

export const requirePermissions = (permissions) =>
  SetMetadata(requirePermissionsMeta, permissions);

export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  },
);
