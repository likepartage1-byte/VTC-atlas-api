import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly SESSION_TTL = 86400 * 30; // 30 days

  constructor(private readonly redis: RedisService) {}

  /**
   * DIRECT CALL: Establish session context.
   */
  async createSession(userId: string, deviceId: string, phoneNumber: string): Promise<void> {
    const redisClient = this.redis.getClient();
    const sessionKey = `session:${userId}:${deviceId}`;
    
    await redisClient.set(sessionKey, JSON.stringify({
      phoneNumber,
      issuedAt: new Date().toISOString(),
    }), 'EX', this.SESSION_TTL);

    this.logger.log(`[Session] Created for user ${userId} on device ${deviceId}`);
  }

  async isSessionValid(userId: string, deviceId: string): Promise<boolean> {
    const key = `session:${userId}:${deviceId}`;
    const exists = await this.redis.getClient().exists(key);
    return exists === 1;
  }

  async revokeSession(userId: string, deviceId: string): Promise<void> {
    await this.redis.getClient().del(`session:${userId}:${deviceId}`);
  }
}
