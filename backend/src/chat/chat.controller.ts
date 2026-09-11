import { Controller, Get, Param, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('classrooms/:classroomId/messages')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findMessages(@Req() req: any, @Param('classroomId') classroomId: string, @Query('take') take?: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId: req.user.userId, classroomId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You are not a member of this classroom');
    }

    return this.prisma.message.findMany({
      where: { classroomId },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { sentAt: 'desc' },
      take: take ? Number(take) : 50,
    });
  }
}