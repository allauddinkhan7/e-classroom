import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertIsMember(userId: string, classroomId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId } },
    });

    if (!enrollment) {
      throw new ForbiddenException("You are not a member of this classroom");
    }
  }

  async create(userId: string, classroomId: string, dto: CreateNoteDto) {
    await this.assertIsMember(userId, classroomId);
    return this.prisma.note.create({
      data: { classroomId, userId, content: dto.content },
    });
  }

  async findAllForUser(userId: string, classroomId: string) {
    await this.assertIsMember(userId, classroomId);

    return this.prisma.note.findMany({
      where: { classroomId, userId }, // only this user's own notes — private by design
      orderBy: { createdAt: "desc" },
    });
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      throw new NotFoundException("Note not found");
    }
    if (note.userId !== userId) {
      throw new ForbiddenException("You can only delete your own notes");
    }

    await this.prisma.note.delete({ where: { id: noteId } });
    return { deleted: true };
  }

  async update(userId: string, noteId: string, dto: CreateNoteDto) {
  const note = await this.prisma.note.findUnique({ where: { id: noteId } });
  if (!note) {
    throw new NotFoundException('Note not found');
  }
  if (note.userId !== userId) {
    throw new ForbiddenException('You can only edit your own notes');
  }

  return this.prisma.note.update({
    where: { id: noteId },
    data: { content: dto.content },
  });
}
}


