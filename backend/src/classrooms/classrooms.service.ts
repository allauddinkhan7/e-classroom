import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassroomType, EnrollmentRole, Role } from '@prisma/client';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { AddMembersBulkDto } from './dto/add-members-bulk.dto';

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, userRole: Role, dto: CreateClassroomDto) {
    if (userRole === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot create classrooms directly');
    }

    const type = userRole === Role.TEACHER ? ClassroomType.COURSE : ClassroomType.STUDY_GROUP;

    return this.prisma.classroom.create({
      data: {
        name: dto.name,
        type,
        createdBy: userId,
        enrollments: {
          create: { userId, roleInClass: EnrollmentRole.HOST },
        },
      },
      include: { enrollments: true },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.classroom.findMany({
      where: { enrollments: { some: { userId } } },
      include: {
        _count: { select: { enrollments: true } },
        creator: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        creator: { select: { id: true, fullName: true } },
        enrollments: {
          include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const isMember = classroom.enrollments.some((e) => e.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this classroom');
    }

    return classroom;
  }

  private async assertCanManageMembers(requesterId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { enrollments: true },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const requesterEnrollment = classroom.enrollments.find((e) => e.userId === requesterId);
    const canManage =
      classroom.type === ClassroomType.COURSE
        ? classroom.createdBy === requesterId
        : requesterEnrollment?.roleInClass === EnrollmentRole.HOST;

    if (!canManage) {
      throw new ForbiddenException('You do not have permission to manage members of this classroom');
    }

    return classroom;
  }

  async findAvailableStudents(requesterId: string, classroomId: string, search?: string) {
    await this.assertCanManageMembers(requesterId, classroomId);

    return this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        enrollments: { none: { classroomId } }, // exclude already-enrolled students
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
      take: 50,
    });
  }

  async addMembersBulk(requesterId: string, classroomId: string, dto: AddMembersBulkDto) {
    await this.assertCanManageMembers(requesterId, classroomId);

    const result = await this.prisma.enrollment.createMany({
      data: dto.userIds.map((userId) => ({
        userId,
        classroomId,
        roleInClass: EnrollmentRole.MEMBER,
      })),
      skipDuplicates: true, // if a race condition double-adds someone, don't crash — just skip
    });

    return { added: result.count };
  }
}