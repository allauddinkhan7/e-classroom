import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassroomType, EnrollmentRole, Role } from '@prisma/client';
import { CreateClassroomDto } from './dto/create-classroom.dto';

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
          create: {
            userId,
            roleInClass: EnrollmentRole.HOST,
          },
        },
      },
      include: { enrollments: true },
    });
  }
    // only returns classrooms the user is actually enrolled in — not every classroom in the system.
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
}