import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EngagementService } from './engagement.service';

@Controller('attendance-checks')
@UseGuards(JwtAuthGuard)
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get(':id/results')
  getResults(@Req() req: any, @Param('id') id: string) { // attendanceCheckId
    return this.engagementService.getResults(req.user.userId, id);
  }
}