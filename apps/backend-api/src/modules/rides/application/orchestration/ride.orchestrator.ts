import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { RideService } from '../ride.service';
import { RideLifecycleService } from '../ride-lifecycle.service';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';
import { LocationService, LocationPingDto } from '../../../location/application/location.service';
import { PricingService } from '../../../pricing/domain/pricing.service';
import { TripFinalizerService } from '../trip-finalizer.service';
import { RideLedgerService } from '../../../financial/application/ride-ledger.service';
import { WorkflowTraceService } from './workflow-trace.service';
import { RequestRideDto } from '../../presentation/dtos/request-ride.dto';
import { RideResponseDto } from '../../presentation/dtos/ride-response.dto';
import { UpdateDriverStatusDto } from '../../presentation/dtos/update-driver-status.dto';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { calculateHaversineDistance, metersToKm } from '../../../../core/common/geo.utils';

@Injectable()
export class RideOrchestrator {
  private readonly logger = new Logger(RideOrchestrator.name);

  constructor(
    private readonly rideService: RideService,
    private readonly rideLifecycle: RideLifecycleService,
    private readonly driverAcceptance: DriverAcceptanceService,
    private readonly locationService: LocationService,
    private readonly pricingService: PricingService,
    private readonly rideLedger: RideLedgerService,
    private readonly tripFinalizer: TripFinalizerService,
    private readonly trace: WorkflowTraceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Orchestrates the entire "Initiation" phase of a ride.
   */
  async requestRide(passengerId: string, dto: RequestRideDto): Promise<RideResponseDto> {
    this.logger.log(`Orchestrating new ride request for passenger: ${passengerId}`);
    
    // 1. Calculate Estimate via shared geo utility
    const distanceMeters = calculateHaversineDistance(dto.pickupLat, dto.pickupLng, dto.dropoffLat, dto.dropoffLng);
    const distanceKm = metersToKm(distanceMeters);
    const pricing = this.pricingService.calculateEstimate(distanceKm);

    try {
      // 2. Create Ride with enforced estimate
      const ride = await this.rideService.requestRide(passengerId, {
        ...dto,
        estimatedPrice: pricing.total,
      } as any);
      
      await this.trace.capture(ride.id, {
        step: 'RIDE_REQUEST_INITIATED',
        source: 'RideOrchestrator',
        data: { pricing, dto },
        status: 'SUCCESS',
      });

      return ride;
    } catch (error) {
      this.logger.error(`Failed to orchestrate ride request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Orchestrates the "Driver Handshake" phase.
   */
  async acceptRide(driverId: string, rideId: string): Promise<void> {
    await this.trace.capture(rideId, {
      step: 'DRIVER_ACCEPTANCE_START',
      source: 'DriverController',
      data: { driverId },
      status: 'PENDING',
    });

    try {
      await this.driverAcceptance.acceptRide(driverId, rideId);
      
      await this.trace.capture(rideId, {
        step: 'DRIVER_ACCEPTED',
        source: 'DriverAcceptanceService',
        status: 'SUCCESS',
      });
    } catch (error) {
      await this.trace.capture(rideId, {
        step: 'DRIVER_ACCEPTANCE_FAILED',
        source: 'DriverAcceptanceService',
        status: 'FAILED',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Orchestrates the "Pickup & Physical Commitment" phase.
   */
  async reportArrival(driverId: string, rideId: string): Promise<string> {
    try {
      const otp = await this.rideLifecycle.reportArrival(rideId, driverId);
      
      await this.trace.capture(rideId, {
        step: 'DRIVER_ARRIVED_AT_PICKUP',
        source: 'RideLifecycleService',
        status: 'SUCCESS',
      });

      return otp;
    } catch (error) {
      await this.trace.capture(rideId, {
        step: 'ARRIVAL_REPORT_FAILED',
        source: 'RideLifecycleService',
        status: 'FAILED',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Orchestrates the "Handshake & Execution" phase.
   */
  async startTrip(driverId: string, rideId: string, otp: string): Promise<void> {
    try {
      await this.rideLifecycle.startTrip(rideId, driverId, otp);
      
      await this.trace.capture(rideId, {
        step: 'TRIP_STARTED_VIA_OTP',
        source: 'RideLifecycleService',
        status: 'SUCCESS',
      });
    } catch (error) {
      await this.trace.capture(rideId, {
        step: 'TRIP_START_FAILED',
        source: 'RideLifecycleService',
        status: 'FAILED',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Orchestrates the "Closure & Settlement" phase.
   * Now requires driverId for authorization check.
   */
  async completeRide(driverId: string, rideId: string): Promise<void> {
    try {
      // Authoritative complete & settle via unified finalizer
      await this.tripFinalizer.finalizeTrip(rideId, driverId);
      
      await this.trace.capture(rideId, {
        step: 'RIDE_FINALIZED_PRODUCTION',
        source: 'TripFinalizerService',
        status: 'SUCCESS',
      });
      
    } catch (error) {
      this.logger.error(`Ride finalization failed: ${error.message}`);
      await this.trace.capture(rideId, {
        step: 'FINALIZATION_FAILURE',
        source: 'RideOrchestrator',
        status: 'FAILED',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Orchestrates Driver Availability changes.
   */
  async updateDriverStatus(driverId: string, dto: UpdateDriverStatusDto): Promise<void> {
    const state = dto.isAvailable ? 'AVAILABLE' : 'OFFLINE';
    await this.locationService.syncDriverState(driverId, state);
    
    await this.trace.capture(driverId, {
      step: 'DRIVER_STATUS_CHANGE',
      source: 'DriverController',
      data: { state },
      status: 'SUCCESS',
    });
  }

  /**
   * Orchestrates Driver Location heartbeats.
   */
  async updateDriverLocation(driverId: string, dto: LocationPingDto): Promise<void> {
    // High frequency - we might conditionally trace this to avoid log bloat
    await this.locationService.updateDriverLocation(driverId, dto);
  }
}
