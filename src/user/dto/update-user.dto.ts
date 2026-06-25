import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Updated display name of the authenticated user.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
