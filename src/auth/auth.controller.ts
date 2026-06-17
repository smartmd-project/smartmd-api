import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import { SigninResDto, SignoutResDto, SignupResDto } from './dto/auth-response.dto';
import { Public } from '../common/decorator/public.decorator';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guards';
import { type Response } from 'express';

const cookieOptions = {
  httpOnly: true, //Ngăn js truy cập (chống XSS)
  secure: true,
  sameSite: 'strict' as const,
};
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() //đánh dấu route này là public để cho phép client có thể truy cập mà ko cần access token
  @UseInterceptors(ClassSerializerInterceptor) //sử dụng interceptor để tự động serialize dữ liệu trả về cho client
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    return new SignupResDto(user);
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.signin(signinDto);
    response.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    return new SigninResDto({ message: 'Signin successful' });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signout')
  async signout(@Req() req, @Res({ passthrough: true }) response: Response) {
    const { userId } = req.user;

    const result = await this.authService.signout(userId);

    response.clearCookie('refresh_token', cookieOptions);

    response.clearCookie('access_token', cookieOptions);

    return new SignoutResDto(result);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req, @Res({ passthrough: true }) response: Response) {
    //lấy ra userID và refreshToken từ cookie mà req kèm theo
    const { userId, refreshToken: oldRefreshToken } = req.user;
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(
      userId,
      oldRefreshToken,
    );
    //refreshToken được lấy ra và gán vào 1 biến mới là newRefreshToken
    response.cookie('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    return new SigninResDto({ message: 'Refresh token successful' });
  }
}
