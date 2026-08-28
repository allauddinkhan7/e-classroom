import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [PrismaModule, RedisModule, UsersModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
