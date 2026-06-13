import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { DriverLocationEvent } from '../../application/location.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { calculateHaversineDistance, metersToKm } from '../../../../core/common/geo.utils';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ETAService {
  private readonly logger = new Logger(ETAService.name);
  private readonly AVG_SPEED_KMH = 25; // 25 km/h for Urban Marrakech

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Listens for location updates and calculates ETA if a ride is active.
   */
  @OnEvent('driver.location.updated')
  async handleLocationUpdate(event: DriverLocationEvent) {
    if (!event.rideId) return; // Only calculate for active rides

    try {
      // 1. Fetch Pickup coordinates from DB (Cached or Optimistic)
      const ride = await this.prisma.ride.findUnique({
        where: { id: event.rideId },
        select: { pickupLat: true, pickupLng: true },
      });

      if (!ride) return;

      // 2. Calculate Distance via shared geo utility
      const distanceMeters = calculateHaversineDistance(
        event.lat,
        event.lng,
        Number(ride.pickupLat),
        Number(ride.pickupLng),
      );
      
      const distanceKm = metersToKm(distanceMeters);

      // 3. Calculate ETA
      const etaMinutes = Math.ceil((distanceKm / this.AVG_SPEED_KMH) * 60);

      // 4. Emit ETA Update Event
      this.eventEmitter.emit('ride.eta.updated', {
        rideId: event.rideId,
        etaMinutes,
        distanceKm: distanceKm.toFixed(2),
        timestamp: Date.now(),
      });

      this.logger.debug(`ETA Updated for Ride ${event.rideId}: ${etaMinutes} mins (${distanceKm.toFixed(2)} km)`);
    } catch (error) {
      this.logger.error(`Failed to calculate ETA: ${error.message}`);
    }
  }
}
