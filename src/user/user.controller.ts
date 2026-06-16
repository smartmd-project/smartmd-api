import { Controller, Get, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getInfo(@Req() req) {
    const userId = req.user.userId;
    return await this.userService.getInfoUsers(userId);
  }
  @Patch('me')
  async updateInfo(@Req() req) {
    const userId = req.user.userId;
    // logic cập nhật thông tin người dùng
  }
}
