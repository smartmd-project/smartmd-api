import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import {
  ChangePasswordResDto,
  SigninResDto,
  SignoutResDto,
  SignupResDto,
} from './dto/auth-response.dto';
import { Public } from '../common/decorator/public.decorator';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guards';
import { type Response } from 'express';
import { GithubAuthGuard } from './guards/github-auth.guard';

const cookieOptions = {
  httpOnly: true, //Ngăn js truy cập (chống XSS)
  secure: true,
  sameSite: 'lax' as const,
};
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() //đánh dấu route này là public để cho phép client có thể truy cập mà ko cần access token
  @UseInterceptors(ClassSerializerInterceptor) //sử dụng interceptor để tự động serialize dữ liệu trả về cho client
  @Post('signup')
  async signup(@Body() userBody: CreateUserDto) {
    const user = await this.authService.signup(userBody);
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

  //Change password
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: { oldPassword: string; newPassword: string }) {
    const { userId } = req.user;
    const { oldPassword, newPassword } = body;
    const result = await this.authService.changePassword(userId, oldPassword, newPassword);
    return new ChangePasswordResDto(result);
  }

  //Oauth github
  @Get('github')
  @UseGuards(GithubAuthGuard)
  @Public()
  async githubLogin() {
    // Initiates the GitHub OAuth2 login flow
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @Public()
  async githubLoginCallback(@Req() req, @Res() response: Response) {
    const result = await this.authService.githubLogin(req.user);
    console.log('GitHub user:', req.user);
    const { accessToken, refreshToken } = result;
    response.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    return response.redirect(process.env.CLIENT_URL ?? 'http://localhost:5173/');
  }
}
