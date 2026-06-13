import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { DispatchCandidateFoundEvent } from '../domain/events/dispatch-events';
import { DispatchClaimService } from '../domain/claims/dispatch-claim.service';

@Injectable()
export class DispatchEngine {
  private readonly logger = new Logger(DispatchEngine.name);
  private readonly DRIVERS_GEO_KEY = 'geo:drivers:available';

  constructor(
    private readonly redis: RedisService,
    private readonly eventBus: DomainEventBus,
    private readonly claimService: DispatchClaimService,
  ) {}

  /**
   * Hardened Dispatch Pipeline (v2.0)
   * Now delegates claim creation entirely to DispatchClaimService.
   * Eliminates duplicate Redis claim logic.
   */
  async claimDriver(rideId: string, lat: number, lng: number): Promise<void> {
    this.logger.log(`Attempting to manufacture dispatch claim for ride: ${rideId}`);

    const drivers = await this.redis.findNearby(this.DRIVERS_GEO_KEY, lng, lat, 5);

    for (const driverId of drivers) {
      // Delegate to DispatchClaimService (single authority for claims)
      // Uses atomic MULTI + NX for both ride claim and driver reservation
      const claim = await this.claimService.createClaim(rideId, driverId);

      if (claim) {
        this.logger.log(`Transaction-safe CLAIM manufactured: Driver ${driverId} <=> Ride ${rideId}`);
        await this.eventBus.publish(new DispatchCandidateFoundEvent(rideId, driverId));
        return;
      }
    }

    this.logger.warn(`Dispatch failed to secure a claim for ride: ${rideId}`);
  }
}
