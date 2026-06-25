import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

//định nghĩa serialize dữ liệu trả về cho client khi người dùng đăng ký, đăng nhập, đăng xuất và làm mới token
export class SignupResDto {
  @ApiProperty({ example: '0b637ecf-9987-4c8f-90a0-c1f098b46db9' })
  id: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({
    example: 'https://avatars.githubusercontent.com/u/123456',
    nullable: true,
  })
  @IsOptional() //cho phép trường này có thể là null hoặc undefined
  avatarUrl: string | null;

  @Exclude()
  @IsString()
  @IsOptional() //cho phép trường này có thể là null hoặc undefined
  password: string | null;

  @ApiProperty({ example: '2026-06-25T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-25T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<SignupResDto>) {
    Object.assign(this, partial);
  }
}
export class SigninResDto {
  @ApiProperty({ example: 'Signin successful' })
  message: string;

  constructor(partial: Partial<SigninResDto>) {
    Object.assign(this, partial);
  }
}
export class SignoutResDto {
  @ApiProperty({ example: 'Signout successfully' })
  message: string;

  constructor(partial: Partial<SignoutResDto>) {
    Object.assign(this, partial);
  }
}
export class RefreshTokenResDto extends SigninResDto {}

export class ChangePasswordResDto {
  @ApiProperty({ example: 'Password changed successfully' })
  message: string;

  constructor(partial: Partial<ChangePasswordResDto>) {
    Object.assign(this, partial);
  }
}
