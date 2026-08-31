import { Module } from "@nestjs/common";
import { AssignmentsService } from "./assignments.service";
import { AssignmentsController } from "./assignments.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [AssignmentsService],
  controllers: [AssignmentsController],
})
export class AssignmentsModule {}
