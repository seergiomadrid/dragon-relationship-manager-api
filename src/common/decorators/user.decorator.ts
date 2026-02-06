import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from '../types/auth-request.type';
import type { JwtPayload } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    return req.user;
  },
);
