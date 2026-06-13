import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { TokenService } from "../service/token.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorator/public.decorator";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}
  //canActivate hàm quyết định xem request có được tiếp tục hay ko
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //lấy ra thông tin về việc route nào đó có phải là public hay ko bằng cách sử dụng reflector để lấy ra metadata của route đó
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; //nếu route nào đó được đánh dấu là public thì sẽ bỏ qua bước kiểm tra access token và cho phép request tiếp tục
    }
    const request = context.switchToHttp().getRequest(); //lấy ra request
    const accessToken = this.extractTokenFromCookie(request); //trích xuất access token từ cookies của request
    if (!accessToken) {
      throw new UnauthorizedException(); //mã code 401 từ chối yêu cầu từ client gửi lên
    }
    try {
      const decodedAccessToken =
        await this.tokenService.verifyAccessToken(accessToken); //kiểm tra xem cái accesstoken còn hạn ko
      request.user = decodedAccessToken;
      //tạo ra 1 trường user mới tại obj request lưu trữ payload của accesstoken để cho controller sau đó dễ dang xử lí
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
  private extractTokenFromCookie(request: Request): string | undefined {
    const accessTokenReq: string = request.cookies?.access_token;
    return accessTokenReq;
  }
}
