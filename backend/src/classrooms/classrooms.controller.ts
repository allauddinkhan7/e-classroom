import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { AddMembersBulkDto } from './dto/add-members-bulk.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

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

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.classroomsService.findOne(req.user.userId, id);
  }

  @Get(':id/available-students')
  findAvailableStudents(@Req() req: any, @Param('id') id: string, @Query('search') search?: string) {
    return this.classroomsService.findAvailableStudents(req.user.userId, id, search);
  }

  @Post(':id/members/bulk')
  addMembersBulk(@Req() req: any, @Param('id') id: string, @Body() dto: AddMembersBulkDto) {
    return this.classroomsService.addMembersBulk(req.user.userId, id, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateClassroomDto) {
    return this.classroomsService.update(req.user.userId, id, dto);
  }
}