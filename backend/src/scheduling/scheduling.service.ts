import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { remindersQueue } from './reminders.queue';

const REMINDER_LEAD_TIME_MS = 5 * 60 * 1000; // 5 minutes before class

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async scheduleClass(teacherId: string, classroomId: string, scheduledAt: string) {
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }
    if (classroom.createdBy !== teacherId) {
      throw new ForbiddenException('Only the teacher can schedule a class');
    }

    const scheduledDate = new Date(scheduledAt);
    const reminderTime = scheduledDate.getTime() - REMINDER_LEAD_TIME_MS;
    const delay = reminderTime - Date.now();

    if (delay < 0) {
      throw new BadRequestException('Scheduled time must be more than 5 minutes in the future');
    }

    const session = await this.prisma.scheduledSession.create({
      data: { classroomId, scheduledAt: scheduledDate, createdBy: teacherId },
    });


    await remindersQueue.add(
      'send-class-reminder',
      { scheduledSessionId: session.id },
      { delay },
    );

    return session;
  }

  async findUpcomingForClassroom(userId: string, classroomId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You are not a member of this classroom');
    }

    return this.prisma.scheduledSession.findMany({
      where: { classroomId, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}