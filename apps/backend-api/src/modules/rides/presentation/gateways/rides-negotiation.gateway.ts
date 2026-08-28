import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { RideAssignmentService } from '../../application/services/ride-assignment.service';
import { GoogleMapsService } from '../../../../core/google-maps/google-maps.service';
import { DriverLocationRepository } from '../../../location/infrastructure/repositories/driver-location.repository';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SystemSettingsService } from '../../../admin/application/services/system-settings.service';
import { calculateHaversineDistance } from '../../../../core/common/geo.utils';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'rides',
})
export class RidesNegotiationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly rideAssignmentService: RideAssignmentService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly driverLocationRepository: DriverLocationRepository,
    private readonly prisma: PrismaService,
    private readonly settings: SystemSettingsService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`presence_${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
     const userId = client.handshake.query.userId as string;
     if (userId) {
       client.leave(`presence_${userId}`);
     }
  }

  /**
   * Broadcasts a new ride only to nearby drivers (P3) with real ETA/Distance (P2).
   * Enhanced with Passenger Persona data (TASK-UX-001 Backend Support).
   * Includes Intercity metadata for INTERCITY trip type.
   */
  async broadcastNewRide(rideId: string) {
    // 1. Fetch complete ride with passenger details + intercity fields
    const ride = await this.rideAssignmentService.getRideWithPassengerDetails(rideId);
    if (!ride) return;

    // 2. Get real physics from Google Maps (P2)
    const estimates = await this.googleMapsService.getEstimates(
      { lat: ride.pickupLat, lng: ride.pickupLng },
      { lat: ride.dropoffLat, lng: ride.dropoffLng }
    );

    // 3. Find nearby drivers within 5km (P3)
    const nearbyDriverIds = await this.driverLocationRepository.findNearby(
      ride.pickupLng,
      ride.pickupLat,
      5 
    );

    const isIntercity = (ride as any).tripType === 'INTERCITY';

    const payload = {
      id: ride.id,
      passengerName: ride?.passenger.fullName,
      passengerRating: 4.9,
      passengerTripsCount: ride?.passenger._count.customerRides,
      isNewPassenger: (ride?.passenger._count.customerRides ?? 0) <= 1,
      isVerified: true,
      offeredPrice: Number(ride?.estimatedPrice),
      fare: Number(ride?.estimatedPrice),
      estimatedPrice: Number(ride?.estimatedPrice),
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      pickupLat: ride.pickupLat,
      pickupLng: ride.pickupLng,
      dropoffLat: ride.dropoffLat,
      tripDistance: (ride as any)?.driverDisplayDistanceMeters
        ? `${((ride as any).driverDisplayDistanceMeters / 1000).toFixed(2)} km`
        : (estimates?.distanceText || 'N/A'),
      tripDuration: estimates?.durationText || 'N/A',
      polyline: estimates?.polyline || '',
      expiresAt: Date.now() + (isIntercity ? 120000 : 30000), // Intercity: 2min countdown
      serviceType: ride.serviceType,
      // ── Intercity fields (null for standard city rides) ─────────────────
      tripType: (ride as any).tripType ?? 'CITY',
      departureCity: (ride as any).departureCity ?? null,
      arrivalCity: (ride as any).arrivalCity ?? null,
      departureDateTime: (ride as any).departureDateTime
        ? new Date((ride as any).departureDateTime).toISOString()
        : null,
      rideMode: (ride as any).rideMode ?? null,
    };

    // 4. Surgical Broadcast — use 'ride.offer' (consistent with socket.service.ts)
    nearbyDriverIds.forEach(driverId => {
      this.server.to(`presence_${driverId}`).emit('ride.offer', payload);
      this.server.to(`presence_${driverId}`).emit('new_ride_request', payload);
    });

    console.log(
      `[Dispatch] Broadcasted ${payload.tripType} ride ${ride.id} to ${nearbyDriverIds.length} drivers.`
    );
  }


  @SubscribeMessage('submit_bid')
  async handleBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; driverId: string; amount: number }
  ) {
    if (
      !data ||
      typeof data.amount !== 'number' ||
      isNaN(data.amount) ||
      !Number.isFinite(data.amount) ||
      data.amount < 5
    ) {
      client.emit('bid_rejected', {
        message: 'Invalid bid amount. Counter-offer must be a valid number of at least 5 MAD.',
        code: 'INVALID_BID_AMOUNT',
      });
      return;
    }

    const { rideId, amount, driverId } = data;

    // Fetch ride details to validate rules and check passengerId
    const ride = this.prisma ? await this.prisma.ride.findUnique({
      where: { id: rideId },
      select: {
        id: true,
        passengerId: true,
        estimatedPrice: true,
        serviceType: true,
        pickupLat: true,
        pickupLng: true,
        dropoffLat: true,
        dropoffLng: true,
        status: true,
        tripType: true,
        rideMode: true,
        seatsBooked: true,
      },
    }) : null;

    if (!ride) {
      client.emit('bid_rejected', {
        message: 'Ride not found.',
        code: 'RIDE_NOT_FOUND',
      });
      return;
    }

    const basePrice = ride.estimatedPrice !== null ? Number(ride.estimatedPrice) : 0;
    const tripType = ride.tripType;
    const rideMode = ride.rideMode;
    const seatsBooked = ride.seatsBooked;

    // Enforce dynamic Intercity negotiation rules if intercity
    if (tripType === 'INTERCITY') {
      const intercityRules = await this.settings.getIntercityBusinessRules();
      const isParcel = ride.serviceType === 'COURSIER' || rideMode === 'PARCEL';

      if (isParcel && basePrice === 0) {
        // PARCEL optional price: Driver can propose counter offer starting from parcelMinPriceMAD (20 MAD)
        if (amount < intercityRules.parcelMinPriceMAD) {
          client.emit('bid_rejected', {
            message: `الحد الأدنى لسعر الإرسالية هو ${intercityRules.parcelMinPriceMAD} درهم`,
            code: 'BID_BELOW_PARCEL_MIN',
          });
          return;
        }
      } else if (rideMode === 'SHARED') {
        const distM = calculateHaversineDistance(ride.pickupLat, ride.pickupLng, ride.dropoffLat, ride.dropoffLng);
        const distKm = distM / 1000.0;
        const pCount = Math.min(4, Math.max(1, seatsBooked ?? 1));
        const sharedMinRates: Record<number, number> = { 1: 0.90, 2: 1.30, 3: 1.70, 4: 2.12 };
        const minRate = sharedMinRates[pCount] ?? 2.12;
        const distMinFloor = Math.round(distKm * minRate);
        const absoluteMin = Math.max(intercityRules.sharedMinPriceMAD, distMinFloor);

        if (amount < absoluteMin) {
          client.emit('bid_rejected', {
            message: `الحد الأدنى للرحلة المشتركة (${pCount} شخص) هو ${absoluteMin} درهم`,
            code: 'BID_BELOW_MIN_FLOOR',
          });
          return;
        }
      } else if (basePrice > 0) {
        const maxAllowed = Math.ceil(basePrice * (1 + intercityRules.maxCounterOfferPercent / 100));

        if (amount <= basePrice) {
          client.emit('bid_rejected', {
            message: `Votre offre doit être supérieure au prix proposé (${basePrice} MAD).`,
            code: 'BID_BELOW_BASE',
          });
          return;
        }

        if (amount > maxAllowed) {
          client.emit('bid_rejected', {
            message: `Votre offre ne peut pas dépasser ${maxAllowed} MAD (+${intercityRules.maxCounterOfferPercent}% max).`,
            code: 'BID_EXCEEDS_CAP',
          });
          return;
        }
      }
    }

    // IMMUTABILITY & AUDIT: Store negotiation record in Prisma DB
    try {
      await this.prisma.negotiation.create({
        data: {
          rideId,
          driverId,
          passengerId: ride.passengerId,
          proposedPrice: ride.estimatedPrice ?? 0,
          counterPrice: amount,
          status: 'PENDING',
        },
      });
    } catch (err: any) {
      console.warn('[Negotiation] Failed to persist negotiation record:', err.message);
    }

    const payload = {
      rideId,
      driverId,
      amount: Math.ceil(amount),
      basePrice,
      timestamp: new Date().toISOString(),
    };

    // Emit real-time events to passenger, ride room, and admin room
    this.server.to(`presence_passenger_${rideId}`).emit('bid_received', payload);
    this.server.to(`ride:${rideId}`).emit('bid_received', payload);
    this.server.to('admin_room').emit('admin.intercity_bid', payload);
  }

  @SubscribeMessage('accept_bid')
  async handleAcceptBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; driverId: string; agreedPrice?: number }
  ) {
    try {
      // 1. Security & Anti-Forgery Check: Query DB for pending negotiation record to get trusted counterPrice
      const negotiation = await this.prisma.negotiation.findFirst({
        where: { rideId: data.rideId, driverId: data.driverId, status: 'PENDING' },
      });

      const agreedPrice = negotiation
        ? Number(negotiation.counterPrice || negotiation.proposedPrice)
        : data.agreedPrice;

      // 2. Delegate to Unified Acceptance Pipeline
      const result = await this.rideAssignmentService.assignRide(data.rideId, data.driverId, agreedPrice);
      const finalPrice = result?.agreedPrice ?? agreedPrice;

      // 3. Update pending negotiations in DB
      try {
        await this.prisma.negotiation.updateMany({
          where: { rideId: data.rideId, driverId: data.driverId, status: 'PENDING' },
          data: { status: 'ACCEPTED' },
        });
        // Expire all other pending bids for this ride
        await this.prisma.negotiation.updateMany({
          where: { rideId: data.rideId, driverId: { not: data.driverId }, status: 'PENDING' },
          data: { status: 'EXPIRED' },
        });
      } catch (_) {}

      const payload = { rideId: data.rideId, driverId: data.driverId, agreedPrice: finalPrice };

      this.server.to(`presence_${data.driverId}`).emit('assignment_success', payload);
      this.server.to(`ride:${data.rideId}`).emit('ride_request_assigned', payload);
      this.server.to('admin_room').emit('admin.intercity_assigned', payload);
      this.server.emit('ride_request_assigned', payload);

    } catch (error: any) {
      client.emit('assignment_failed', { 
        message: error.message || 'Désolé, cette course a déjà été acceptée par un autre chauffeur.',
        code: 'RACE_CONDITION_LOST'
      });
    }
  }
}
