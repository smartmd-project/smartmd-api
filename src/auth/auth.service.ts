import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateUserDto, SigninDto } from "./dto/auth.dto";
import { PrismaService } from "../common/service/prisma.service";
import { HasingService } from "../common/service/hasing.service";
import { TokenService } from "../common/service/token.service";
import { Prisma } from "@prisma/client";
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hasingService: HasingService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      //hash mật khẩu trước khi lưu vào cơ sở dữ liệu
      const hashPassword = await this.hasingService.hashPassword(
        createUserDto.password,
      );
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email already exists"); //code 409
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
      throw new UnauthorizedException("Account is not exist");
      //Trả về lỗi 401 Unauthorized khi tài khoản không tồn tại
    }
    //so sánh mật khẩu đã nhập với mật khẩu đã hash trong cơ sở dữ liệu
    const isPasswordValid = await this.hasingService.comparePassword(
      signinDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnprocessableEntityException("Invalid credentials");
      //Trả về lỗi 422 Unprocessable Entity khi thông tin đăng nhập không hợp lệ
    }
    const tokens = await this.generateToken({ userId: user.id });
    return tokens;
  }

  async generateToken(payload: { userId: string }) {
    const accessToken = await this.tokenService.signAccessToken(payload);
    const refreshToken = await this.tokenService.signRefreshToken(payload);
    const decodeRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);
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

  async signout(refreshToken: string) {
    try {
      //kiểm tra tính hợp lệ của refresh token
      const decodeRefreshToken =
        await this.tokenService.verifyRefreshToken(refreshToken);
      //xóa session của người dùng khỏi cơ sở dữ liệu để đăng xuất
      await this.prismaService.session.deleteMany({
        where: {
          userId: decodeRefreshToken.userId,
          OR: [
            { refreshToken: refreshToken }, // Xóa cái hiện tại
            { expiresAt: { lt: new Date() } }, // Tiện tay dọn luôn mấy cái hết hạn cũ
          ],
        },
      });
      return { message: "Signout successfully" };
    } catch (error) {
      // Nếu lỗi do chính chúng ta chủ động throw ở bước 3, thì ném thẳng ra luôn
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Các lỗi còn lại (lỗi verify của thư viện JWT, lỗi kết nối DB...)
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
  async refreshToken(userId: string, refreshToken: string) {
    try {
      //kiểm tra xem refresh token có tồn tại trong cơ sở dữ liệu không
      await this.prismaService.session.findUniqueOrThrow({
        where: {
          refreshToken: refreshToken,
        },
      });
      //xóa session cũ của người dùng khỏi cơ sở dữ liệu để đảm bảo rằng refresh token cũ không thể sử dụng lại
      await this.prismaService.session.deleteMany({
        where: {
          refreshToken: refreshToken,
        },
      });
      //tạo mới access token và refresh token
      const tokens = await this.generateToken({ userId: userId });
      return tokens;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new UnauthorizedException("Refresh token has been revoked");
        //trả về lỗi 401 Unauthorized khi refresh token đã bị thu hồi hoặc không tồn tại trong cơ sở dữ liệu
      }
      throw new UnauthorizedException("Invalid refresh token");
      //trả về lỗi 401 Unauthorized khi refresh token không hợp lệ hoặc đã hết hạn
    }
  }
}
