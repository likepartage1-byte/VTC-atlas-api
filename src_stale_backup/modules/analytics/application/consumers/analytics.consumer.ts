import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class AnalyticsConsumer {
  private readonly logger = new Logger(AnalyticsConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listens for completed rides to build the "Read Model" of revenue.
   * CQRS Aspect: This operates asynchronously and doesn't block the Ride flow.
   */
  @OnEvent('ride.status.changed.COMPLETED')
  async handleRideCompleted(event: any) {
    this.logger.log(`Analytics processing for ride: ${event.rideId}`);

    const ride = await this.prisma.ride.findUnique({
      where: { id: event.rideId },
      include: { ledgerRecord: true },
    });

    if (!ride || !ride.ledgerRecord) return;

    this.logger.debug(`Analytics Model processed for ride: ${ride.id}`);
  }
}
