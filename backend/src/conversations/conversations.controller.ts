import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateConversationDto) {
    return this.conversationsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.conversationsService.findAllForUser(req.user.userId);
  }

  @Get(':id/messages')
  findMessages(@Req() req: any, @Param('id') id: string, @Query('take') take?: string) {
    return this.conversationsService.findMessages(req.user.userId, id, take ? Number(take) : undefined);
  }
}