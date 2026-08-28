import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RideOrchestrator } from './ride.orchestrator';
import { RideService } from '../ride.service';
import { RideLifecycleService } from '../ride-lifecycle.service';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';
import { LocationService } from '../../../location/application/location.service';
import { PricingService } from '../../../pricing/domain/pricing.service';
import { TripFinalizerService } from '../trip-finalizer.service';
import { RideLedgerService } from '../../../financial/application/ride-ledger.service';
import { WorkflowTraceService } from './workflow-trace.service';
import { RequestRideDto } from '../../presentation/dtos/request-ride.dto';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RidesNegotiationGateway } from '../../presentation/gateways/rides-negotiation.gateway';

describe('Offered Price Handshake & Boundary Protection (Phase 2)', () => {
  let rideOrchestrator: RideOrchestrator;
  let rideService: jest.Mocked<RideService>;
  let pricingService: jest.Mocked<PricingService>;
  let driverAcceptanceService: jest.Mocked<DriverAcceptanceService>;
  let ridesNegotiationGateway: RidesNegotiationGateway;
  let mockRideAssignmentService: any;
  let mockGoogleMapsService: any;
  let mockDriverLocationRepository: any;

  beforeEach(async () => {
    const mockRideServiceObj = {
      requestRide: jest.fn(),
      getActiveRideForPassenger: jest.fn(),
      getRideHistoryForPassenger: jest.fn(),
      getRideForPassenger: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockPricingServiceObj = {
      calculateEstimate: jest.fn().mockReturnValue({
        baseFare: 10,
        distanceFare: 30,
        timeFare: 5,
        total: 45, // Distance calculated price = 45 MAD
        currency: 'MAD',
      }),
    };

    const mockDriverAcceptanceObj = {
      acceptRide: jest.fn().mockResolvedValue(undefined),
    };

    const mockRideLifecycleObj = {};
    const mockLocationServiceObj = {};
    const mockTripFinalizerObj = {};
    const mockRideLedgerObj = {};
    const mockWorkflowTraceObj = {
      capture: jest.fn().mockResolvedValue(undefined),
    };
    const mockPrismaObj = {};

    mockRideAssignmentService = {
      getRideWithPassengerDetails: jest.fn(),
    };
    mockGoogleMapsService = {
      getEstimates: jest.fn().mockResolvedValue({
        distanceText: '10.5 km',
        durationText: '15 mins',
        polyline: 'sample_polyline',
      }),
    };
    mockDriverLocationRepository = {
      findNearby: jest.fn().mockResolvedValue(['driver-uuid-001']),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RideOrchestrator,
        { provide: RideService, useValue: mockRideServiceObj },
        { provide: PricingService, useValue: mockPricingServiceObj },
        { provide: DriverAcceptanceService, useValue: mockDriverAcceptanceObj },
        { provide: RideLifecycleService, useValue: mockRideLifecycleObj },
        { provide: LocationService, useValue: mockLocationServiceObj },
        { provide: TripFinalizerService, useValue: mockTripFinalizerObj },
        { provide: RideLedgerService, useValue: mockRideLedgerObj },
        { provide: WorkflowTraceService, useValue: mockWorkflowTraceObj },
        { provide: PrismaService, useValue: mockPrismaObj },
        {
          provide: RidesNegotiationGateway,
          useFactory: () =>
            new RidesNegotiationGateway(
              mockRideAssignmentService,
              mockGoogleMapsService,
              mockDriverLocationRepository,
            ),
        },
      ],
    }).compile();

    rideOrchestrator = module.get<RideOrchestrator>(RideOrchestrator);
    rideService = module.get(RideService);
    pricingService = module.get(PricingService);
    driverAcceptanceService = module.get(DriverAcceptanceService);
    ridesNegotiationGateway = module.get(RidesNegotiationGateway);

    // Attach mock server to negotiation gateway
    (ridesNegotiationGateway as any).server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. END-TO-END OFFERED PRICE HANDSHAKE (30 MAD -> 30 MAD)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Full Offered Price Handshake Pipeline', () => {
    it('CRITICAL: Should preserve passenger offeredPrice 30 MAD over calculated distance price 45 MAD', async () => {
      const passengerId = 'passenger-uuid-100';
      const dto: RequestRideDto = {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Gueliz, Marrakech',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Jemaa el-Fnaa, Marrakech',
        serviceType: 'ECONOMY',
        offeredPrice: 30, // Passenger explicitly offers 30 MAD
      };

      rideService.requestRide.mockImplementation(async (pid, data: any) => ({
        id: 'ride-uuid-300',
        passengerId: pid,
        status: 'REQUESTED',
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        pickupAddress: data.pickupAddress,
        dropoffLat: data.dropoffLat,
        dropoffLng: data.dropoffLng,
        dropoffAddress: data.dropoffAddress,
        estimatedPrice: data.estimatedPrice,
        createdAt: new Date(),
      }));

      // Step A: Ride Orchestration
      const createdRide = await rideOrchestrator.requestRide(passengerId, dto);

      // Verify: Pricing calculation distance fare (45 MAD) was bypassed in favor of passenger 30 MAD
      expect(pricingService.calculateEstimate).toHaveBeenCalled();
      expect(createdRide.estimatedPrice).toBe(30);
      expect(rideService.requestRide).toHaveBeenCalledWith(
        passengerId,
        expect.objectContaining({ estimatedPrice: 30 }),
      );

      // Step B: Socket Broadcast Payload Construction
      mockRideAssignmentService.getRideWithPassengerDetails.mockResolvedValue({
        id: createdRide.id,
        estimatedPrice: createdRide.estimatedPrice,
        pickupLat: createdRide.pickupLat,
        pickupLng: createdRide.pickupLng,
        dropoffLat: createdRide.dropoffLat,
        dropoffLng: createdRide.dropoffLng,
        pickupAddress: createdRide.pickupAddress,
        dropoffAddress: createdRide.dropoffAddress,
        passenger: {
          fullName: 'Amine Passenger',
          _count: { customerRides: 5 },
        },
      });

      await ridesNegotiationGateway.broadcastNewRide(createdRide.id);

      const mockServerTo = (ridesNegotiationGateway as any).server.to;
      expect(mockServerTo).toHaveBeenCalledWith('presence_driver-uuid-001');

      const emitCalls = mockServerTo().emit.mock.calls;
      const emitCall = emitCalls.find((c: any[]) => c[0] === 'new_ride_request' || c[0] === 'ride.offer') || emitCalls[0];
      const payload = emitCall[1];

      // Verify: All socket fare fields broadcast EXACTLY 30 MAD
      expect(payload.offeredPrice).toBe(30);
      expect(payload.fare).toBe(30);
      expect(payload.estimatedPrice).toBe(30);

      // Step C: Driver Acceptance
      await rideOrchestrator.acceptRide('driver-uuid-001', createdRide.id);
      expect(driverAcceptanceService.acceptRide).toHaveBeenCalledWith(
        'driver-uuid-001',
        createdRide.id,
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CLASS-VALIDATOR BOUNDARY TESTS FOR offeredPrice
  // ───────────────────────────────────────────────────────────────────────────
  describe('DTO Boundary Validation (@Min(5))', () => {
    const createDto = (offeredPrice: any): RequestRideDto =>
      plainToInstance(RequestRideDto, {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Gueliz, Marrakech',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Jemaa el-Fnaa, Marrakech',
        serviceType: 'ECONOMY',
        offeredPrice,
      });

    it('5 MAD -> PASS (Minimum allowed fare boundary)', async () => {
      const dto = createDto(5);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('30 MAD -> PASS (Standard valid offered price)', async () => {
      const dto = createDto(30);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('100 MAD -> PASS (High valid offered price)', async () => {
      const dto = createDto(100);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('0 MAD -> REJECT (Must be at least 5 MAD)', async () => {
      const dto = createDto(0);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'offeredPrice');
      expect(priceError).toBeDefined();
      expect(priceError?.constraints?.min).toContain('at least 5 MAD');
    });

    it('4.99 MAD -> REJECT (Below minimum 5 MAD threshold)', async () => {
      const dto = createDto(4.99);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'offeredPrice');
      expect(priceError).toBeDefined();
    });

    it('Negative (-10 MAD) -> REJECT (Must be at least 5 MAD)', async () => {
      const dto = createDto(-10);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'offeredPrice');
      expect(priceError).toBeDefined();
    });

    it('NaN / String ("abc") -> REJECT (Must be a number)', async () => {
      const dto = createDto('invalid_price');
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'offeredPrice');
      expect(priceError).toBeDefined();
    });

    it('omitted (undefined) -> PASS (Fallback pricing active)', async () => {
      const dto = createDto(undefined);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);

      // Verify orchestrator uses distance fallback pricing (45 MAD) when omitted
      rideService.requestRide.mockImplementation(async (pid, data: any) => ({
        id: 'ride-fallback-001',
        passengerId: pid,
        status: 'REQUESTED',
        estimatedPrice: data.estimatedPrice,
      } as any));

      const created = await rideOrchestrator.requestRide('passenger-uuid-101', dto);
      expect(created.estimatedPrice).toBe(45); // Fallback estimate
    });
  });
});
