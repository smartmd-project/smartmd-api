import { Body, ClassSerializerInterceptor, Controller, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import { SigninResDto, SignoutResDto, SignupResDto } from './dto/auth-response.dto';
import { Public } from '../common/decorator/public.decorator';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guards';
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
    async signin(@Body() signinDto: SigninDto) {

        const { accessToken, refreshToken } = await this.authService.signin(signinDto);
        return new SigninResDto({ accessToken, refreshToken });
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Post('signout')
    async signout(@Body('refreshToken') refreshToken: string) {
        const result = await this.authService.signout(refreshToken);
        return new SignoutResDto(result);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    async refreshToken(@Body('refreshToken') refreshToken: string, @Req() req) {
        const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(req.user.userId, refreshToken);
        return new SigninResDto({ accessToken, refreshToken: newRefreshToken });
    }
}
