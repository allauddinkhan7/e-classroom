import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { RedisModule } from "../redis/redis.module";
import { ClassroomModule } from "../classrooms/classrooms.module";
import { AssignmentsModule } from "../assignments/assignments.module";
import { FilesModule } from "../files/files.module";
import { MaterialsModule } from "../materials/materials.module";
import { NotesModule } from "../notes/notes.module";

@Module({
  imports: [PrismaModule, RedisModule, UsersModule, AuthModule, ClassroomModule, AssignmentsModule, FilesModule, MaterialsModule, NotesModule],
  controllers: [AppController],
})
export class AppModule {}
