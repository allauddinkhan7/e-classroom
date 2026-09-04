import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MeetingsService } from './meetings.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post("classrooms/:classroomId/meetings/join")
  join(@Req() req: any, @Param("classroomId") classroomId: string) {
    return this.meetingsService.startOrJoinClassroomMeeting(
      req.user.userId,
      req.user.fullName,
      classroomId,
    );
  }

  @Post("meetings/:id/end")
  end(@Req() req: any, @Param("id") id: string) {
    return this.meetingsService.endMeeting(req.user.userId, id);
  }
}