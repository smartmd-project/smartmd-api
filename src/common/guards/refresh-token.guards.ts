// src/auth/guards/rt.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Trích xuất token từ header Authorization
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Refresh token does not exist');
    }

    try {
      //Verify bằng secret key riêng của Refresh Token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'rt-secret',
      });

      //Nhét cả payload VÀ chuỗi token thô vào request['user']
      request['user'] = {
        ...payload,//id userId, exp, iat
        refreshToken: token, 
      };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or has expired');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}