import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  private readonly roomService: RoomServiceClient;

  constructor(private readonly prisma: PrismaService) {
    this.roomService = new RoomServiceClient(
      process.env
        .LIVEKIT_URL!.replace("ws://", "http://")
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

    // Reuse an active meeting for this classroom if one already exists,
    // otherwise create a new one — this is what makes "one active session
    // per classroom" work without a teacher needing to coordinate timing.
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
    return { meetingId: meeting.id, token, url: process.env.LIVEKIT_URL };
  }

  // async endMeeting(userId: string, meetingId: string) {
  //   const meeting = await this.prisma.meeting.findUnique({
  //     where: { id: meetingId },
  //     include: { classroom: true },
  //   });
  //   if (!meeting) {
  //     throw new NotFoundException('Meeting not found');
  //   }
  //   if (meeting.classroom?.createdBy !== userId) {
  //     throw new ForbiddenException('Only the teacher can end the meeting');
  //   }

  //   await this.roomService.deleteRoom(meetingId);
  //   await this.prisma.meeting.update({
  //     where: { id: meetingId },
  //     data: { endedAt: new Date() },
  //   });

  //   return { ended: true };
  // }

  //chatgpt
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

    // If the meeting is already ended, nothing more needs to be done.
    if (meeting.endedAt) {
      console.log("meeting.endedAt");

      return { ended: true };
    }

    // The LiveKit room may already have disappeared if nobody joined
    // or if it was already closed. That should not prevent us from
    // marking the meeting as ended in our database.
    try {
      await this.roomService.deleteRoom(meetingId);
    } catch (error: any) {
      if (error?.status !== 404 && error?.code !== "not_found") {
        throw error;
      }
    }

    // Always mark the meeting as ended in PostgreSQL.
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