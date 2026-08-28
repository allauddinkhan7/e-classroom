import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getRoot(): string {
    return "E-Classroom backend is running";
  }

  @Get("health/db")
  async checkDb() {
    const userCount = await this.prisma.user.count();
    return { status: "connected", userCount };
  }
}
