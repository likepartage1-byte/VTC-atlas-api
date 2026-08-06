import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketGateway } from '../../presentation/gateways/socket.gateway';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class RealtimeDispatchListener {
  private readonly logger = new Logger(RealtimeDispatchListener.name);

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('Dispatch.CandidateFound')
  async handleCandidateFound(event: any) {
    try {
      const rideId = event?.payload?.rideId || event?.rideId;
      const driverId = event?.payload?.driverId || event?.driverId;
      if (!rideId || !driverId) {
        this.logger.warn(`[DispatchListener] Invalid event payload received: ${JSON.stringify(event)}`);
        return;
      }
      const traceId = `trace:${rideId.slice(0, 8)}`;

      this.logger.log(`[${traceId}] Dispatching offer to Driver [${driverId}]`);

      // Fetch enriched ride + passenger details
      const ride = await this.prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          passenger: {
            select: {
              fullName: true,
              _count: { select: { customerRides: true } },
            },
          },
        },
      });

      if (!ride) {
        this.logger.warn(`[${traceId}] Ride ${rideId} not found — skipping offer to Driver [${driverId}]`);
        return;
      }

      // 🔒 STRICT BACKEND VEHICLE TYPE MATCHING (Stage 3 - Socket Dispatch Guard)
      const driver = await this.prisma.driver.findFirst({
        where: { OR: [{ id: driverId }, { userId: driverId }] },
        select: { id: true, userId: true, vehicleInfo: true },
      });

      const driverVehicleType = (
        (driver?.vehicleInfo as any)?.type ||
        (driver?.vehicleInfo as any)?.vehicle_type ||
        'CAR'
      ).toUpperCase();

      const rideServiceType = (ride.serviceType ?? 'ECONOMY').toUpperCase();
      const isMotoService = ['MOTORCYCLE', 'MOTORCYCLE_DELIVERY', 'MOTO'].includes(rideServiceType);
      const isMotoDriver = driverVehicleType === 'MOTORCYCLE';

      if (isMotoService !== isMotoDriver) {
        this.logger.warn(
          `[${traceId}] 🚫 Backend Dispatch Blocked: Mismatch between Ride Service [${rideServiceType}] and Driver Vehicle [${driverVehicleType}] for Driver [${driverId}]`
        );
        return;
      }

      const tripsCount = ride.passenger?._count?.customerRides ?? 0;
      const expiresAt  = Date.now() + 25_000;

      // Unified payload satisfying both OffersListOverlay (rideId, expiresAt…)
      // and OrdersListScreen (id, pickupAddress, offeredPrice…)
      const payload = {
        // Core identification
        rideId,
        id: ride.id,
        traceId,

        // Passenger persona
        passengerName:       ride.passenger?.fullName ?? 'Client',
        passengerRating:     4.8,
        passengerTripsCount: tripsCount,
        isNewPassenger:      tripsCount === 0,
        isVerified:          true,

        // Timing
        expiresAt,
        distanceToPickup: '1.5 km',   // fallback — real calc requires driver position
        pickupEta:        '4 min',

        // Trip details
        offeredPrice: Number(ride.estimatedPrice),
        fare:         Number(ride.estimatedPrice),
        currency:     ride.currency ?? 'MAD',
        serviceType:  ride.serviceType ?? 'ECONOMY',
        tripDistance: '5.4 km',
        tripDuration: '12 min',
        distance:     5.4,

        // Addresses & coordinates
        pickupAddress:  ride.pickupAddress,
        dropoffAddress: ride.dropoffAddress,
        pickupLat:      ride.pickupLat,
        pickupLng:      ride.pickupLng,
        dropoffLat:     ride.dropoffLat,
        dropoffLng:     ride.dropoffLng,

        // Nested shapes (for RideOffer / RideRequestPopup compatibility)
        pickup: {
          lat:     ride.pickupLat,
          lng:     ride.pickupLng,
          address: ride.pickupAddress,
        },
        destination: {
          address: ride.dropoffAddress,
        },
        estimatedPrice: Number(ride.estimatedPrice),
      };

      // Route to targeted driver rooms using SocketGateway helper
      const targetDriverId = driver?.userId || driverId;
      this.socketGateway.sendToUser(targetDriverId, 'driver', 'ride.offer', payload);
      if (driver?.id && driver.id !== targetDriverId) {
        this.socketGateway.sendToUser(driver.id, 'driver', 'ride.offer', payload);
      }
      this.logger.log(`[${traceId}] ✅ Offer emitted via sendToUser to Driver [${targetDriverId}]`);
    } catch (err: any) {
      this.logger.error(`[DispatchListener] Unexpected error: ${err.message}`, err.stack);
    }
  }
}
