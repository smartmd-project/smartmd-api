import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SigninDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signup(createUserDto);
    }
    @Post('signin')
    async signin(@Body() signinDto: SigninDto) {
        return await this.authService.signin(signinDto);
    }
}
