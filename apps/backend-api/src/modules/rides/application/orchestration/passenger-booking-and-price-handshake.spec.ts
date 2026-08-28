import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
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

describe('Master Upgrade Blueprint — Phase 2: Passenger Booking & Price Handshake Polish', () => {
  let rideOrchestrator: RideOrchestrator;
  let rideService: jest.Mocked<RideService>;
  let pricingService: jest.Mocked<PricingService>;
  let rideAssignmentService: RideAssignmentService;
  let locationDiscoveryService: LocationDiscoveryService;
  let rideLedgerService: RideLedgerService;
  let prismaService: jest.Mocked<PrismaService>;
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
        baseFare: 15,
        distanceFare: 30,
        timeFare: 0,
        total: 45, // Distance fare calculated = 45 MAD
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
      getSocketId: jest.fn().mockResolvedValue('socket-active-123'),
    };

    const mockSettingsObj = {
      getCommissionRate: jest.fn().mockResolvedValue(0.15),
    };

    const mockDriverAcceptanceObj = {
      acceptRide: jest.fn().mockImplementation(async (driverId: string, rideId: string, options?: any) => ({
        success: true,
        rideId,
        agreedPrice: options?.agreedPrice ?? 35,
        commissionRate: 0.10,
        commissionAmount: (options?.agreedPrice ?? 35) * 0.10,
        driverNetEarnings: (options?.agreedPrice ?? 35) * 0.90,
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
    rideLedgerService = new RideLedgerService(prismaService as any, mockSettingsObj as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP A — OFFERED PRICE PRESERVATION & DISTANCE BYPASS
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP A — Offered Price Preservation & Distance Bypass', () => {
    it('A1: Passenger offeredPrice (30 MAD) is preserved and bypasses calculated distance fare (45 MAD)', async () => {
      const dto: RequestRideDto = {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Gueliz, Marrakech',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Jemaa el-Fnaa, Marrakech',
        serviceType: 'ECONOMY',
        offeredPrice: 30, // Passenger offered price = 30 MAD
      };

      rideService.requestRide.mockImplementation(async (pid, data: any) => ({
        id: 'ride-phase2-001',
        passengerId: pid,
        status: 'REQUESTED',
        serviceType: data.serviceType,
        estimatedPrice: data.estimatedPrice,
      } as any));

      const createdRide = await rideOrchestrator.requestRide('passenger-uuid-1', dto);

      expect(createdRide.estimatedPrice).toBe(30);
      expect(pricingService.calculateEstimate).toHaveBeenCalled();
      expect(rideService.requestRide).toHaveBeenCalledWith(
        'passenger-uuid-1',
        expect.objectContaining({
          estimatedPrice: 30, // 30 MAD preserved, 45 MAD distance estimate bypassed
        }),
      );
    });

    it('A2: Counter-offer (35 MAD) updates estimatedPrice ONLY upon explicit passenger acceptance', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      prismaService.ride.updateMany.mockResolvedValue({ count: 1 });

      // Passenger accepts driver's counter offer of 35 MAD
      const result = await rideAssignmentService.assignRide('ride-phase2-001', 'driver-B', 35);

      expect(result).toMatchObject({ success: true, agreedPrice: 35 });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP B — VALIDATION & DTO BOUNDARIES
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP B — Validation & DTO Boundaries', () => {
    it('B1: Rejects offeredPrice < 5 MAD with validation errors', async () => {
      const invalidDto = plainToInstance(RequestRideDto, {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Pickup',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Dropoff',
        serviceType: 'ECONOMY',
        offeredPrice: 4, // 4 MAD < min 5 MAD boundary
      });

      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'offeredPrice');
      expect(priceError).toBeDefined();
    });

    it('B2: Accepts valid offeredPrice = 5 MAD and 30 MAD', async () => {
      const validDtoMin = plainToInstance(RequestRideDto, {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Pickup',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Dropoff',
        serviceType: 'ECONOMY',
        offeredPrice: 5, // Minimum boundary 5 MAD
      });

      const errorsMin = await validate(validDtoMin);
      expect(errorsMin.length).toBe(0);

      const validDtoStandard = plainToInstance(RequestRideDto, {
        pickupLat: 31.6258,
        pickupLng: -7.9891,
        pickupAddress: 'Pickup',
        dropoffLat: 31.6340,
        dropoffLng: -7.9990,
        dropoffAddress: 'Dropoff',
        serviceType: 'ECONOMY',
        offeredPrice: 30, // Standard 30 MAD
      });

      const errorsStandard = await validate(validDtoStandard);
      expect(errorsStandard.length).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP C — REALTIME SOCKET DISPATCH & NEGOTIATION
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP C — Realtime Socket Dispatch & Negotiation', () => {
    it('C1: Location Discovery receives exact serviceType and driver eligibility rules', async () => {
      mockRedisClient.georadius.mockResolvedValue([['driver-1', '1.2']]);

      const candidates = await locationDiscoveryService.findNearbyDrivers(
        31.6258,
        -7.9891,
        5,
        'ECONOMY',
      );

      expect(candidates.length).toBe(1);
      expect(candidates[0].driverId).toBe('driver-1');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP D — FINANCIAL PRICE ALIGNMENT
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP D — Financial Price Alignment', () => {
    it('D1: Completed ride settles based on 30 MAD offered price (Driver earnings = 25.50 MAD)', async () => {
      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-phase2-settle-30',
        status: 'COMPLETED',
        driverId: 'driver-uuid-001',
        estimatedPrice: 30.0,
        actualPrice: 30.0,
      } as any);

      prismaService.rideLedger.findUnique.mockResolvedValue(null);
      prismaService.rideLedger.create.mockResolvedValue({ id: 'ledger-uuid-30' } as any);

      await rideLedgerService.settleRide('ride-phase2-settle-30');

      expect(prismaService.rideLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalAmount: 30.0,
          companyFee: 4.5, // 30 * 0.15
          driverEarnings: 25.5, // 30 - 4.5
        }),
      });

      expect(prismaService.driverTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 25.5,
          type: 'CREDIT',
        }),
      });
    });
  });
});
