import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    UsersModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  
  controllers: [AuthController],
  providers: [AuthService], 
})
export class AuthModule {}
