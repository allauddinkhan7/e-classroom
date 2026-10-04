import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';

const RESET_TTL_SECONDS = 60 * 30; // 30 minutes — shorter than email verification, since a leaked reset link is more dangerous

@Injectable()
export class PasswordResetService {
  constructor(private readonly redis: RedisService) {}

  async createToken(userId: string): Promise<string> {
    const token = randomUUID();
    await this.redis.set(`password-reset:${token}`, userId, 'EX', RESET_TTL_SECONDS);
    return token;
  }

  async consumeToken(token: string): Promise<string | null> {
    const userId = await this.redis.get(`password-reset:${token}`);
    if (!userId) return null;
    await this.redis.del(`password-reset:${token}`);
    return userId;
  }
}