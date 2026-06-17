import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly ONLINE_PREFIX = 'presence:online:';

  constructor(private readonly redis: RedisService) {}

  /**
   * TRACK: Associate a userId with its current socket.
   */
  async setOnline(userId: string, socketId: string, role: string) {
    const key = `${this.ONLINE_PREFIX}${userId}`;
    const client = this.redis.getClient();
    
    // Store socketId and role
    await client.hset(key, {
      socketId,
      role,
      lastSeen: new Date().toISOString(),
    });
    
    // Set a relative expiration (TTL) if needed, 
    // but usually handled by disconnect events.
    await client.expire(key, 3600); 

    this.logger.log(`[Presence] User ${userId} (${role}) is now ONLINE.`);
  }

  async setOffline(userId: string) {
    const key = `${this.ONLINE_PREFIX}${userId}`;
    await this.redis.getClient().del(key);
    this.logger.log(`[Presence] User ${userId} is now OFFLINE.`);
  }

  async getSocketId(userId: string): Promise<string | null> {
    const key = `${this.ONLINE_PREFIX}${userId}`;
    return this.redis.getClient().hget(key, 'socketId');
  }

  async getOnlineDrivers(): Promise<string[]> {
    // This requires a separate index or set if we want high-performance geo-matching,
    // but for now, we'll keep it simple.
    return []; 
  }
}
