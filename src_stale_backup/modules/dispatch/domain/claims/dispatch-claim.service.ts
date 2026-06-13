import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

export type ClaimStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface DispatchClaim {
  id: string;
  rideId: string;
  driverId: string;
  status: ClaimStatus;
  createdAt: number;
  expiresAt: number;
  version: number;
}

@Injectable()
export class DispatchClaimService {
  private readonly logger = new Logger(DispatchClaimService.name);
  private readonly CLAIM_TTL = 25; // Seconds

  constructor(private readonly redis: RedisService) {}

  /**
   * Rule A: Create Claim (Atomic Invariant)
   * Ensures One Driver = One Claim & One Ride = One Claim
   */
  async createClaim(rideId: string, driverId: string): Promise<DispatchClaim | null> {
    const redisClient = this.redis.getClient();
    const claimId = crypto.randomUUID();
    const now = Date.now();

    const claim: DispatchClaim = {
      id: claimId,
      rideId,
      driverId,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + (this.CLAIM_TTL * 1000),
      version: 1,
    };

    const claimKey = `dispatch:claim:${rideId}`;
    const driverIdxKey = `driver:claim:${driverId}`;

    // ATOMIC MULTI-KEY LOCK (Transaction Coordinator logic)
    // We attempt to set the ride claim and the driver index simultaneously
    const multi = redisClient.multi();
    
    // Set ride claim if not exists
    multi.set(claimKey, JSON.stringify(claim), 'EX', this.CLAIM_TTL, 'NX');
    // Set driver index if not exists (preventing double assignment for driver)
    multi.set(driverIdxKey, rideId, 'EX', this.CLAIM_TTL, 'NX');

    const results = await multi.exec();
    
    if (!results) return null;

    // Validate that BOTH operations succeeded
    const rideClaimSet = results[0][1] === 'OK';
    const driverIdxSet = results[1][1] === 'OK';

    if (rideClaimSet && driverIdxSet) {
      this.logger.log(`CLAIM v1 manufactured: [${claimId}] Driver ${driverId} <=> Ride ${rideId}`);
      return claim;
    }

    // Cleanup if partially successful (Atomic rollback equivalent)
    if (rideClaimSet) await redisClient.del(claimKey);
    if (driverIdxSet) await redisClient.del(driverIdxKey);

    return null;
  }

  /**
   * Rule B: Validate & Consume (Atomic Transition Authority)
   * Uses Lua to ensure Check-and-Delete is a single atomic step.
   */
  async validateAndConsume(rideId: string, driverId: string): Promise<boolean> {
    const redisClient = this.redis.getClient();
    const claimKey = `dispatch:claim:${rideId}`;
    const driverIdxKey = `driver:claim:${driverId}`;

    // LUA Script for Atomic Verification & Consumption
    const luaScript = `
      local claim = redis.call('get', KEYS[1])
      if not claim then return 0 end
      
      local decoded = cjson.decode(claim)
      if decoded.driverId == ARGV[1] and decoded.status == 'PENDING' then
        redis.call('del', KEYS[1])
        redis.call('del', KEYS[2])
        return 1
      else
        return 0
      end
    `;

    const result = await redisClient.eval(luaScript, 2, claimKey, driverIdxKey, driverId);
    return result === 1;
  }

  /**
   * Rule C: Reject
   */
  async reject(rideId: string, driverId: string): Promise<void> {
    const redisClient = this.redis.getClient();
    await redisClient.del(`dispatch:claim:${rideId}`);
    await redisClient.del(`driver:claim:${driverId}`);
    this.logger.log(`Claim Rejected & Released: Driver ${driverId} for Ride ${rideId}`);
  }
}
