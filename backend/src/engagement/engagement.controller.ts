import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EngagementService } from './engagement.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('attendance-checks/:id/results')
  getResults(@Req() req: any, @Param('id') id: string) { // attendanceCheckId
    return this.engagementService.getResults(req.user.userId, id);
  }

  @Get("pop-questions/:id/results")
  getPopQuestionResults(@Req() req: any, @Param("id") id: string) {
    return this.engagementService.getPopQuestionResults(req.user.userId, id);
  }
}