import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    //khi client đăng kí/đăng nhập bằng github thì passport sẽ gọi hàm validate để lấy thông tin người dùng từ github và trả về cho authService
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const primaryEmail =
      profile.emails?.[0]?.value ?? `${profile.username}@github.local`;
    //nếu github ko trả về email thì sẽ tạo 1 email giả để lưu vào cơ sở dữ liệu

    return {
      provider: 'GITHUB' as const,
      providerUserId: profile.id,
      email: primaryEmail,
      name: profile.displayName || profile.username || 'GitHub User',
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
    //chuẩn hóa lại dữ liệu cho phù hợp với cơ sở dữ liệu của mình và trả về cho authService để xử lý tiếp
    //hàm validate này sẽ gán các thông tin người dùng từ github vào req.user để authService có thể lấy ra và xử lý tiếp
  }
}