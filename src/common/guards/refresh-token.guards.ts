// src/auth/guards/rt.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../service/token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Trích xuất token từ cookies
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException('Refresh token does not exist');
    }

    try {
      //Verify bằng secret key riêng của Refresh Token
      const payload = await this.tokenService.verifyRefreshToken(token);

      //Nhét cả payload VÀ chuỗi token thô vào request['user']
      request['user'] = {
        ...payload, //id userId, exp, iat
        refreshToken: token,
      };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or has expired');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const token = request.cookies?.refresh_token;
    return token;
  }
}
