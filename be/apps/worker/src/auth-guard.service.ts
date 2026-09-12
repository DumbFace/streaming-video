// src/auth/next-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { decryptNextAuthToken } from '@streaming-video/shared';

@Injectable()
export class NextAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    console.log('NextAuthGuard: Checking authorization for request to', request.url);
    const authHeader = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.query?.token;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = await decryptNextAuthToken(token, process.env.NEXTAUTH_SECRET!);

      console.log('payload: ', payload);
      request.email = payload.email;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
