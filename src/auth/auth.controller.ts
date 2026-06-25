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
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create a new account' })
  @ApiCreatedResponse({
    description: 'User account created successfully.',
    type: SignupResDto,
  })
  @Public() //đánh dấu route này là public để cho phép client có thể truy cập mà ko cần access token
  @UseInterceptors(ClassSerializerInterceptor) //sử dụng interceptor để tự động serialize dữ liệu trả về cho client
  @Post('signup')
  async signup(@Body() userBody: CreateUserDto) {
    const user = await this.authService.signup(userBody);
    return new SignupResDto(user);
  }

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Sign in successful. Access and refresh tokens are set in HTTP-only cookies.',
    type: SigninResDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or OAuth-only account.' })
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

  @ApiOperation({ summary: 'Sign out current user' })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    description: 'User signed out and auth cookies cleared.',
    type: SignoutResDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signout')
  async signout(@Req() req, @Res({ passthrough: true }) response: Response) {
    const { userId } = req.user;

    const result = await this.authService.signout(userId);

    response.clearCookie('refresh_token', cookieOptions);

    response.clearCookie('access_token', cookieOptions);

    return new SignoutResDto(result);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({
    description: 'Refresh successful. New access and refresh token cookies are set.',
    type: SigninResDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid, expired, revoked, or reused refresh token.' })
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
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiCookieAuth('access_token')
  @ApiBody({
    schema: {
      example: {
        oldPassword: 'secret123',
        newPassword: 'newSecret123',
      },
      properties: {
        oldPassword: {
          type: 'string',
          example: 'secret123',
        },
        newPassword: {
          type: 'string',
          example: 'newSecret123',
        },
      },
      required: ['oldPassword', 'newPassword'],
    },
  })
  @ApiOkResponse({
    description: 'Password changed successfully.',
    type: ChangePasswordResDto,
  })
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: { oldPassword: string; newPassword: string }) {
    const { userId } = req.user;
    const { oldPassword, newPassword } = body;
    const result = await this.authService.changePassword(userId, oldPassword, newPassword);
    return new ChangePasswordResDto(result);
  }

  //Oauth github
  @ApiOperation({ summary: 'Start GitHub OAuth login flow' })
  @ApiFoundResponse({ description: 'Redirects user to GitHub OAuth authorization page.' })
  @Get('github')
  @UseGuards(GithubAuthGuard)
  @Public()
  async githubLogin() {
    // Initiates the GitHub OAuth2 login flow
  }

  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiFoundResponse({
    description: 'Sets auth cookies and redirects to CLIENT_URL after successful GitHub login.',
  })
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @Public()
  async githubLoginCallback(@Req() req, @Res() response: Response) {
    const result = await this.authService.githubLogin(req.user);
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
