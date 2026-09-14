import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateConversationDto) {
    const allParticipantIds = Array.from(new Set([userId, ...dto.participantIds]));

    // For a 1:1 chat, reuse an existing conversation between exactly these
    // two people instead of creating a duplicate every time "Message" is clicked.
    if (allParticipantIds.length === 2) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          AND: allParticipantIds.map((id) => ({
            participants: { some: { userId: id } },
          })),
          participants: { every: { userId: { in: allParticipantIds } } },
        },
        include: { participants: { include: { user: { select: { id: true, fullName: true } } } } },
      });
      if (existing) return existing;
    }

    return this.prisma.conversation.create({
      data: {
        participants: {
          create: allParticipantIds.map((id) => ({ userId: id })),
        },
      },
      include: { participants: { include: { user: { select: { id: true, fullName: true } } } } },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true } } } },
        messages: { orderBy: { sentAt: 'desc' }, take: 1 }, // preview: last message only
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMessages(userId: string, conversationId: string, take = 50) {
    await this.assertIsParticipant(userId, conversationId);

    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { sentAt: 'desc' },
      take,
    });
  }

  async assertIsParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation');
    }
  }
}