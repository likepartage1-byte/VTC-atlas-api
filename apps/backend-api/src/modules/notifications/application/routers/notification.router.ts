import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class NotificationRouter {
  private readonly logger = new Logger(NotificationRouter.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * --- RIDE STATUS NOTIFICATIONS ---
   */

  @OnEvent('Ride.StatusChanged.DRIVER_ACCEPTED')
  async handleRideAccepted(payload: any) {
    this.logger.log(`Handling DRIVER_ACCEPTED for ride ${payload.id || payload.aggregateId}`);
    const ride = await this.prisma.ride.findUnique({
      where: { id: payload.aggregateId || payload.id },
      include: { driver: { include: { user: true } } }
    });

    if (ride) {
      await this.notificationQueue.add('send', {
        userId: ride.passengerId,
        title: 'Captain found!',
        body: `${ride.driver?.user.fullName} is on the way.`,
        type: 'RIDE_ACCEPTED',
        data: { rideId: ride.id }
      });
    }
  }

  @OnEvent('Ride.StatusChanged.ARRIVED')
  async handleDriverArrived(payload: any) {
    this.logger.log(`Handling ARRIVED for ride ${payload.aggregateId}`);
    const ride = await this.prisma.ride.findUnique({
      where: { id: payload.aggregateId }
    });

    if (ride) {
      await this.notificationQueue.add('send', {
        userId: ride.passengerId,
        title: 'Captain arrived!',
        body: 'Your driver is at the pickup point.',
        type: 'DRIVER_ARRIVED',
        data: { rideId: ride.id }
      });
    }
  }

  @OnEvent('Ride.StatusChanged.IN_PROGRESS')
  async handleTripStarted(payload: any) {
    this.logger.log(`Handling IN_PROGRESS for ride ${payload.aggregateId}`);
    const ride = await this.prisma.ride.findUnique({
      where: { id: payload.aggregateId }
    });

    if (ride) {
      await this.notificationQueue.add('send', {
        userId: ride.passengerId,
        title: 'Trip started',
        body: 'Have a safe trip with Atlas VTC.',
        type: 'TRIP_STARTED',
        data: { rideId: ride.id }
      });
    }
  }

  /**
   * --- NEGOTIATION NOTIFICATIONS ---
   */

  @OnEvent('negotiation.counter_offered')
  async handleCounterOffer(payload: any) {
    this.logger.log(`Handling counter_offered for passenger ${payload.passengerId}`);
    await this.notificationQueue.add('send', {
      userId: payload.passengerId,
      title: 'New Offer!',
      body: `A driver offered ${payload.counterPrice} MAD for your ride.`,
      type: 'COUNTER_OFFER',
      data: { rideId: payload.rideId, negotiationId: payload.id }
    });
  }

  /**
   * --- FRAUD / INTEGRITY ALERTS ---
   */

  @OnEvent('integrity.fraud_event')
  async handleFraudEvent(payload: any) {
    if (payload.severity === 'CRITICAL') {
      // In a real scenario, notify admins via FCM or specialized channel
      this.logger.warn(`CRITICAL FRAUD ALERT: ${payload.eventType}. Notifying admins.`);
      // Logic for admin push would go here
    }
  }
}
