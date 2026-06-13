import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PricingService } from '../../pricing/domain/pricing.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { RideStatusChangedEvent } from '../domain/events/ride-status-changed.event';
import { RideLedgerService } from '../../financial/application/ride-ledger.service';

@Injectable()
export class TripFinalizerService {
  private readonly logger = new Logger(TripFinalizerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly eventBus: DomainEventBus,
    private readonly ledgerService: RideLedgerService,
  ) {}

  /**
   * Authoritative Finalization of a Ride.
   */
  async finalizeTrip(rideId: string, driverId: string): Promise<any> {
    this.logger.log(`Initiating production closure for ride: ${rideId}`);

    // 1. Fetch & Lock (Simulated lock via updateMany)
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) throw new BadRequestException(`Ride ${rideId} not found`);
    if (ride.driverId !== driverId) throw new BadRequestException('Unauthorized.');
    if (ride.status === 'COMPLETED') return { result: 'ALREADY_COMPLETED' };
    if (ride.status !== 'IN_PROGRESS') throw new BadRequestException('Must be IN_PROGRESS');

    // 2. Atomic Status Transition
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.ride.updateMany({
        where: { id: rideId, status: 'IN_PROGRESS' as any },
        data: {
          status: 'COMPLETED' as any,
          completedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new Error(`Race condition: ride ${rideId} already finalized.`);
      }

      // 3. Final Pricing Computation (Persist to ride)
      const pricing = this.pricing.calculateEstimate(5.0); // Replace with real distance
      await tx.ride.update({
        where: { id: rideId },
        data: { actualPrice: pricing.total },
      });
    });

    // 4. Financial Settlement (Single Authority)
    await this.ledgerService.settleRide(rideId);

    // 5. Post-Commit Event Publishing
    await this.eventBus.publish(
      new RideStatusChangedEvent(rideId, {
        from: 'IN_PROGRESS' as any,
        to:   'COMPLETED'   as any,
        timestamp: new Date(),
      }),
    );

    return { rideId, result: 'SUCCESS' };
  }
}
