import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LocationService } from '../../location/application/location.service';
import { RideOtpService } from './ride-otp.service';
import { RideStateMachine } from '../domain/state-machine/ride-transitions';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { RideStatusChangedEvent } from '../domain/events/ride-status-changed.event';
import { calculateHaversineDistance } from '../../../core/common/geo.utils';

@Injectable()
export class RideLifecycleService {
  private readonly logger = new Logger(RideLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly location: LocationService,
    private readonly otp: RideOtpService,
    private readonly eventBus: DomainEventBus,
  ) {}

  /**
   * Driver reports arrival at Pickup.
   * Enforces Geofencing Rule (B - Explicit Class/Guard).
   */
  async reportArrival(rideId: string, driverId: string): Promise<string> {
    this.logger.log(`Arrival reported for ride ${rideId} by driver ${driverId}`);

    const ride = await this.prisma.ride.findUniqueOrThrow({
      where: { id: rideId },
    });

    // Authorization: Verify calling driver is assigned to this ride
    if (ride.driverId !== driverId) {
      throw new BadRequestException('You are not the assigned driver for this ride.');
    }

    // 1. Geofence & Anti-Spoofing Guard
    const driverLoc = await this.location.getDriverLocation(driverId);
    if (!driverLoc) throw new BadRequestException('Driver location unavailable for verification.');

    // Freshness Check: Ensure location heartbeat is recent (< 30s)
    const lastUpdate = new Date(driverLoc.updatedAt).getTime();
    if (Date.now() - lastUpdate > 30000) {
      throw new BadRequestException('Driver location is stale. Please wait for a fresh GPS ping.');
    }

    const dist = calculateHaversineDistance(
      Number(driverLoc.lat), Number(driverLoc.lng),
      Number(ride.pickupLat), Number(ride.pickupLng)
    );

    if (!RideStateMachine.checkGeofence(dist)) {
      this.logger.warn(`Geofence rejection: Driver ${driverId} is ${dist.toFixed(0)}m from pickup`);
      throw new BadRequestException(`Too far from pickup point (${dist.toFixed(0)}m). Must be < 150m.`);
    }

    // 2. State Machine Validation
    RideStateMachine.validate(ride.status as any, 'ARRIVED');

    // 3. Persist and Generate OTP (The Handshake Proof)
    const verificationCode = await this.otp.generateForRide(rideId);
    
    await this.prisma.ride.update({
      where: { id: rideId },
      data: { 
        status: 'ARRIVED', 
        arrivedAt: new Date(),
      },
    });

    // Post-commit event publishing (safe — data is persisted)
    await this.eventBus.publish(new RideStatusChangedEvent(rideId, {
      from: ride.status as any,
      to: 'ARRIVED',
      timestamp: new Date(),
    }));

    return verificationCode;
  }

  /**
   * Verified start of the ride via OTP Handshake.
   */
  async startTrip(rideId: string, inputOtp: string): Promise<void> {
    const ride = await this.prisma.ride.findUniqueOrThrow({ where: { id: rideId } });

    // 1. Verify OTP (Handshake)
    const isValid = await this.otp.validate(rideId, inputOtp);
    if (!isValid) throw new BadRequestException('Invalid verification code.');

    // 2. Transition to IN_PROGRESS
    RideStateMachine.validate(ride.status as any, 'IN_PROGRESS');

    await this.prisma.ride.update({
      where: { id: rideId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });

    // Post-commit event publishing
    await this.eventBus.publish(new RideStatusChangedEvent(rideId, {
      from: ride.status as any,
      to: 'IN_PROGRESS',
      timestamp: new Date(),
    }));
  }
}
