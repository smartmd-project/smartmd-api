import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Display name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Unique email address used for sign in.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'secret123',
    minLength: 6,
    maxLength: 20,
    description: 'Password must be between 6 and 20 characters.',
  })
  @IsString()
  @Length(6, 20, { message: 'Passwords must be between 6 and 20 characters long' })
  password: string;
}
export class SigninDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered user email.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'secret123',
    minLength: 6,
    maxLength: 20,
    description: 'User password.',
  })
  @IsString()
  @Length(6, 20, { message: 'Passwords must be between 6 and 20 characters long' })
  password: string;
}
