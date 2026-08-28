import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BaseApplicationService } from '../../../core/common/base-application.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RideStatusChangedEvent } from '../domain/events/ride-status-changed.event';
import { RideStateMachine } from '../domain/state-machine/ride-state-machine';
import { RideStatus } from '../domain/state-machine/ride-transitions';
import { RequestRideDto } from '../presentation/dtos/request-ride.dto';
import { RideCreatedEvent } from '../domain/events/ride-created.event';
import { RideResponseDto } from '../presentation/dtos/ride-response.dto';
import { calculateHaversineDistance } from '../../../core/common/geo.utils';

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
    // 0. Fetch dynamic Intercity Business Rules for validation
    let intercityRules = {
      sharedMinPriceMAD: 30,
      privateMinPriceMAD: 100,
      parcelMinPriceMAD: 20,
    };
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: 'intercity_business_rules' },
      });
      if (setting && setting.value) {
        intercityRules = { ...intercityRules, ...(setting.value as any) };
      }
    } catch (_) {}

    const isParcel = dto.serviceType === 'COURSIER' || (dto.rideMode as string) === 'PARCEL';
    const isIntercity = dto.tripType === 'INTERCITY';

    // 1. Calculate physical road distance
    const distMeters = Math.round(
      calculateHaversineDistance(dto.pickupLat, dto.pickupLng, dto.dropoffLat, dto.dropoffLng)
    );
    const distKm = distMeters / 1000.0;

    // PARCEL & Intercity price validation rules
    if (isParcel) {
      // Price is OPTIONAL for PARCEL:
      // If provided, must be >= parcelMinPriceMAD (default 20 MAD)
      if (dto.offeredPrice !== undefined && dto.offeredPrice !== null) {
        if (dto.offeredPrice < intercityRules.parcelMinPriceMAD) {
          throw new BadRequestException(
            `الحد الأدنى لسعر الإرسالية هو ${intercityRules.parcelMinPriceMAD} درهم`
          );
        }
      }
    } else if (isIntercity) {
      if (dto.rideMode === 'SHARED') {
        const pCount = Math.min(4, Math.max(1, dto.seatsBooked ?? 1));
        const sharedMinRates: Record<number, number> = { 1: 0.90, 2: 1.30, 3: 1.70, 4: 2.12 };
        const minRate = sharedMinRates[pCount] ?? 2.12;
        const distMinFloor = Math.round(distKm * minRate);
        const effectiveMin = Math.max(intercityRules.sharedMinPriceMAD, distMinFloor);

        if (dto.offeredPrice === undefined || dto.offeredPrice === null || dto.offeredPrice < effectiveMin) {
          throw new BadRequestException(
            `الحد الأدنى لسعر الرحلة المشتركة (${pCount} شخص) هو ${effectiveMin} درهم`
          );
        }
      } else {
        const minPrice = intercityRules.privateMinPriceMAD;
        if (dto.offeredPrice === undefined || dto.offeredPrice === null || dto.offeredPrice < minPrice) {
          throw new BadRequestException(
            `الحد الأدنى لسعر الرحلة الخاصة بين المدن هو ${minPrice} درهم`
          );
        }
      }
    }

    // 2. Read active global Bulk Distance Benefit setting
    let driverBenefit = 0;
    let passengerCredit = 0;
    let benefitReason: string | undefined = undefined;
    let benefitGrantedBy: string | undefined = undefined;

    const globalSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'global_bulk_distance_benefit' },
    }).catch(() => null);

    if (globalSetting && globalSetting.value) {
      let cfg = globalSetting.value as any;
      if (typeof cfg === 'string') {
        try { cfg = JSON.parse(cfg); } catch (e) {}
      }
      if (cfg && (cfg.enabled === true || cfg.enabled === 'true')) {
        driverBenefit = Math.max(0, Math.min(1000, Number(cfg.driverBenefitMeters || 0)));
        passengerCredit = Math.max(0, Math.min(1000, Number(cfg.passengerCreditMeters || 0)));
        benefitReason = cfg.reason || 'Global Bulk Distance Benefit';
        benefitGrantedBy = cfg.activatedBy || 'GLOBAL_BULK_RULE';
      }
    }

    const driverDisplayMeters = Math.max(0, distMeters - driverBenefit);
    const passengerDisplayMeters = distMeters + passengerCredit;

    // Calculate estimated price: if PARCEL with no offered price, keep null
    const finalEstimatedPrice = isParcel && (dto.offeredPrice === null || dto.offeredPrice === undefined)
      ? null
      : (dto.offeredPrice ?? 25.0);

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
        estimatedPrice: finalEstimatedPrice,
        originalDistanceMeters: distMeters,
        driverBenefitMeters: driverBenefit,
        passengerCreditMeters: passengerCredit,
        driverDisplayDistanceMeters: driverDisplayMeters,
        passengerDisplayDistanceMeters: passengerDisplayMeters,
        benefitReason: benefitReason,
        benefitGrantedBy: benefitGrantedBy,
        benefitGrantedAt: (driverBenefit > 0 || passengerCredit > 0) ? new Date() : undefined,
        // ── Intercity fields ─────────────────────────────────────────
        ...(dto.tripType && { tripType: dto.tripType }),
        ...(dto.departureCity && { departureCity: dto.departureCity }),
        ...(dto.arrivalCity && { arrivalCity: dto.arrivalCity }),
        ...(dto.departureDateTime && { departureDateTime: new Date(dto.departureDateTime) }),
        ...(dto.rideMode && { rideMode: dto.rideMode }),
        ...(dto.seatsBooked && { seatsBooked: dto.seatsBooked }),
        ...(dto.passengerNotes && { passengerNotes: dto.passengerNotes }),
      },
    });


    await this.eventBus.publish(
      new RideCreatedEvent(ride.id, {
        passengerId: userId,
        pickup: { lat: dto.pickupLat, lng: dto.pickupLng },
        destination: { lat: dto.dropoffLat, lng: dto.dropoffLng },
      }),
    );

    // ── Single-Phone Development Test Mode Guard ───────────────────────────────
    // If running in development mode, automatically assign test driver for physical phone testing
    if (process.env.NODE_ENV !== 'production') {
      try {
        let devDriver = await this.prisma.driver.findFirst({
          include: { user: true },
        });

        if (!devDriver) {
          const testUser = await this.prisma.user.create({
            data: {
              fullName: 'Sami Driver (Test)',
              phoneNumber: '+212600000000',
              role: 'DRIVER',
            },
          });
          devDriver = await this.prisma.driver.create({
            data: {
              userId: testUser.id,
              status: 'AVAILABLE',
              vehicleInfo: { make: 'Dacia', model: 'Logan', plate: 'Marrakech 44-A-12345' },
            },
            include: { user: true },
          });
        }

        // Apply official state machine transition: REQUESTED -> DRIVER_ACCEPTED
        RideStateMachine.transition('REQUESTED', 'DRIVER_ACCEPTED');

        const updatedRide = await this.prisma.ride.update({
          where: { id: ride.id },
          data: {
            status: 'DRIVER_ACCEPTED',
            driverId: devDriver.id,
            acceptedAt: new Date(),
          },
          include: {
            driver: {
              include: { user: true },
            },
          },
        });

        await this.prisma.rideStatusHistory.create({
          data: {
            rideId: ride.id,
            fromStatus: 'REQUESTED',
            toStatus: 'DRIVER_ACCEPTED',
          },
        });

        await this.eventBus.publish(
          new RideStatusChangedEvent(ride.id, {
            from: 'REQUESTED' as any,
            to: 'DRIVER_ACCEPTED' as any,
            timestamp: new Date(),
          }),
        );

        this.logger.log(`[DEV TEST MODE] Ride [${ride.id}] auto-assigned to Test Driver [${devDriver.id}]`);
        return this.mapToResponseDto(updatedRide);
      } catch (devErr: any) {
        this.logger.warn(`[DEV TEST MODE Warning] ${devErr.message}`);
      }
    }

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
      include: {
        driver: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    if (!ride) return null;
    return this.mapToResponseDto(ride);
  }

  async getActiveRideForDriver(driverUserId: string): Promise<RideResponseDto | null> {
    const ride = await this.prisma.ride.findFirst({
      where: {
        driver: { userId: driverUserId },
        status: { in: ['DRIVER_ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] },
      },
      include: {
        passenger: true,
        driver: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    if (!ride) return null;
    return this.mapToResponseDto(ride);
  }

  async getRideHistoryForPassenger(userId: string): Promise<RideResponseDto[]> {
    const rides = await this.prisma.ride.findMany({
      where: { passengerId: userId },
      orderBy: { requestedAt: 'desc' },
      take: 50,
    });
    return rides.map((ride) => this.mapToResponseDto(ride));
  }

  private mapToResponseDto(ride: any): RideResponseDto {
    const driverUser = ride.driver?.user;
    const vehicleInfo = ride.driver?.vehicleInfo || { make: 'Dacia', model: 'Logan', plate: 'Marrakech 44-A-12345' };

    // ── Distance Benefit Display Values ─────────────────────────────────────────
    // Display-only: GPS route, ETA, and pricing are NOT affected.
    const originalDistanceMeters: number | undefined = ride.originalDistanceMeters != null
      ? Number(ride.originalDistanceMeters)
      : undefined;
    const driverDisplayDistanceMeters: number | undefined = ride.driverDisplayDistanceMeters != null
      ? Number(ride.driverDisplayDistanceMeters)
      : originalDistanceMeters;
    const passengerDisplayDistanceMeters: number | undefined = ride.passengerDisplayDistanceMeters != null
      ? Number(ride.passengerDisplayDistanceMeters)
      : originalDistanceMeters;
    const driverBenefitMeters: number | undefined = ride.driverBenefitMeters != null
      ? Number(ride.driverBenefitMeters)
      : undefined;
    const passengerCreditMeters: number | undefined = ride.passengerCreditMeters != null
      ? Number(ride.passengerCreditMeters)
      : undefined;
    // Convenience field: driver-visible distance in km (for Driver App / legacy consumers)
    const distanceKm: number | undefined = driverDisplayDistanceMeters != null
      ? Math.round(driverDisplayDistanceMeters) / 1000
      : undefined;

    return {
      id: ride.id,
      status: ride.status,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      driverName: driverUser?.fullName || 'Sami Driver',
      driverPhone: driverUser?.phoneNumber || '+212600000000',
      driverVehicle: vehicleInfo,
      pickupLat: Number(ride.pickupLat),
      pickupLng: Number(ride.pickupLng),
      pickupAddress: ride.pickupAddress,
      dropoffLat: Number(ride.dropoffLat),
      dropoffLng: Number(ride.dropoffLng),
      dropoffAddress: ride.dropoffAddress,
      estimatedPrice: Number(ride.estimatedPrice),
      verificationCode: ride.status === 'ARRIVED' ? ride.otpCode : undefined,
      createdAt: ride.requestedAt,
      // ── Distance Benefit Display Fields ─────────────────────────────────────
      originalDistanceMeters,
      driverDisplayDistanceMeters,
      passengerDisplayDistanceMeters,
      driverBenefitMeters,
      passengerCreditMeters,
      distanceKm,
    } as any;
  }
}
