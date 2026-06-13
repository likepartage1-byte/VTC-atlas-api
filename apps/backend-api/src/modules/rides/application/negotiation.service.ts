import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { RedisService } from '../../../core/redis/redis.service';

@Injectable()
export class NegotiationService {
  private readonly logger = new Logger(NegotiationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: DomainEventBus,
    private readonly redis: RedisService,
  ) {}

  /**
   * Driver makes a counter-offer for a ride.
   */
  async proposeCounterOffer(rideId: string, driverId: string, price: number): Promise<void> {
    const ride = await this.prisma.ride.findUniqueOrThrow({ where: { id: rideId } });

    if (ride.status !== 'REQUESTED' && ride.status !== 'DISPATCHED') {
      throw new BadRequestException('Ride is no longer open for negotiation.');
    }

    const negotiation = await this.prisma.negotiation.create({
      data: {
        rideId,
        driverId,
        passengerId: ride.passengerId,
        proposedPrice: ride.estimatedPrice,
        counterPrice: price,
        status: 'PENDING',
      },
    });

    this.logger.log(`Counter-offer of ${price} MAD proposed by driver ${driverId} for ride ${rideId}`);
    
    // Broadcast via internal emitter (picked up by RideGateway)
    this.eventBus.publish({
      eventType: 'negotiation.counter_offered',
      aggregateId: rideId,
      ...negotiation
    } as any);
  }

  /**
   * Passenger accepts a counter-offer.
   * This triggers ride acceptance for that driver.
   * Uses Distributed Lock to prevent race conditions.
   */
  async acceptOffer(negotiationId: string, userId: string): Promise<void> {
    const negotiation = await this.prisma.negotiation.findUniqueOrThrow({
      where: { id: negotiationId },
      include: { ride: true },
    });

    if (negotiation.passengerId !== userId) {
      throw new BadRequestException('Unauthorized.');
    }

    // 1. Acquire Distributed Lock for the Ride
    const lockKey = `ride:accept:${negotiation.rideId}`;
    const locked = await this.redis.acquireLock(lockKey, negotiationId, 5000);
    if (!locked) {
      throw new ConflictException('Another acceptance is being processed. Please wait.');
    }

    try {
      if (negotiation.status !== 'PENDING' || negotiation.ride.status !== 'REQUESTED' && negotiation.ride.status !== 'DISPATCHED') {
        throw new BadRequestException('Ride or offer is no longer available.');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.negotiation.update({
          where: { id: negotiationId },
          data: { status: 'ACCEPTED' },
        });

        await tx.negotiation.updateMany({
          where: { rideId: negotiation.rideId, id: { not: negotiationId } },
          data: { status: 'REJECTED' },
        });

        await tx.ride.update({
          where: { id: negotiation.rideId },
          data: {
            driverId: negotiation.driverId,
            status: 'DRIVER_ACCEPTED',
            actualPrice: negotiation.counterPrice || negotiation.proposedPrice,
            acceptedAt: new Date(),
          },
        });
      });

      this.eventBus.publish({
        eventType: 'negotiation.accepted',
        aggregateId: negotiation.rideId,
        negotiationId,
        driverId: negotiation.driverId,
      } as any);

    } finally {
      await this.redis.releaseLock(lockKey, negotiationId);
    }
  }
}
