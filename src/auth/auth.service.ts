import { Injectable ,ConflictException, UnauthorizedException, UnprocessableEntityException} from '@nestjs/common';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import { PrismaService } from '../common/service/prisma.service';
import { HasingService } from '../common/service/hasing.service';
import { TokenService } from '../common/service/token.service';
@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly hasingService : HasingService,
        private readonly tokenService: TokenService
    ) {}
    async signup(createUserDto: CreateUserDto) {
        try {
            //hash mật khẩu trước khi lưu vào cơ sở dữ liệu
            const hashPassword = await this.hasingService.hashPassword(createUserDto.password);
            const user = await this.prismaService.user.create({
                data: {
                    name : createUserDto.name,
                    email: createUserDto.email,
                    password: hashPassword,//mật khẩu đã được hash
                },
            });
            return user;
        } catch (error) {
            throw new ConflictException('Email already exists');//code 409
        }
    }
    async signin(signinDto: SigninDto) {
        //tìm người dùng theo email xem có tồn tại không
        const user = await this.prismaService.user.findUnique({
            where: {
                email: signinDto.email,
            },
        });
        //nếu ko tồn tại thì trả về lỗi
        if (!user) {
            throw new UnauthorizedException('Account is not exist');
            //Trả về lỗi 401 Unauthorized khi tài khoản không tồn tại
        }
        //so sánh mật khẩu đã nhập với mật khẩu đã hash trong cơ sở dữ liệu
        const isPasswordValid = await this.hasingService.comparePassword(signinDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnprocessableEntityException('Invalid credentials');
            //Trả về lỗi 422 Unprocessable Entity khi thông tin đăng nhập không hợp lệ
        }
        const tokens = await this.generateToken({userId : user.id});
        return tokens;
    }
    async generateToken(payload: { userId: string }) {
        const accessToken = await this.tokenService.signAccessToken(payload);
        const refreshToken = await this.tokenService.signRefreshToken(payload);
        const decodeRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
        //lưu refresh token vào cơ sở dữ liệu
        await this.prismaService.session.create({
            data: {
                userId: payload.userId,
                refreshToken: refreshToken,
                expiresAt: new Date(decodeRefreshToken.exp * 1000),//chuyển đổi thời gian hết hạn từ giây sang mili giây
            },
        });
        return { accessToken, refreshToken };
    }
}
