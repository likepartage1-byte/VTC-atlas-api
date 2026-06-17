import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

export enum DispatchSessionStatus {
  SEARCHING = 'SEARCHING',
  OFFERING = 'OFFERING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface DispatchSession {
  rideId: string;
  status: DispatchSessionStatus;
  candidateIds: string[];
  createdAt: string;
  expiresAt: string;
}

@Injectable()
export class DispatchSessionManager {
  private readonly logger = new Logger(DispatchSessionManager.name);
  private readonly SESSION_PREFIX = 'dispatch:session:';
  private readonly SESSION_TTL = 60; // Max life of a dispatch session

  constructor(private readonly redis: RedisService) {}

  /**
   * START: Create a new dispatch lifecycle.
   * Atomic check to ensure one session per ride.
   */
  async startSession(rideId: string, candidateIds: string[]): Promise<boolean> {
    const redisClient = this.redis.getClient();
    const key = `${this.SESSION_PREFIX}${rideId}`;

    const session: DispatchSession = {
      rideId,
      candidateIds,
      status: DispatchSessionStatus.OFFERING,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30000).toISOString(), // 30s window
    };

    // Atomic SET NX to prevent duplicate sessions
    const created = await redisClient.set(key, JSON.stringify(session), 'EX', this.SESSION_TTL, 'NX');
    
    if (created !== 'OK') {
      this.logger.warn(`[Orchestrator] Dispatch session already exists for ride: ${rideId}`);
      return false;
    }

    this.logger.log(`[Orchestrator] Started dispatch session for ride: ${rideId} with ${candidateIds.length} candidates.`);
    return true;
  }

  async getSession(rideId: string): Promise<DispatchSession | null> {
    const key = `${this.SESSION_PREFIX}${rideId}`;
    const data = await this.redis.getClient().get(key);
    return data ? JSON.parse(data) : null;
  }

  async completeSession(rideId: string) {
    const key = `${this.SESSION_PREFIX}${rideId}`;
    await this.redis.getClient().del(key);
    this.logger.log(`[Orchestrator] Completed/Closed dispatch session for ride: ${rideId}`);
  }
}
