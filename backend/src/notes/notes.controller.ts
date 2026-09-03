import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/create-note.dto";

@Controller()
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post("classrooms/:classroomId/notes")
  create(@Req() req: any, @Param("classroomId") classroomId: string, @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(req.user.userId, classroomId, dto);
  }

  @Get("classrooms/:classroomId/notes")
  findAll(@Req() req: any, @Param("classroomId") classroomId: string) {
    return this.notesService.findAllForUser(req.user.userId, classroomId);
  }

  @Delete("notes/:id")
  remove(@Req() req: any, @Param("id") id: string) {
    return this.notesService.remove(req.user.userId, id);
  }

  @Patch("notes/:id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: CreateNoteDto) {
    return this.notesService.update(req.user.userId, id, dto);
  }
}
