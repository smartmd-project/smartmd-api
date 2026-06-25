import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guards';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [JwtModule.register({}),PassportModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenGuard,GithubStrategy],
})
export class AuthModule {}
