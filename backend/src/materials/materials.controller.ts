import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('classrooms/:classroomId/materials')
  create(@Req() req: any, @Param('classroomId') classroomId: string, @Body() dto: CreateMaterialDto) {
    return this.materialsService.create(req.user.userId, classroomId, dto);
  }

  @Get('classrooms/:classroomId/materials')
  findAll(@Req() req: any, @Param('classroomId') classroomId: string) {
    return this.materialsService.findAllForClassroom(req.user.userId, classroomId);
  }

  @Delete('materials/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.materialsService.remove(req.user.userId, id);
  }
}