import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './ws-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    // Connection-level auth happens per-event via WsJwtGuard below;
    // this hook is just here in case we need connection logging later.
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinClassroom')
  async joinClassroom(@ConnectedSocket() client: Socket, @MessageBody() data: { classroomId: string }) { // @MessageBody is Nestjs decorator that extracts the message body from the incoming WebSocket event in this case, the classroomId that the client wants to join. 
    const userId = client.data.user.userId;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId: data.classroomId } },
    });
    if (!enrollment) return; // silently ignore — not a member, not allowed in this room

    client.join(`classroom:${data.classroomId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { classroomId: string; content: string }) {
    const userId = client.data.user.userId;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId: data.classroomId } },
    });
    if (!enrollment) return;

    const message = await this.prisma.message.create({
      data: { senderId: userId, classroomId: data.classroomId, content: data.content },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    // Broadcast to everyone in that classroom's room, including the sender —
    // this is what makes the sender's own message appear instantly too,
    // rather than the frontend needing to fake it optimistically.
    this.server.to(`classroom:${data.classroomId}`).emit('newMessage', message);
  }
}