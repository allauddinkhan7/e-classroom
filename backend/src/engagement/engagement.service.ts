import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  async triggerAttendanceCheck(teacherId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) {
      throw new NotFoundException("Classroom not found");
    }
    if (classroom.createdBy !== teacherId) {
      throw new ForbiddenException(
        "Only the teacher can trigger an attendance check",
      );
    }

    const meeting = await this.prisma.meeting.findFirst({
      where: { classroomId, endedAt: null },
    });

    if (!meeting) {
      throw new NotFoundException(
        "No active class session — start the class first",
      );
    }

    return this.prisma.attendanceCheck.create({
      data: { meetingId: meeting.id },
    });
  }

  async respondToAttendance(userId: string, attendanceCheckId: string) {
    const check = await this.prisma.attendanceCheck.findUnique({
      where: { id: attendanceCheckId },
      include: {
        meeting: { include: { classroom: { include: { enrollments: true } } } },
      },
    });
    if (!check) {
      throw new NotFoundException("Attendance check not found");
    }

    const isMember = check?.meeting?.classroom?.enrollments.some(
      (e) => e.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this classroom");
    }

    const existing = await this.prisma.attendanceResponse.findUnique({
      where: { attendanceCheckId_userId: { attendanceCheckId, userId } },
    });
    if (existing) {
      throw new ConflictException("Already responded");
    }

    return this.prisma.attendanceResponse.create({
      data: { attendanceCheckId, userId },
    });
  }

  async getResults(teacherId: string, attendanceCheckId: string) {
    const check = await this.prisma.attendanceCheck.findUnique({
      where: { id: attendanceCheckId },
      include: {
        meeting: {
          include: {
            classroom: {
              include: {
                enrollments: {
                  include: { user: { select: { id: true, fullName: true } } },
                },
              },
            },
          },
        },
        responses: {
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!check) {
      throw new NotFoundException("Attendance check not found");
    }
    if (check?.meeting?.classroom?.createdBy !== teacherId) {
      throw new ForbiddenException("Only the teacher can view results");
    }

    const respondedIds = new Set(check.responses.map((r) => r.userId));
    // get all student in that class
    const allStudents = check.meeting.classroom.enrollments
      .map((e) => e.user)
      .filter((u) => u.id !== teacherId);
    return {
      responded: check.responses.map((r) => r.user),
      missing: allStudents.filter((u) => !respondedIds.has(u.id)),
    };
  }

  // ====== POP-UP Random Question =======

  async triggerPopQuestion(teacherId: string,classroomId: string,question: string,answer: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) {
      throw new NotFoundException("Classroom not found");
    }
    if (classroom.createdBy !== teacherId) {
      throw new ForbiddenException(
        "Only the teacher can trigger a pop question",
      );
    }

    const meeting = await this.prisma.meeting.findFirst({
      where: { classroomId, endedAt: null },
    });
    if (!meeting) {
      throw new NotFoundException(
        "No active class session — start the class first",
      );
    }

    return this.prisma.popQuestion.create({
      data: { meetingId: meeting.id, question, answer },
    });
  }

  async respondToPopQuestion(userId: string,popQuestionId: string,answer: string) {
    const popQuestion = await this.prisma.popQuestion.findUnique({
      where: { id: popQuestionId },
      include: {
        meeting: { include: { classroom: { include: { enrollments: true } } } },
      },
    });
    if (!popQuestion) {
      throw new NotFoundException("Pop question not found");
    }

    const isMember = popQuestion?.meeting?.classroom?.enrollments.some(
      (e) => e.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this classroom");
    }

    const existing = await this.prisma.questionResponse.findUnique({
      where: { popQuestionId_userId: { popQuestionId, userId } },
    });
    if (existing) {
      throw new ConflictException("Already responded");
    }

    return this.prisma.questionResponse.create({
      data: { popQuestionId, userId, answer },
    });
  }

  async getPopQuestionResults(teacherId: string, popQuestionId: string) {
    const popQuestion = await this.prisma.popQuestion.findUnique({
      where: { id: popQuestionId },
      include: { meeting: { include: { classroom: { include: { enrollments: { include: { user: { select: { id: true, fullName: true } } } } } } } },
      responses: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });

    if (!popQuestion) {
      throw new NotFoundException("Pop question not found");
    }
    if (popQuestion?.meeting?.classroom?.createdBy !== teacherId) {
      throw new ForbiddenException("Only the teacher can view results");
    }

    const respondedIds = new Set(popQuestion.responses.map((r) => r.userId));

    const allStudents = popQuestion?.meeting?.classroom?.enrollments
      .map((e) => e.user)
      .filter((u) => u.id !== teacherId);

    return {
      question: popQuestion.question,
      correctAnswer: popQuestion.answer,
        responses: popQuestion.responses.map((r) => ({
          user: r.user,
          answer: r.answer,
          isCorrect: r.answer.trim().toLowerCase() === popQuestion.answer.trim().toLowerCase(),
        })),
        missing: allStudents?.filter((u) => !respondedIds.has(u.id)),
    };
  }
}