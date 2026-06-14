import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { NoteModule } from "./note/note.module";
import { CommonModule } from "./common/common.module";
import { AccessTokenGuard } from "./common/guards/access-token.guards";

@Module({
  imports: [AuthModule, UserModule, NoteModule, CommonModule],
})
export class AppModule {}
