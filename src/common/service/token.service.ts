import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { TokenPayload } from '../types/jwt.type';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService
    ) {}

    private getJwtOptions(secret: string | undefined, expiresIn: JwtSignOptions['expiresIn']): JwtSignOptions {
        return {
            secret,
            expiresIn,
            algorithm: 'HS256'
        };
    }

    //dùng để tạo ra Access Token 
    signAccessToken(payload: { userId: string }) {
        return this.jwtService.sign(
            payload,
            this.getJwtOptions(
                process.env.ACCESS_TOKEN_SECRET,
                process.env.ACCESS_TOKEN_EXPIRES_IN as JwtSignOptions['expiresIn']
            )
        ) ;
    }
    //dùng để tạo ra refreshToken 
    signRefreshToken(payload: { userId: string }) {
        return this.jwtService.sign(
            payload,
            this.getJwtOptions(
                process.env.REFRESH_TOKEN_SECRET,
                process.env.REFRESH_TOKEN_EXPIRES_IN as JwtSignOptions['expiresIn']
            )
        );
    }
    //kiểm ra tính hợp lệ của access token
    verifyAccessToken(token: string): Promise<TokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: process.env.ACCESS_TOKEN_SECRET
        })
    }
    //kiểm tra tính hợp lệ của refresh token
    verifyRefreshToken(token: string):Promise<TokenPayload>{
        return this.jwtService.verifyAsync(token, {
            secret: process.env.REFRESH_TOKEN_SECRET
        })
    }
}
