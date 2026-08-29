import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/gaurds/jwt-auth.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/gaurds/roles.gaurd";
import { Role } from "@prisma/client";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getRoot(): string {
    return "E-Classroom backend is running";
  }

  @Get("health/db")
  @UseGuards(JwtAuthGuard)
  async checkDb(@Req() req: any) {
    const userCount = await this.prisma.user.count();
    return { status: 'connected', userCount, requestedBy: req.user };
  }

  @Get('health/db/teacher-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  async checkDbTeacherOnly(@Req() req: any) {
    const userCount = await this.prisma.user.count();
    return { status: 'connected (teacher-only route)', userCount, requestedBy: req.user };
  }
}
