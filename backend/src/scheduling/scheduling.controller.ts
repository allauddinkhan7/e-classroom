import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulingService } from './scheduling.service';
import { ScheduleClassDto } from './dto/schedule-class.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('classrooms/:classroomId/schedule')
  schedule(@Req() req: any, @Param('classroomId') classroomId: string, @Body() dto: ScheduleClassDto) {
    return this.schedulingService.scheduleClass(req.user.userId, classroomId, dto.scheduledAt);
  }

  @Get('classrooms/:classroomId/scheduled-sessions')
  findUpcoming(@Req() req: any, @Param('classroomId') classroomId: string) {
    return this.schedulingService.findUpcomingForClassroom(req.user.userId, classroomId);
  }
}