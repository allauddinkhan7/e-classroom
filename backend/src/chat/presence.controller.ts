import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedisService } from '../redis/redis.service';

@Controller('presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(private readonly redis: RedisService) {}

  @Get()
  async getPresence(@Query('userIds') userIds: string) {
    const ids = userIds.split(',').filter(Boolean);
    const results = await Promise.all(
      ids.map(async (id) => ({ userId: id, online: (await this.redis.get(`presence:${id}`)) !== null })),
    );
    return results;
  }
}