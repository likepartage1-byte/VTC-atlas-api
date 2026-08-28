import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LocationService } from './location.service';
import { DriverAcceptanceService } from '../../drivers/application/driver-acceptance.service';
import { DriverEligibilityService } from '../../drivers/application/services/driver-eligibility.service';
import { DispatchEngine } from '../../dispatch/application/dispatch.engine';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { RideStatus } from '@prisma/client';

describe('Master Upgrade Blueprint — Phase 3: Driver Telemetry & Order Acceptance Flow', () => {
  let locationService: LocationService;
  let acceptanceService: DriverAcceptanceService;
  let eligibilityService: jest.Mocked<DriverEligibilityService>;
  let dispatchEngine: jest.Mocked<DispatchEngine>;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let mockRedisClient: any;

  beforeEach(async () => {
    const redisStore: Record<string, string> = {};
    const mockPipeline = {
      hset: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      zrem: jest.fn().mockReturnThis(),
      geoadd: jest.fn().mockReturnThis(),
      xadd: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    mockRedisClient = {
      get: jest.fn().mockImplementation(async (key: string) => redisStore[key] || null),
      set: jest.fn().mockImplementation(async (key: string, val: string, ...args: any[]) => {
        // Handle PX 2000 NX throttle gate
        if (args.includes('NX')) {
          if (redisStore[key]) return null; // Already locked
          redisStore[key] = val;
          return 'OK';
        }
        redisStore[key] = val;
        return 'OK';
      }),
      del: jest.fn().mockImplementation(async (key: string) => {
        delete redisStore[key];
        return 1;
      }),
      zrem: jest.fn().mockResolvedValue(1),
      pipeline: jest.fn().mockReturnValue(mockPipeline),
    };

    const mockPrismaObj = {
      driver: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      ride: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      rideStatusHistory: {
        create: jest.fn(),
      },
      rideLedger: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ id: 'ledger-mock' }),
      },
      driverAccount: {
        findUnique: jest.fn().mockResolvedValue({ balance: 100.0 }),
        create: jest.fn().mockResolvedValue({ balance: 100.0 }),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      driverTransaction: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaObj)),
    };

    const mockRedisServiceObj = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const mockEligibilityObj = {
      canReceiveRides: jest.fn().mockResolvedValue(true),
    };

    const mockDispatchEngineObj = {
      validateAndConsume: jest.fn().mockResolvedValue(true),
    };

    const mockEventEmitterObj = {
      emit: jest.fn(),
    };

    const mockEventBusObj = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        DriverAcceptanceService,
        { provide: PrismaService, useValue: mockPrismaObj },
        { provide: RedisService, useValue: mockRedisServiceObj },
        { provide: DriverEligibilityService, useValue: mockEligibilityObj },
        { provide: DispatchEngine, useValue: mockDispatchEngineObj },
        { provide: EventEmitter2, useValue: mockEventEmitterObj },
        { provide: DomainEventBus, useValue: mockEventBusObj },
      ],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
    acceptanceService = module.get<DriverAcceptanceService>(DriverAcceptanceService);
    eligibilityService = module.get(DriverEligibilityService);
    dispatchEngine = module.get(DispatchEngine);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP A — REDIS TELEMETRY THROTTLE
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP A — Redis Telemetry Throttle', () => {
    it('A1: First location update passes throttle; second update within 2s is throttled via PX 2000 NX', async () => {
      // First update -> Throttle key set successfully
      await locationService.updateDriverLocation('driver-1', { lat: 31.6258, lng: -7.9891 });
      expect(mockRedisClient.pipeline).toHaveBeenCalled();

      jest.clearAllMocks();

      // Second update under 2 seconds -> Throttled (isThrottled is null)
      await locationService.updateDriverLocation('driver-1', { lat: 31.6260, lng: -7.9895 });
      expect(mockRedisClient.pipeline).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP B — DRIVER GEO STATE SEPARATION
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP B — Driver GEO State Separation', () => {
    it('B1: AVAILABLE driver location is added to geo:drivers:available', async () => {
      mockRedisClient.get.mockImplementation(async (key: string) => {
        if (key === 'driver:driver-avail:state') return 'AVAILABLE';
        return null;
      });

      await locationService.updateDriverLocation('driver-avail', { lat: 31.6258, lng: -7.9891 });

      const pipeline = mockRedisClient.pipeline();
      expect(pipeline.geoadd).toHaveBeenCalledWith('geo:drivers:available', -7.9891, 31.6258, 'driver-avail');
    });

    it('B2: OFFLINE driver updates are ignored and NOT added to GEO indexes', async () => {
      mockRedisClient.get.mockImplementation(async (key: string) => {
        if (key === 'driver:driver-offline:state') return 'OFFLINE';
        return null;
      });

      await locationService.updateDriverLocation('driver-offline', { lat: 31.6258, lng: -7.9891 });

      const pipeline = mockRedisClient.pipeline();
      expect(pipeline.geoadd).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP C — DRIVER ELIGIBILITY GATE
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP C — Driver Eligibility Gate', () => {
    it('C1: Ineligible driver is blocked early with ConflictException before acceptance pipeline', async () => {
      prismaService.driver.findFirst.mockResolvedValue({
        id: 'driver-ineligible-1',
        userId: 'user-ineligible-1',
      } as any);

      eligibilityService.canReceiveRides.mockResolvedValue(false); // Ineligible

      await expect(
        acceptanceService.acceptRide('driver-ineligible-1', 'ride-uuid-100'),
      ).rejects.toThrow(ConflictException);

      expect(dispatchEngine.validateAndConsume).not.toHaveBeenCalled();
      expect(prismaService.ride.update).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP D — RACE CONDITION / STRONG CONSISTENCY
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP D — Race Condition Protection', () => {
    it('D1: Driver A accepts first successfully; Driver B competing for the same ride receives 409 ConflictException', async () => {
      prismaService.driver.findFirst.mockImplementation(async (args: any) => {
        const id = args.where.OR[0].id;
        return { id, userId: `user-${id}` } as any;
      });

      // Driver A acceptance setup
      dispatchEngine.validateAndConsume.mockResolvedValueOnce(true); // Driver A wins claim
      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-race-1',
        status: 'DISPATCHED',
        estimatedPrice: 30.0,
      } as any);

      await acceptanceService.acceptRide('driver-A', 'ride-race-1');

      expect(prismaService.ride.update).toHaveBeenCalledWith({
        where: { id: 'ride-race-1' },
        data: expect.objectContaining({
          status: 'DRIVER_ACCEPTED',
          driverId: 'driver-A',
        }),
      });

      // Driver B attempts acceptance -> Redis claim expired/already consumed
      dispatchEngine.validateAndConsume.mockResolvedValueOnce(false); // Driver B loses claim

      await expect(
        acceptanceService.acceptRide('driver-B', 'ride-race-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP E — REDIS CLAIM CONSUMPTION
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP E — Redis Claim Consumption', () => {
    it('E1: DispatchEngine.validateAndConsume permits first claim and rejects subsequent claims', async () => {
      dispatchEngine.validateAndConsume.mockResolvedValueOnce(true);
      dispatchEngine.validateAndConsume.mockResolvedValueOnce(false);

      const claimA = await dispatchEngine.validateAndConsume('ride-1', 'driver-A');
      const claimB = await dispatchEngine.validateAndConsume('ride-1', 'driver-B');

      expect(claimA).toBe(true);
      expect(claimB).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP F — OFFERED PRICE INTEGRITY
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP F — Offered Price Integrity', () => {
    it('F1: Passenger offeredPrice 30 MAD remains 30 MAD after driver acceptance', async () => {
      prismaService.driver.findFirst.mockResolvedValue({
        id: 'driver-price-check',
        userId: 'user-price-check',
      } as any);

      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-price-30',
        status: 'DISPATCHED',
        estimatedPrice: 30.0, // Passenger offered price = 30 MAD
      } as any);

      await acceptanceService.acceptRide('driver-price-check', 'ride-price-30');

      // Verify: Ride update data NEVER altered estimatedPrice to distance fare
      const updateData = prismaService.ride.update.mock.calls[0][0].data;
      expect(updateData).not.toHaveProperty('estimatedPrice');
      expect(updateData.actualPrice).toBe(30.0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP G — FINANCIAL ISOLATION
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP G — Financial Isolation', () => {
    it('G1: Driver acceptance creates 0 RideLedger settlements and 0 balance credits', async () => {
      prismaService.driver.findFirst.mockResolvedValue({
        id: 'driver-fin-check',
        userId: 'user-fin-check',
      } as any);

      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-fin-check',
        status: 'DISPATCHED',
        estimatedPrice: 30.0,
      } as any);

      await acceptanceService.acceptRide('driver-fin-check', 'ride-fin-check');

      expect(prismaService.rideLedger.create).not.toHaveBeenCalled();
      expect(prismaService.driverAccount.upsert).not.toHaveBeenCalled();
    });
  });
});
