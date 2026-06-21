import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { DriverLocationRepository } from '../../location/infrastructure/repositories/driver-location.repository';
import { RideOtpService } from './ride-otp.service';
import { RideStateMachine } from '../domain/state-machine/ride-transitions';
import { OutboxService } from '../../../core/outbox/services/outbox.service';
import { RideStatusChangedEvent } from '../domain/events/ride-status-changed.event';
import { calculateHaversineDistance } from '../../../core/common/geo.utils';

@Injectable()
export class RideLifecycleService {
  private readonly logger = new Logger(RideLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly driverLocationRepo: DriverLocationRepository,
    private readonly otp: RideOtpService,
    private readonly outbox: OutboxService,
  ) {}

  /**
   * Driver reports arrival at Pickup.
   * v3 Hardened: Atomic DB transaction + Outbox Event + Repository abstraction.
   */
  async reportArrival(rideId: string, driverId: string): Promise<string> {
    this.logger.log(`Arrival reported for ride ${rideId} by driver ${driverId}`);

    // 1. Fetch Ride State (System of Record)
    const ride = await this.prisma.ride.findUniqueOrThrow({
      where: { id: rideId },
    });

    if (ride.driverId !== driverId) {
      throw new BadRequestException('Unauthorized: You are not the assigned driver.');
    }

    // 2. Fetch Driver Location (v3: Repository Abstraction)
    const driverLoc = await this.driverLocationRepo.get(driverId);
    if (!driverLoc) {
      throw new BadRequestException('Driver location unavailable for verification.');
    }

    // 3. Precision Validation (Geofencing & Freshness)
    const lastUpdate = new Date(driverLoc.updatedAt).getTime();
    if (Date.now() - lastUpdate > 30000) {
      throw new BadRequestException('GPS data is stale. Please wait for a fresh heartbeat.');
    }

    const dist = calculateHaversineDistance(
      driverLoc.lat, driverLoc.lng,
      Number(ride.pickupLat), Number(ride.pickupLng)
    );

    if (!RideStateMachine.checkGeofence(dist)) {
      this.logger.warn(`Geofence rejection: Driver ${driverId} is ${dist.toFixed(0)}m from pickup`);
      throw new BadRequestException(`Too far from pickup point (${dist.toFixed(0)}m). Must be < 150m.`);
    }

    // 4. State Machine Validation
    RideStateMachine.validate(ride.status as any, 'ARRIVED');

    // 5. ATOMIC EXECUTION (PRISMA TRANSACTION)
    // Ensures status update AND outbox event are committed or rolled back together.
    return await this.prisma.$transaction(async (tx) => {
      const verificationCode = await this.otp.generateForRide(rideId);
      
      await tx.ride.update({
        where: { id: rideId },
        data: { 
          status: 'ARRIVED', 
          arrivedAt: new Date(),
        },
      });

      // Stage durable event
      await this.outbox.stage(new RideStatusChangedEvent(rideId, {
        from: ride.status as any,
        to: 'ARRIVED',
        timestamp: new Date(),
      }), tx);

      return verificationCode;
    });
  }

  /**
   * Verified start of the ride via OTP Handshake.
   */
  async startTrip(rideId: string, driverId: string, inputOtp: string): Promise<void> {
    const ride = await this.prisma.ride.findUniqueOrThrow({ where: { id: rideId } });

    if (ride.driverId !== driverId) {
      throw new BadRequestException('Unauthorized: You are not the assigned driver.');
    }

    const isValid = await this.otp.validate(rideId, inputOtp);
    if (!isValid) throw new BadRequestException('Invalid verification code.');

    RideStateMachine.validate(ride.status as any, 'IN_PROGRESS');

    await this.prisma.$transaction(async (tx) => {
      await tx.ride.update({
        where: { id: rideId },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });

      await this.outbox.stage(new RideStatusChangedEvent(rideId, {
        from: ride.status as any,
        to: 'IN_PROGRESS',
        timestamp: new Date(),
      }), tx);
    });
  }
}
