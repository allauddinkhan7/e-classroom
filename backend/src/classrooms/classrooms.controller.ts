import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClassroomsService } from './classrooms.service';

@Controller('classrooms')
@UseGuards(JwtAuthGuard)
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateClassroomDto) {
    return this.classroomsService.create(req.user.userId, req.user.role, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.classroomsService.findAllForUser(req.user.userId);
  }
}