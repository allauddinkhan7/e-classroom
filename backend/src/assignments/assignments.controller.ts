import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('classrooms/:classroomId/assignments')
  create(@Req() req: any, @Param('classroomId') classroomId: string, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(req.user.userId, classroomId, dto);
  }

  @Get('classrooms/:classroomId/assignments')
  findAll(@Req() req: any, @Param('classroomId') classroomId: string) {
    return this.assignmentsService.findAllForClassroom(req.user.userId, classroomId);
  }
  @Get('assignments/:assignmentId')
  findOneAssignment(@Req() req: any, @Param('assignmentId') assignmentId: string) {
    const data =  this.assignmentsService.findAssignmentForEdit(req.user.userId, assignmentId);
    return data;
  }
  
  @Post('assignments/:id/submit')
  submit(@Req() req: any, @Param('id') id: string, @Body() dto: SubmitAssignmentDto) {
    return this.assignmentsService.submit(req.user.userId, id, dto);
  }

  @Get('assignments/:id/submissions')
  findSubmissions(@Req() req: any, @Param('id') id: string) {
    return this.assignmentsService.findSubmissions(req.user.userId, id);
  }

  @Post('submissions/:id/grade')
  grade(@Req() req: any, @Param('id') id: string, @Body() dto: GradeSubmissionDto) {
    return this.assignmentsService.grade(req.user.userId, id, dto);
  }
  
  @Patch('assignments/:id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(req.user.userId, id, dto);
  }
}