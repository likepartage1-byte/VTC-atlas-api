import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';
import { DomainEventBus } from '../../../../core/events/domain-event-bus';
import { SecurityUtils } from '../../infrastructure/security/security.utils';
import { SessionCreatedEvent } from '../../domain/events/identity-events';

export interface SessionMeta {
  ip: string;
  userAgent: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 Days

  constructor(
    private readonly redis: RedisService,
    private readonly eventBus: DomainEventBus,
  ) {}

  /**
   * Creates or replaces a session for a specific user-device pair.
   * "Single Session Family per Device"
   */
  async createSession(userId: string, deviceId: string, meta: SessionMeta): Promise<string> {
    const refreshToken = SecurityUtils.generateRandomToken();
    const tokenHash = SecurityUtils.hashToken(refreshToken);
    const sessionId = crypto.randomUUID();

    const sessionKey = `session:${userId}:${deviceId}`;
    
    await this.redis.getClient().hset(sessionKey, {
      tokenHash,
      sessionId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      lastUsedAt: new Date().toISOString(),
    });

    await this.redis.getClient().expire(sessionKey, this.REFRESH_TOKEN_TTL);

    this.logger.log(`Session created: ${userId} on ${deviceId}`);
    
    await this.eventBus.publish(new SessionCreatedEvent(userId, deviceId));

    return refreshToken;
  }

  /**
   * Rotates a refresh token. 
   * Strict Rule: If token mismatch, kill the entire session.
   */
  async refreshSession(userId: string, deviceId: string, providedToken: string): Promise<string> {
    const sessionKey = `session:${userId}:${deviceId}`;
    const session = await this.redis.getClient().hgetall(sessionKey);

    if (!session || Object.keys(session).length === 0) {
      throw new UnauthorizedException('Session expired or not found.');
    }

    // 1. Validate Token Hash (THE SECURITY INVARIANT)
    const isMatch = SecurityUtils.verifyToken(providedToken, session.tokenHash);

    if (!isMatch) {
      // REPLAY ATTACK DETECTED
      this.logger.warn(`Security Breach Attempt: Token mismatch for ${userId}. Revoking session.`);
      await this.revokeSession(userId, deviceId);
      throw new UnauthorizedException('Security breach detected. Please login again.');
    }

    // 2. Linear Rotation: New token replaces old
    const newRefreshToken = SecurityUtils.generateRandomToken();
    const newTokenHash = SecurityUtils.hashToken(newRefreshToken);

    await this.redis.getClient().hset(sessionKey, {
      tokenHash: newTokenHash,
      lastUsedAt: new Date().toISOString(),
    });

    return newRefreshToken;
  }

  async revokeSession(userId: string, deviceId: string): Promise<void> {
    const sessionKey = `session:${userId}:${deviceId}`;
    await this.redis.getClient().del(sessionKey);
    this.logger.log(`Session revoked: ${userId} on ${deviceId}`);
  }
}
