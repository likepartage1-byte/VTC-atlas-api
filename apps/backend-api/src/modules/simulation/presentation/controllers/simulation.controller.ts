import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { RideService } from '../../rides/application/ride.service';
import { RideLifecycleService } from '../../rides/application/ride-lifecycle.service';
import { DriverLocationRepository } from '../../location/infrastructure/repositories/driver-location.repository';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TripFinalizerService } from '../../rides/application/trip-finalizer.service';

@Controller('debug/simulation')
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rideService: RideService,
    private readonly rideLifecycle: RideLifecycleService,
    private readonly locationRepo: DriverLocationRepository,
    private readonly finalizer: TripFinalizerService,
  ) {}

  @Post('run-full-ride')
  async runFullRide(@Body('phoneNumber') phoneNumber: string = '+212600000000') {
    this.logger.log(`🚀 Starting Golden Flow Simulation for ${phoneNumber}`);
    const steps: string[] = [];

    try {
      // 1. Setup Identities (Passenger & Driver)
      const passenger = await this.prisma.user.upsert({
        where: { phoneNumber },
        update: {},
        create: { phoneNumber, fullName: 'Test Passenger', role: 'PASSENGER' },
      });
      steps.push('PASSENGER_EXIST');

      const driverUser = await this.prisma.user.upsert({
        where: { phoneNumber: '+212700000000' },
        update: {},
        create: { phoneNumber: '+212700000000', fullName: 'Test Driver', role: 'DRIVER' },
      });
      
      const driver = await this.prisma.driver.upsert({
        where: { userId: driverUser.id },
        update: { status: 'AVAILABLE' },
        create: { userId: driverUser.id, status: 'AVAILABLE' },
      });
      steps.push('DRIVER_READY');

      // 2. Request Ride
      const ride = await this.rideService.requestRide(passenger.id, {
        pickupLat: 31.6295,
        pickupLng: -7.9811,
        pickupAddress: 'Jemaa el-Fnaa',
        dropoffLat: 31.6345,
        dropoffLng: -8.0163,
        dropoffAddress: 'Majorelle Garden',
        serviceType: 'ECONOMY',
      });
      steps.push(`RIDE_REQUESTED: ${ride.id}`);

      // 3. Mock Assignment (Force assign our test driver)
      await this.prisma.ride.update({
        where: { id: ride.id },
        data: { driverId: driver.id, status: 'DRIVER_ACCEPTED' },
      });
      steps.push('DRIVER_ASSIGNED');

      // 4. Mock Driver Movement (Move into Geofence)
      await this.locationRepo.save(driver.id, {
        lat: 31.6296, // Very close to pickup (31.6295)
        lng: -7.9812,
        updatedAt: new Date().toISOString(),
      });
      steps.push('DRIVER_LOCATION_SYNCED');

      // 5. Report Arrival
      const otp = await this.rideLifecycle.reportArrival(ride.id, driver.id);
      steps.push(`DRIVER_ARRIVED (OTP: ${otp})`);

      // 6. Start Trip (OTP Handshake)
      await this.rideLifecycle.startTrip(ride.id, driver.id, otp);
      steps.push('TRIP_STARTED');

      // 7. Complete Trip
      await this.finalizer.finalizeTrip(ride.id, driver.id);
      steps.push('TRIP_COMPLETED');

      return {
        success: true,
        rideId: ride.id,
        summary: steps,
        finalState: 'COMPLETED',
      };
    } catch (error) {
      this.logger.error(`❌ Simulation Failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        stepsAtFailure: steps,
      };
    }
  }
}
