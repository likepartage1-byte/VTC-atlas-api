// ============================================================
// Domain: Drivers
// Layer: Application
// Responsibility: Ride Acceptance (Strong Consistency Pipeline)
// ============================================================
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { BaseApplicationService } from '../../../core/common/base-application.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';
import { DispatchClaimService } from '../../dispatch/domain/claims/dispatch-claim.service';
import { RideStatusChangedEvent } from '../../rides/domain/events/ride-status-changed.event';
import { RideStateMachine } from '../../rides/domain/state-machine/ride-state-machine';

@Injectable()
export class DriverAcceptanceService extends BaseApplicationService {
  private readonly logger = new Logger(DriverAcceptanceService.name);

  constructor(
    eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly claimService: DispatchClaimService,
  ) {
    super(eventBus);
  }

  /**
   * Strong Consistency Pipeline.
   * Redis Claim → DB Atomic Transaction → GEO Sync → Event Emission
   */
  async acceptRide(driverId: string, rideId: string): Promise<void> {
    this.logger.log(`Driver [${driverId}] attempting ACCEPT for Ride [${rideId}]`);

    // 1. Validate & consume Redis Claim (first gate)
    const isClaimValid = await this.claimService.validateAndConsume(rideId, driverId);
    if (!isClaimValid) {
      this.logger.warn(`Stale/missing claim: Driver [${driverId}] / Ride [${rideId}]`);
      throw new ConflictException('Ride is no longer available or claim has expired.');
    }

    try {
      // 2. Atomic DB Transaction (second gate — final authority)
      await this.prisma.$transaction(async (tx) => {
        const ride = await tx.ride.findUniqueOrThrow({ where: { id: rideId } });

        RideStateMachine.transition(ride.status as any, 'DRIVER_ACCEPTED');

        await tx.ride.update({
          where: { id: rideId },
          data: { status: 'DRIVER_ACCEPTED', driverId, acceptedAt: new Date() },
        });

        await tx.driver.update({
          where: { id: driverId },
          data: { status: 'ON_TRIP' },
        });

        await tx.rideStatusHistory.create({
          data: { rideId, fromStatus: ride.status, toStatus: 'DRIVER_ACCEPTED' },
        });
      });

      // 3. Post-commit: Remove driver from available GEO index
      await this.redis.getClient().zrem('geo:drivers:available', driverId);

      // 4. Emit domain event
      await this.eventBus.publish(
        new RideStatusChangedEvent(rideId, {
          from: 'DISPATCHED' as any,
          to: 'DRIVER_ACCEPTED' as any,
          timestamp: new Date(),
        }),
      );

      this.logger.log(`Ride [${rideId}] ACCEPTED by Driver [${driverId}] — Session locked.`);
    } catch (error) {
      this.logger.error(`Acceptance transaction failed: ${error.message}`);
      throw error;
    }
  }
}
