import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassroomType } from '@prisma/client';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertIsMember(userId: string, classroomId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You are not a member of this classroom');
    }
  }

  async create(userId: string, classroomId: string, dto: CreateMaterialDto) {
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }
    if (classroom.type !== ClassroomType.COURSE || classroom.createdBy !== userId) {
      throw new ForbiddenException('Only the teacher of this course can post materials');
    }

    return this.prisma.material.create({
      data: { classroomId, title: dto.title, fileId: dto.fileId },
      include: { file: { select: { id: true, originalName: true, mimeType: true } } },
    });
  }

  async findAllForClassroom(userId: string, classroomId: string) {
    await this.assertIsMember(userId, classroomId);

    return this.prisma.material.findMany({
      where: { classroomId },
      include: { file: { select: { id: true, originalName: true, mimeType: true } } },
      orderBy: { postedAt: 'desc' },
    });
  }

  async remove(userId: string, materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { classroom: true },
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    if (material.classroom.createdBy !== userId) {
      throw new ForbiddenException('Only the teacher of this course can remove materials');
    }

    await this.prisma.material.delete({ where: { id: materialId } });
    return { deleted: true };
  }
}