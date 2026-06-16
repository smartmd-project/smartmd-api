import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 20, { message: 'Passwords must be between 6 and 20 characters long' })
  password: string;
}
export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 20, { message: 'Passwords must be between 6 and 20 characters long' })
  password: string;
}
