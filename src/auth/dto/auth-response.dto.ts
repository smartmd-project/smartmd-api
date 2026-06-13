import { Exclude } from "class-transformer";
import { IsString } from "class-validator";

//định nghĩa serialize dữ liệu trả về cho client khi người dùng đăng ký, đăng nhập, đăng xuất và làm mới token
export class SignupResDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(partial: Partial<SignupResDto>) {
    Object.assign(this, partial);
  }
}
export class SigninResDto {
  message: string;
  constructor(partial: Partial<SigninResDto>) {
    Object.assign(this, partial);
  }
}
export class SignoutResDto {
  message: string;
  constructor(partial: Partial<SignoutResDto>) {
    Object.assign(this, partial);
  }
}
export class RefreshTokenResDto extends SigninResDto {}
