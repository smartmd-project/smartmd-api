import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiCookieAuth('access_token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'Authenticated user profile.',
    schema: {
      example: {
        id: '0b637ecf-9987-4c8f-90a0-c1f098b46db9',
        name: 'Nguyen Van A',
        email: 'user@example.com',
      },
    },
  })
  @Get('me')
  async getInfo(@Req() req) {
    const userId = req.user.userId;
    return await this.userService.getInfoUsers(userId);
  }

  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Updated user profile.',
    schema: {
      example: {
        id: '0b637ecf-9987-4c8f-90a0-c1f098b46db9',
        name: 'Nguyen Van A',
        email: 'user@example.com',
        avatarUrl: null,
        createdAt: '2026-06-25T10:00:00.000Z',
        updateAt: '2026-06-25T10:00:00.000Z',
      },
    },
  })
  @Patch('me')
  async updateInfo(@Req() req, @Body() updateUserDto: { name: string }) {
    const userId = req.user.userId;
    return await this.userService.updateInfoUsers(userId, updateUserDto);
  }
}
