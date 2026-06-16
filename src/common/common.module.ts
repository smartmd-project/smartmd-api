import { Global, Module } from '@nestjs/common';
import { PrismaService } from './service/prisma.service';
import { HasingService } from './service/hasing.service';
import { TokenService } from './service/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guards';

@Global()
@Module({
  providers: [
    PrismaService,
    HasingService,
    TokenService,
    {
      //khai báo AccessTokenGuard là global guard để áp dụng cho các router
      provide: 'APP_GUARD',
      useClass: AccessTokenGuard,
    },
  ],
  exports: [PrismaService, HasingService, TokenService],
  imports: [JwtModule], //thêm JwtModule vào để có thể sử dụng Moudle này trong các module khác mà không cần phải import JwtModule nữa
})
export class CommonModule {}
