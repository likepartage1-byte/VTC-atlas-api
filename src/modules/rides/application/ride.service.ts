import { Injectable, Logger } from '@nestjs/common';
import { BaseApplicationService } from '../../../core/common/base-application.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RideStatusChangedEvent } from '../domain/events/ride-status-changed.event';
import { RideStateMachine } from '../domain/state-machine/ride-state-machine';
import { RideStatus } from '../domain/state-machine/ride-transitions';
import { RequestRideDto } from '../presentation/dtos/request-ride.dto';
import { RideCreatedEvent } from '../domain/events/ride-created.event';
import { RideResponseDto } from '../presentation/dtos/ride-response.dto';

@Injectable()
export class RideService extends BaseApplicationService {
  private readonly logger = new Logger(RideService.name);

  constructor(
    eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
  ) {
    super(eventBus);
  }

  /**
   * Global state transition orchestrator.
   * Ensures all transitions follow the Domain Graph rules.
   */
  async updateStatus(
    rideId: string,
    targetStatus: RideStatus,
    userId?: string,
  ): Promise<void> {
    this.logger.log(`Transitioning ride ${rideId} to ${targetStatus}`);

    // DB Transaction for Atomic State Persistence
    // Event is prepared inside but published AFTER commit
    let event: RideStatusChangedEvent;

    await this.prisma.$transaction(async (tx) => {
      // 1. Fetch current state
      const ride = await tx.ride.findUniqueOrThrow({
        where: { id: rideId },
        select: { status: true, driverId: true, passengerId: true },
      });

      const currentStatus = ride.status as RideStatus;

      // 2. Ownership & Permission check
      if (userId) {
        const isPassenger = ride.passengerId === userId;
        const isDriver = ride.driverId === userId;

        // Passenger can only cancel
        if (isPassenger && targetStatus !== 'CANCELLED') {
          throw new Error('Passengers can only cancel rides.');
        }

        // Driver must be assigned to update status
        if (targetStatus !== 'CANCELLED' && targetStatus !== 'REQUESTED' && !isDriver) {
           // Check if it's a new acceptance
           if (targetStatus === 'DRIVER_ACCEPTED' && ride.driverId) {
             throw new Error('Ride already has an assigned driver.');
           }
           // Otherwise, if trying to progress ride without being the driver
           if (targetStatus !== 'DRIVER_ACCEPTED' && !isDriver) {
             throw new Error('Unauthorized: You are not the assigned driver for this ride.');
           }
        }
      }

      // 3. Validate via Pure Domain State Machine
      RideStateMachine.transition(currentStatus, targetStatus);

      // 4. Update State & Audit History
      await tx.ride.update({
        where: { id: rideId },
        data: { status: targetStatus },
      });

      await tx.rideStatusHistory.create({
        data: {
          rideId,
          fromStatus: currentStatus,
          toStatus: targetStatus,
        },
      });

      // Prepare event data (but do NOT publish yet)
      event = new RideStatusChangedEvent(rideId, {
        from: currentStatus,
        to: targetStatus,
        timestamp: new Date(),
      });
    });

    // 4. Post-commit: Safe to publish — data is persisted
    await this.eventBus.publish(event!);
  }

  async requestRide(userId: string, dto: RequestRideDto): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.create({
      data: {
        passengerId: userId,
        status: 'REQUESTED',
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        pickupAddress: dto.pickupAddress,
        dropoffLat: dto.dropoffLat,
        dropoffLng: dto.dropoffLng,
        dropoffAddress: dto.dropoffAddress,
        serviceType: dto.serviceType,
        estimatedPrice: 25.0, // This would normally come from PricingService
      },
    });

    await this.eventBus.publish(
      new RideCreatedEvent(ride.id, {
        passengerId: userId,
        pickup: { lat: dto.pickupLat, lng: dto.pickupLng },
        destination: { lat: dto.dropoffLat, lng: dto.dropoffLng },
      }),
    );

    return this.mapToResponseDto(ride);
  }

  async getRideForPassenger(rideId: string, userId: string): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.findFirstOrThrow({
      where: { id: rideId, passengerId: userId },
    });
    return this.mapToResponseDto(ride);
  }

  async getActiveRideForPassenger(userId: string): Promise<RideResponseDto | null> {
    const ride = await this.prisma.ride.findFirst({
      where: {
        passengerId: userId,
        status: { in: ['REQUESTED', 'DISPATCHED', 'DRIVER_ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] },
      },
      orderBy: { requestedAt: 'desc' },
    });

    if (!ride) return null;
    return this.mapToResponseDto(ride);
  }

  private mapToResponseDto(ride: any): RideResponseDto {
    return {
      id: ride.id,
      status: ride.status,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      pickupLat: Number(ride.pickupLat),
      pickupLng: Number(ride.pickupLng),
      pickupAddress: ride.pickupAddress,
      dropoffLat: Number(ride.dropoffLat),
      dropoffLng: Number(ride.dropoffLng),
      dropoffAddress: ride.dropoffAddress,
      estimatedPrice: Number(ride.estimatedPrice),
      verificationCode: ride.status === 'ARRIVED' ? ride.otpCode : undefined,
      createdAt: ride.requestedAt,
    };
  }
}
