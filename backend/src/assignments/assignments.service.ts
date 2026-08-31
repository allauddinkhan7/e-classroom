import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassroomType } from '@prisma/client';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /*
    assertIsMember reuses the same enrollment-check pattern from ClassroomsService.findOne 
    — any member (teacher or student) can see assignments, but only the classroom's actual teacher can create/grade;
  */
  private async assertIsMember(userId: string, classroomId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You are not a member of this classroom');
    }
    return enrollment;
  }

  async create(userId: string, classroomId: string, dto: CreateAssignmentDto) {
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }
    if (classroom.type !== ClassroomType.COURSE || classroom.createdBy !== userId) {
      throw new ForbiddenException('Only the teacher of this course can create assignments');
    }

    return this.prisma.assignment.create({
      data: {
        classroomId,
        title: dto.title,
        description: dto.description,
        totalMarks: dto.totalMarks,
        dueAt: new Date(dto.dueAt),
      },
    });
  }

  async findAllForClassroom(userId: string, classroomId: string) {
    await this.assertIsMember(userId, classroomId);

    return this.prisma.assignment.findMany({
      where: { classroomId },
      include: {
        submissions: { where: { userId }, select: { id: true, obtainedMarks: true, submittedAt: true } },
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  /*
    submit blocks both late submissions and duplicate submissions server-side
  */
  async submit(userId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.assertIsMember(userId, assignment.classroomId);

    if (new Date() > assignment.dueAt) {
      throw new BadRequestException('The due date for this assignment has passed');
    }

    const existing = await this.prisma.submission.findUnique({
      where: { assignmentId_userId: { assignmentId, userId } },
    });
    if (existing) {
      throw new BadRequestException('You have already submitted this assignment');
    }

    return this.prisma.submission.create({
      data: { assignmentId, userId },
    });
  }

  async findSubmissions(requesterId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    if (assignment.classroom.createdBy !== requesterId) {
      throw new ForbiddenException('Only the teacher of this course can view submissions');
    }

    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }
  /*
    grade validates marks can't exceed the assignment's total, catching an obvious data-integrity mistake before it reaches the database.
  */
  async grade(requesterId: string, submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { classroom: true } } },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.assignment.classroom.createdBy !== requesterId) {
      throw new ForbiddenException('Only the teacher of this course can grade submissions');
    }
    if (dto.obtainedMarks > submission.assignment.totalMarks) {
      throw new BadRequestException(
        `Marks cannot exceed the assignment total of ${submission.assignment.totalMarks}`,
      );
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { obtainedMarks: dto.obtainedMarks },
    });
  }
}