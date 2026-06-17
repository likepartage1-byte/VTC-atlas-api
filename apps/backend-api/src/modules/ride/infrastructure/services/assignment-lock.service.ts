import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class AssignmentLockService {
  private readonly logger = new Logger(AssignmentLockService.name);
  private readonly LOCK_PREFIX = 'ride:lock:';
  private readonly LOCK_TTL = 15; // 15 seconds decision window

  constructor(private readonly redis: RedisService) {}

  /**
   * ATOMIC CLAIM: Try to 'own' the ride proposal.
   * Uses Redis SET NX EX logic.
   */
  async claimRide(rideId: string, driverId: string): Promise<boolean> {
    const redisClient = this.redis.getClient();
    const lockKey = `${this.LOCK_PREFIX}${rideId}`;

    // 1. ATOMIC ATTEMPT: "I am the winner if no one else has this key"
    const result = await redisClient.set(lockKey, driverId, 'EX', this.LOCK_TTL, 'NX');

    if (result !== 'OK') {
      this.logger.warn(`[Conflict] Driver ${driverId} failed to claim ride ${rideId}. Already locked.`);
      return false;
    }

    this.logger.log(`[Locked] Driver ${driverId} secured the atomic lock for ride ${rideId}`);
    return true;
  }

  async getCurrentLockOwner(rideId: string): Promise<string | null> {
    const lockKey = `${this.LOCK_PREFIX}${rideId}`;
    return this.redis.getClient().get(lockKey);
  }

  async releaseLock(rideId: string) {
    const lockKey = `${this.LOCK_PREFIX}${rideId}`;
    await this.redis.getClient().del(lockKey);
  }
}
