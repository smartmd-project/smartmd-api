import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/service/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HasingService } from "../common/service/hasing.service";

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hasingService: HasingService,
  ) {}
  async getInfoUsers(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      if (!user) {
        throw new Error("User not found!");
      }
      return user;
    } catch (error) {
      throw new Error("Failed to fetch user information");
    }
  }
  async updateInfoUsers(userId: string, updateUser: UpdateUserDto) {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          name: updateUser.name,
        },
      });
      return user;
    } catch (error) {
      throw new Error("Failed to update user information");
    }
  }
}
