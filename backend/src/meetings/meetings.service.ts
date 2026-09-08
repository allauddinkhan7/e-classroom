import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  private readonly roomService: RoomServiceClient;

  constructor(private readonly prisma: PrismaService) {
    this.roomService = new RoomServiceClient(
      process.env
        .LIVEKIT_INTERNAL_URL!.replace("ws://", "http://")
        .replace("wss://", "https://"),
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );
  }

  private async assertIsMember(userId: string, classroomId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId } },
    });
    if (!enrollment) {
      throw new ForbiddenException("You are not a member of this classroom");
    }
    return enrollment;
  }

  async startOrJoinClassroomMeeting(
    userId: string,
    fullName: string,
    classroomId: string,
  ) {
    await this.assertIsMember(userId, classroomId);

    let meeting = await this.prisma.meeting.findFirst({
      where: { classroomId, endedAt: null },
    });

    if (!meeting) {
      meeting = await this.prisma.meeting.create({
        data: { classroomId },
      });
      await this.roomService.createRoom({ name: meeting.id });
    }

    const token = await this.issueToken(userId, fullName, meeting.id);
    return { meetingId: meeting.id, token, url: process.env.LIVEKIT_PUBLIC_URL };
  }

  async endMeeting(userId: string, meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { classroom: true },
    });

    if (!meeting) {
      throw new NotFoundException("Meeting not found");
    }

    if (meeting.classroom?.createdBy !== userId) {
      throw new ForbiddenException("Only the teacher can end the meeting");
    }

    if (meeting.endedAt) {
      console.log("meeting.endedAt");
      return { ended: true };
    }

    try {
      await this.roomService.deleteRoom(meetingId);
    } catch (error: any) {
      if (error?.status !== 404 && error?.code !== "not_found") {
        throw error;
      }
    }

    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { endedAt: new Date() },
    });

    return { ended: true };
  }

  private async issueToken(userId: string, fullName: string, roomName: string) {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: userId,
        name: fullName,
      },
    );
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });
    return at.toJwt();
  }
}
