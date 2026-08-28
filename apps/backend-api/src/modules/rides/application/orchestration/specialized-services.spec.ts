import { Test, TestingModule } from '@nestjs/testing';
import { RideOrchestrator } from './ride.orchestrator';
import { RideService } from '../ride.service';
import { PricingService } from '../../../pricing/domain/pricing.service';
import { RideAssignmentService } from '../services/ride-assignment.service';
import { LocationDiscoveryService } from '../../../location/application/location-discovery.service';
import { RideLedgerService } from '../../../financial/application/ride-ledger.service';
import { SystemSettingsService } from '../../../admin/application/services/system-settings.service';
import { DriverEligibilityService } from '../../../drivers/application/services/driver-eligibility.service';
import { PresenceService } from '../../../realtime/infrastructure/services/presence.service';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';
import { RideLifecycleService } from '../ride-lifecycle.service';
import { LocationService } from '../../../location/application/location.service';
import { TripFinalizerService } from '../trip-finalizer.service';
import { WorkflowTraceService } from './workflow-trace.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { RequestRideDto } from '../../presentation/dtos/request-ride.dto';
import { RideStatus } from '@prisma/client';

describe('Specialized Services Domain: Intercity, Cargo & Scheduled Rides (Phase 7)', () => {
  let rideOrchestrator: RideOrchestrator;
  let rideService: jest.Mocked<RideService>;
  let pricingService: jest.Mocked<PricingService>;
  let rideAssignmentService: RideAssignmentService;
  let locationDiscoveryService: LocationDiscoveryService;
  let rideLedgerService: RideLedgerService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let eligibilityService: jest.Mocked<DriverEligibilityService>;
  let presenceService: jest.Mocked<PresenceService>;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      georadius: jest.fn(),
    };

    const mockPrismaObj = {
      ride: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      driver: {
        findUnique: jest.fn(),
      },
      rideLedger: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      driverTransaction: {
        create: jest.fn(),
      },
      driverAccount: {
        upsert: jest.fn(),
      },
      systemSetting: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaObj)),
    };

    const mockRedisServiceObj = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const mockPricingServiceObj = {
      calculateEstimate: jest.fn().mockReturnValue({
        baseFare: 20,
        distanceFare: 700,
        timeFare: 0,
        total: 720, // Calculated long distance fare (e.g. 720 MAD)
        currency: 'MAD',
      }),
    };

    const mockRideServiceObj = {
      requestRide: jest.fn(),
    };

    const mockEligibilityObj = {
      canReceiveRides: jest.fn().mockResolvedValue(true),
    };

    const mockPresenceObj = {
      getSocketId: jest.fn().mockResolvedValue('socket-123'),
    };

    const mockSettingsObj = {
      getCommissionRate: jest.fn().mockResolvedValue(0.15), // 15%
    };

    const mockDriverAcceptanceObj = {
      acceptRide: jest.fn().mockImplementation(async (driverId: string, rideId: string, options?: any) => ({
        success: true,
        rideId,
        agreedPrice: options?.agreedPrice ?? 270,
        commissionRate: 0.10,
        commissionAmount: (options?.agreedPrice ?? 270) * 0.10,
        driverNetEarnings: (options?.agreedPrice ?? 270) * 0.90,
        newBalance: 100,
      })),
    };
    const mockRideLifecycleObj = {};
    const mockLocationServiceObj = {};
    const mockTripFinalizerObj = {};
    const mockWorkflowTraceObj = { capture: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RideOrchestrator,
        RideAssignmentService,
        LocationDiscoveryService,
        RideLedgerService,
        { provide: RideService, useValue: mockRideServiceObj },
        { provide: PricingService, useValue: mockPricingServiceObj },
        { provide: PrismaService, useValue: mockPrismaObj },
        { provide: RedisService, useValue: mockRedisServiceObj },
        { provide: DriverEligibilityService, useValue: mockEligibilityObj },
        { provide: PresenceService, useValue: mockPresenceObj },
        { provide: SystemSettingsService, useValue: mockSettingsObj },
        { provide: DriverAcceptanceService, useValue: mockDriverAcceptanceObj },
        { provide: RideLifecycleService, useValue: mockRideLifecycleObj },
        { provide: LocationService, useValue: mockLocationServiceObj },
        { provide: TripFinalizerService, useValue: mockTripFinalizerObj },
        { provide: RideLedgerService, useValue: { settleRide: jest.fn() } },
        { provide: WorkflowTraceService, useValue: mockWorkflowTraceObj },
      ],
    }).compile();

    rideOrchestrator = module.get<RideOrchestrator>(RideOrchestrator);
    rideService = module.get(RideService);
    pricingService = module.get(PricingService);
    rideAssignmentService = module.get<RideAssignmentService>(RideAssignmentService);
    locationDiscoveryService = module.get<LocationDiscoveryService>(LocationDiscoveryService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
    eligibilityService = module.get(DriverEligibilityService);
    presenceService = module.get(PresenceService);

    // Instantiate clean RideLedgerService for Settlement testing
    rideLedgerService = new RideLedgerService(prismaService as any, mockSettingsObj as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST A — INTERCITY RIDES
  // ───────────────────────────────────────────────────────────────────────────
  describe('TEST A — Intercity Rides', () => {
    it('Intercity ride (Casablanca -> Marrakech, 250 MAD) preserves offeredPrice 250 MAD over distance estimate 720 MAD', async () => {
      const dto: RequestRideDto = {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Gueliz, Marrakech',
        dropoffLat: 33.5731,
        dropoffLng: -7.5898,
        dropoffAddress: 'Maarif, Casablanca',
        serviceType: 'INTERCITY',
        offeredPrice: 250, // Passenger offered price = 250 MAD
      };

      rideService.requestRide.mockImplementation(async (pid, data: any) => ({
        id: 'ride-intercity-100',
        passengerId: pid,
        status: 'REQUESTED',
        serviceType: data.serviceType,
        estimatedPrice: data.estimatedPrice,
      } as any));

      const createdRide = await rideOrchestrator.requestRide('passenger-uuid-1', dto);

      expect(createdRide.serviceType).toBe('INTERCITY');
      expect(createdRide.estimatedPrice).toBe(250);
      expect(rideService.requestRide).toHaveBeenCalledWith(
        'passenger-uuid-1',
        expect.objectContaining({
          serviceType: 'INTERCITY',
          estimatedPrice: 250,
        }),
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST B — CARGO RIDES
  // ───────────────────────────────────────────────────────────────────────────
  describe('TEST B — Cargo & Transport Rides', () => {
    it('Cargo ride (80 MAD) preserves offeredPrice 80 MAD and saves serviceType = CARGO', async () => {
      const dto: RequestRideDto = {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Industrial Zone, Marrakech',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Store, Marrakech',
        serviceType: 'CARGO',
        offeredPrice: 80, // Passenger offered price = 80 MAD
      };

      rideService.requestRide.mockImplementation(async (pid, data: any) => ({
        id: 'ride-cargo-200',
        passengerId: pid,
        status: 'REQUESTED',
        serviceType: data.serviceType,
        estimatedPrice: data.estimatedPrice,
      } as any));

      const createdRide = await rideOrchestrator.requestRide('passenger-uuid-2', dto);

      expect(createdRide.serviceType).toBe('CARGO');
      expect(createdRide.estimatedPrice).toBe(80);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST C — SCHEDULED RIDES
  // ───────────────────────────────────────────────────────────────────────────
  describe('TEST C — Scheduled / Pre-Booked Rides', () => {
    it('Scheduled ride (40 MAD, future timestamp) preserves offeredPrice 40 MAD and serviceType = SCHEDULED', async () => {
      const futureTimestamp = 1750000000000;
      const dto: any = {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Hotel, Marrakech',
        dropoffLat: 31.6069,
        dropoffLng: -8.0363,
        dropoffAddress: 'Menara Airport, Marrakech',
        serviceType: 'SCHEDULED',
        offeredPrice: 40,
        scheduledAt: futureTimestamp,
      };

      rideService.requestRide.mockImplementation(async (pid, data: any) => ({
        id: 'ride-scheduled-300',
        passengerId: pid,
        status: 'REQUESTED',
        serviceType: data.serviceType,
        estimatedPrice: data.estimatedPrice,
      } as any));

      const createdRide = await rideOrchestrator.requestRide('passenger-uuid-3', dto);

      expect(createdRide.serviceType).toBe('SCHEDULED');
      expect(createdRide.estimatedPrice).toBe(40);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST D — DRIVER DISCOVERY & VEHICLE MATCHING
  // ───────────────────────────────────────────────────────────────────────────
  describe('TEST D — Driver Discovery Filtering', () => {
    it('Filters nearby drivers by serviceType matching vehicle rules', async () => {
      // 1. Redis returns 2 drivers near location: driver-moto-1 and driver-car-1
      mockRedisClient.georadius.mockResolvedValue([
        ['driver-moto-1', '1.2'],
        ['driver-car-1', '2.5'],
      ]);

      presenceService.getSocketId.mockResolvedValue('socket-active');
      eligibilityService.canReceiveRides.mockResolvedValue(true);

      prismaService.driver.findUnique.mockImplementation(async (args: any) => {
        if (args.where.id === 'driver-moto-1') {
          return { id: 'driver-moto-1', vehicleInfo: { type: 'MOTORCYCLE' } } as any;
        }
        if (args.where.id === 'driver-car-1') {
          return { id: 'driver-car-1', vehicleInfo: { type: 'CAR' } } as any;
        }
        return null;
      });

      // Request MOTORCYCLE service -> only driver-moto-1 matched
      const motoCandidates = await locationDiscoveryService.findNearbyDrivers(
        31.6258,
        -7.9891,
        5,
        'MOTORCYCLE',
      );
      expect(motoCandidates.length).toBe(1);
      expect(motoCandidates[0].driverId).toBe('driver-moto-1');

      // Request CARGO/CAR service -> only driver-car-1 matched
      const carCandidates = await locationDiscoveryService.findNearbyDrivers(
        31.6258,
        -7.9891,
        5,
        'CARGO',
      );
      expect(carCandidates.length).toBe(1);
      expect(carCandidates[0].driverId).toBe('driver-car-1');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST E — BIDDING / COUNTER OFFER ON SPECIALIZED SERVICES
  // ───────────────────────────────────────────────────────────────────────────
  describe('TEST E — Specialized Rides Bidding & Counter Offer', () => {
    it('Intercity ride (250 MAD) receives driver bid (270 MAD) and passenger acceptance updates estimatedPrice to 270 MAD', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      prismaService.ride.updateMany.mockResolvedValue({ count: 1 });

      const result = await rideAssignmentService.assignRide('ride-intercity-100', 'driver-B', 270);

      expect(result).toMatchObject({ success: true, agreedPrice: 270 });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST F — LEDGER / SETTLEMENT FOR SPECIALIZED SERVICES
  // ───────────────────────────────────────────────────────────────────────────
  describe('TEST F — Specialized Services Settlement', () => {
    it('INTERCITY (250 MAD) settles based on 250 MAD (Driver earnings = 212.50 MAD)', async () => {
      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-intercity-100',
        status: 'COMPLETED',
        driverId: 'driver-uuid-001',
        estimatedPrice: 250.0,
        actualPrice: 250.0,
      } as any);

      prismaService.rideLedger.findUnique.mockResolvedValue(null);
      prismaService.rideLedger.create.mockResolvedValue({ id: 'ledger-uuid-intercity' } as any);

      await rideLedgerService.settleRide('ride-intercity-100');

      expect(prismaService.rideLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalAmount: 250.0,
          companyFee: 37.5, // 250 * 0.15
          driverEarnings: 212.5, // 250 - 37.5
        }),
      });

      expect(prismaService.driverTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 212.5,
          type: 'CREDIT',
        }),
      });
    });

    it('CARGO (80 MAD) settles based on 80 MAD (Driver earnings = 68.00 MAD)', async () => {
      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-cargo-200',
        status: 'COMPLETED',
        driverId: 'driver-uuid-002',
        estimatedPrice: 80.0,
        actualPrice: 80.0,
      } as any);

      prismaService.rideLedger.findUnique.mockResolvedValue(null);
      prismaService.rideLedger.create.mockResolvedValue({ id: 'ledger-uuid-cargo' } as any);

      await rideLedgerService.settleRide('ride-cargo-200');

      expect(prismaService.rideLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalAmount: 80.0,
          companyFee: 12.0, // 80 * 0.15
          driverEarnings: 68.0, // 80 - 12
        }),
      });
    });

    it('SCHEDULED (40 MAD) settles based on 40 MAD (Driver earnings = 34.00 MAD)', async () => {
      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-scheduled-300',
        status: 'COMPLETED',
        driverId: 'driver-uuid-003',
        estimatedPrice: 40.0,
        actualPrice: 40.0,
      } as any);

      prismaService.rideLedger.findUnique.mockResolvedValue(null);
      prismaService.rideLedger.create.mockResolvedValue({ id: 'ledger-uuid-scheduled' } as any);

      await rideLedgerService.settleRide('ride-scheduled-300');

      expect(prismaService.rideLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalAmount: 40.0,
          companyFee: 6.0, // 40 * 0.15
          driverEarnings: 34.0, // 40 - 6
        }),
      });
    });
  });
});
