import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto, SigninDto } from './dto/auth.dto';
import { PrismaService } from '../common/service/prisma.service';
import { HasingService } from '../common/service/hasing.service';
import { TokenService } from '../common/service/token.service';
import { Prisma } from '@prisma/client';
import { TokenPayload } from '../common/types/jwt.type';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hasingService: HasingService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      //hash mật khẩu trước khi lưu vào cơ sở dữ liệu
      const hashPassword = await this.hasingService.hashPassword(createUserDto.password);
      const user = await this.prismaService.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashPassword, //mật khẩu đã được hash
        },
      });
      return user;
    } catch (error) {
      //xử lý lỗi khi email đã tồn tại trong cơ sở dữ liệu
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists'); //code 409
      }
      throw error;
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
      throw new UnauthorizedException('Invalid credentials');
      //Trả về lỗi 401 Unauthorized khi tài khoản không tồn tại
    }
    //so sánh mật khẩu đã nhập với mật khẩu đã hash trong cơ sở dữ liệu
    const isPasswordValid = await this.hasingService.comparePassword(
      signinDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
      //Trả về lỗi 401 Unauthorized khi thông tin đăng nhập không hợp lệ
    }
    const tokens = await this.generateToken({ userId: user.id });
    return tokens;
  }

  async generateToken(payload: { userId: string }) {
    const accessToken = await this.tokenService.signAccessToken(payload);
    const refreshToken = await this.tokenService.signRefreshToken(payload);
    const decodeRefreshToken = this.jwtService.decode(refreshToken) as TokenPayload;
    //lưu refresh token vào cơ sở dữ liệu
    await this.prismaService.session.create({
      data: {
        userId: payload.userId,
        refreshToken: refreshToken,
        expiresAt: new Date(decodeRefreshToken.exp * 1000), //chuyển đổi thời gian hết hạn từ giây sang mili giây
      },
    });
    return { accessToken, refreshToken };
  }
  async signout(userId: string) {
    try {
      const deletedSession = await this.prismaService.session.deleteMany({
        where: {
          userId: userId,
        },
      });

      if (deletedSession.count === 0) {
        throw new UnauthorizedException('Session not found or already logged out.');
      }

      return { message: 'Signout successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid request');
    }
  }
  async refreshToken(userId: string, oldrefreshToken: string) {
    try {
      const decodedToken = await this.tokenService.verifyRefreshToken(oldrefreshToken);
      if (decodedToken.userId !== userId) {
        throw new UnauthorizedException('Invalid refresh token for this user');
      }

      //kiểm tra xem refresh token có tồn tại trong cơ sở dữ liệu không
      const session = await this.prismaService.session.findUnique({
        where: {
          refreshToken: oldrefreshToken,
        },
      });
      if (!session) {
        await this.prismaService.session.deleteMany({
          where: { userId: userId },
        });

        throw new UnauthorizedException(
          'Refresh token has been revoked or used. Please sign in again.',
        );
      }

      //xóa session cũ của người dùng khỏi cơ sở dữ liệu để đảm bảo rằng refresh token cũ không thể sử dụng lại
      await this.prismaService.session.delete({
        where: {
          refreshToken: oldrefreshToken,
        },
      });
      //tạo mới access token và refresh token
      const tokens = await this.generateToken({ userId: userId });
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
      //trả về lỗi 401 Unauthorized khi refresh token không hợp lệ hoặc đã hết hạn
    }
  }
}
