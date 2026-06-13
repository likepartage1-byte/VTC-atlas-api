import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { DispatchCandidateFoundEvent } from '../domain/events/dispatch-events';

export type ClaimStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface DispatchClaim {
  id: string;
  rideId: string;
  driverId: string;
  status: ClaimStatus;
  createdAt: number;
  expiresAt: number;
}

@Injectable()
export class DispatchEngine {
  private readonly logger = new Logger(DispatchEngine.name);
  private readonly DRIVERS_GEO_KEY = 'geo:drivers:available';
  private readonly CLAIM_TTL = 25; // Seconds

  constructor(
    private readonly redis: RedisService,
    private readonly eventBus: DomainEventBus,
  ) {}

  /**
   * Orchestrates the search and claim of candidates.
   */
  async dispatchRide(rideId: string, lat: number, lng: number): Promise<void> {
    this.logger.log(`Dispatching ride ${rideId}`);
    const drivers = await this.redis.findNearby(this.DRIVERS_GEO_KEY, lng, lat, 5);

    for (const driverId of drivers) {
      const claim = await this.createClaim(rideId, driverId);
      if (claim) {
        await this.eventBus.publish(new DispatchCandidateFoundEvent(rideId, driverId));
        return;
      }
    }
  }

  /**
   * Atomic Claim Creation (Single Source of Truth)
   */
  async createClaim(rideId: string, driverId: string): Promise<DispatchClaim | null> {
    const redisClient = this.redis.getClient();
    const now = Date.now();
    const claim: DispatchClaim = {
      id: crypto.randomUUID(),
      rideId,
      driverId,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + (this.CLAIM_TTL * 1000),
    };

    const claimKey = `dispatch:claim:${rideId}`;
    const driverIdxKey = `driver:claim:${driverId}`;

    const multi = redisClient.multi();
    multi.set(claimKey, JSON.stringify(claim), 'EX', this.CLAIM_TTL, 'NX');
    multi.set(driverIdxKey, rideId, 'EX', this.CLAIM_TTL, 'NX');

    const results = await multi.exec();
    if (!results) return null;

    if (results[0][1] === 'OK' && results[1][1] === 'OK') {
      return claim;
    }

    // Rollback partial success
    if (results[0][1] === 'OK') await redisClient.del(claimKey);
    if (results[1][1] === 'OK') await redisClient.del(driverIdxKey);

    return null;
  }

  async validateAndConsume(rideId: string, driverId: string): Promise<boolean> {
    const luaScript = `
      local claim = redis.call('get', KEYS[1])
      if not claim then return 0 end
      local decoded = cjson.decode(claim)
      if decoded.driverId == ARGV[1] and decoded.status == 'PENDING' then
        redis.call('del', KEYS[1])
        redis.call('del', KEYS[2])
        return 1
      else return 0 end
    `;
    const result = await this.redis.getClient().eval(luaScript, 2, `dispatch:claim:${rideId}`, `driver:claim:${driverId}`, driverId);
    return result === 1;
  }

  async rejectClaim(rideId: string, driverId: string): Promise<void> {
    await this.redis.getClient().del(`dispatch:claim:${rideId}`);
    await this.redis.getClient().del(`driver:claim:${driverId}`);
  }
}
