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

  async revokeAllUserSessions(userId: string, driverId?: string): Promise<void> {
    const redisClient = this.redis.getClient();

    // 1. Delete session keys for this specific user
    const keys = await redisClient.keys(`session:${userId}:*`);
    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
    }

    // 2. Delete single-user presence keys
    await redisClient.del(`presence:${userId}`);
    await redisClient.del(`driver:${userId}:state`);
    await redisClient.del(`driver:${userId}:location`);

    if (driverId) {
      await redisClient.del(`presence:${driverId}`);
      await redisClient.del(`driver:${driverId}:state`);
      await redisClient.del(`driver:${driverId}:location`);
    }

    // 3. TARGETED REMOVAL from shared Redis GEO sets without deleting shared sets
    try {
      await redisClient.zrem('drivers:location', userId);
      await redisClient.zrem('geo:drivers:available', userId);
      if (driverId) {
        await redisClient.zrem('drivers:location', driverId);
        await redisClient.zrem('geo:drivers:available', driverId);
      }
    } catch (err) {
      this.logger.warn(`[Session] Targeted zrem failed: ${(err as Error).message}`);
    }

    this.logger.log(`[Session] Revoked all sessions and presence for user ${userId}${driverId ? ` / driver ${driverId}` : ''}`);
  }
}
