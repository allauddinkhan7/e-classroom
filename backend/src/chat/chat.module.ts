import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { WsJwtGuard } from './ws-jwt.guard';
import { AuthModule } from '../auth/auth.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { RedisModule } from '../redis/redis.module';
import { PresenceController } from './presence.controller';
import { EngagementModule } from '../engagement/engagement.module';

@Module({
  imports: [AuthModule, ConversationsModule, RedisModule, EngagementModule],
  controllers: [ChatController, PresenceController],
  providers: [ChatGateway, WsJwtGuard],
})
export class ChatModule {}