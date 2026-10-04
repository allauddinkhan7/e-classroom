import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';

const VERIFICATION_TTL_SECONDS = 60 * 60 * 24; // 24 hours
// const VERIFICATION_TTL_SECONDS = 10; // 10 sec

@Injectable()
export class EmailVerificationService {
  constructor(private readonly redis: RedisService) {}

  async createToken(userId: string): Promise<string> {
    const token = randomUUID();
    await this.redis.set(`email-verify:${token}`, userId, 'EX', VERIFICATION_TTL_SECONDS);
    return token;
  }

  async consumeToken(token: string): Promise<string | null> {
    const userId = await this.redis.get(`email-verify:${token}`);
    if (!userId) return null;
    await this.redis.del(`email-verify:${token}`); // one-time use
    return userId;
  }
}