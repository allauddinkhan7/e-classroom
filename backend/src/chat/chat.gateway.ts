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
import { ConversationsService } from '../conversations/conversations.service';
import { RedisService } from '../redis/redis.service';
import { EngagementService } from '../engagement/engagement.service';

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
    private readonly redis: RedisService,
    private readonly engagementService: EngagementService,
  ) {}

  async handleConnection(client: Socket) {
    // Connection-level auth happens per-event via WsJwtGuard below;
    // this hook is just here in case we need connection logging later.
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.userId;
    if (!userId) return;

    // A user might have multiple tabs/devices connected — only mark them
    // fully offline once their LAST connection closes, not the first.
    const remaining = await this.redis.decr(`presence:${userId}`);
    if (remaining <= 0) {
      await this.redis.del(`presence:${userId}`);
      this.server.emit("presenceChanged", { userId, online: false });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("markOnline")
  async markOnline(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.userId;
    const count = await this.redis.incr(`presence:${userId}`);
    if (count === 1) {
      this.server.emit("presenceChanged", { userId, online: true });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("joinClassroom")
  async joinClassroom( @ConnectedSocket() client: Socket, @MessageBody() data: { classroomId: string }) {
    // @MessageBody is Nestjs decorator that extracts the message body from the incoming WebSocket event in this case, the classroomId that the client wants to join.
    const userId = client.data.user.userId;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId: data.classroomId } },
    });
    if (!enrollment) return; // silently ignore — not a member, not allowed in this room

    client.join(`classroom:${data.classroomId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("sendMessage")
  async sendMessage( @ConnectedSocket() client: Socket, @MessageBody() data: { classroomId: string; content: string }) {
    const userId = client.data.user.userId;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId: data.classroomId } },
    });
    if (!enrollment) return;

    const message = await this.prisma.message.create({
      data: {
        senderId: userId,
        classroomId: data.classroomId,
        content: data.content,
      },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    // Broadcast to everyone in that classroom's room, including the sender —
    // this is what makes the sender's own message appear instantly too,
    // rather than the frontend needing to fake it optimistically.
    this.server.to(`classroom:${data.classroomId}`).emit("newMessage", message);
  }


  // who joins the room?
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("joinConversation")
  async joinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const userId = client.data.user.userId;
    try {
      await this.conversationsService.assertIsParticipant(userId, data.conversationId);
      client.join(`conversation:${data.conversationId}`);
    } catch {
      // not a participant — silently ignore, same pattern as joinClassroom
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("sendDirectMessage")
  async sendDirectMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string; content: string }) {
    const userId = client.data.user.userId;
    try {
      await this.conversationsService.assertIsParticipant( userId, data.conversationId );
    } catch {
      return;
    }

    const message = await this.prisma.message.create({
      data: {
        senderId: userId,
        conversationId: data.conversationId,
        content: data.content,
      },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    this.server
      .to(`conversation:${data.conversationId}`) // Send the message only to sockets that have joined this particular conversation room.
      .emit("newDirectMessage", message);        // Send an event called newDirectMessage to everyone in that room.
  }


  // ====== POP-UP Random Attendance =======

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("triggerAttendanceCheck") // Backend is listening for this event from a client."
  async triggerAttendanceCheck(@ConnectedSocket() client: Socket, @MessageBody() data: { classroomId: string }) {
    const userId = client.data.user.userId;
    try {
      const check = await this.engagementService.triggerAttendanceCheck(userId, data.classroomId);

      // Broadcast to everyone in the classroom room — this is the actual
      // "surprise pop-up" moment students see live.

      this.server.to(`classroom:${data.classroomId}`).emit("attendanceCheckStarted", { id: check.id });
      /*
        this.server is your Socket.IO server.
        Think of it as the central Socket.IO system that knows about all currently connected users.

        .to() 
        Send the message only to sockets that have joined this particular classroom


      */
    } catch (error: any) {
      client.emit("actionError", {
        message: error?.message ?? "Could not start attendance check",
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("respondToAttendance")
  async respondToAttendance( @ConnectedSocket() client: Socket, @MessageBody() data: { attendanceCheckId: string; classroomId: string }) {
    const userId = client.data.user.userId;
    try {
      await this.engagementService.respondToAttendance( userId, data.attendanceCheckId );
      // Let the teacher's UI update live as responses come in, without polling.
      
      this.server
        .to(`classroom:${data.classroomId}`)
        .emit("attendanceResponseReceived", { attendanceCheckId: data.attendanceCheckId, userId });

    } catch {
      // Already responded, or not a member — silently ignore, same pattern as elsewhere
    }
  }



  // ====== POP-UP Random Question =======
  @UseGuards(WsJwtGuard)
  @SubscribeMessage("triggerPopQuestion")
  async triggerPopQuestion(@ConnectedSocket() client: Socket, @MessageBody() data: { classroomId: string; question: string; answer: string }) {
    const userId = client.data.user.userId;
    try {
      const popQuestion = await this.engagementService.triggerPopQuestion(
      userId,
      data.classroomId,
      data.question,
      data.answer,
    );
      
      // broadcast it to all students
      this.server.to(`classroom:${data.classroomId}`).emit("popQuestionStarted", { id: popQuestion.id, question: popQuestion.question });

    } catch (error: any) {
      client.emit('actionError', { message: error?.message ?? 'Could not start pop question' });

    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("respondToPopQuestion")
  async respondToPopQuestion(@ConnectedSocket() client: Socket, @MessageBody() data: { popQuestionId: string; classroomId: string; answer: string }) {
    const userId = client.data.user.userId;
    
     try {
      await this.engagementService.respondToPopQuestion( userId, data.popQuestionId, data.answer);
      // Let the teacher's UI update live as responses come in, without polling.
      
      this.server
        .to(`classroom:${data.classroomId}`)
        .emit("popQuestionResponseReceived", { popQuestionId: data.popQuestionId, userId});

    } catch {
      // Already responded, or not a member — silently ignore, same pattern as elsewhere
    }
  }
}