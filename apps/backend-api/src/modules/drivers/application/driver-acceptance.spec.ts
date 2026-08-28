import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DriverAcceptanceService } from './driver-acceptance.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';
import { DispatchEngine } from '../../dispatch/application/dispatch.engine';
import { DriverEligibilityService } from './services/driver-eligibility.service';
import { InsufficientBalanceException } from '../../../core/exceptions/insufficient-balance.exception';

describe('DriverAcceptanceService (Phase 3 Financial Commission & Acceptance Reliability)', () => {
  let service: DriverAcceptanceService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let dispatchEngine: jest.Mocked<DispatchEngine>;
  let eligibilityService: jest.Mocked<DriverEligibilityService>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      zrem: jest.fn().mockResolvedValue(1),
    };

    const mockEventBusObj = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaObj = {
      driver: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      driverAccount: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      rideLedger: {
        upsert: jest.fn(),
      },
      driverTransaction: {
        create: jest.fn(),
      },
      ride: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      rideStatusHistory: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => {
        return cb(mockPrismaObj);
      }),
    };

    const mockRedisServiceObj = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const mockDispatchEngineObj = {
      validateAndConsume: jest.fn(),
    };

    const mockEligibilityServiceObj = {
      canReceiveRides: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverAcceptanceService,
        { provide: DomainEventBus, useValue: mockEventBusObj },
        { provide: PrismaService, useValue: mockPrismaObj },
        { provide: RedisService, useValue: mockRedisServiceObj },
        { provide: DispatchEngine, useValue: mockDispatchEngineObj },
        { provide: DriverEligibilityService, useValue: mockEligibilityServiceObj },
      ],
    }).compile();

    service = module.get<DriverAcceptanceService>(DriverAcceptanceService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
    dispatchEngine = module.get(DispatchEngine);
    eligibilityService = module.get(DriverEligibilityService);
    eventBus = module.get(DomainEventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Driver Eligibility: Should reject acceptance if driver is not verified/eligible', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({
      id: 'driver-unverified-001',
      userId: 'user-001',
    } as any);

    eligibilityService.canReceiveRides.mockResolvedValue(false);

    await expect(
      service.acceptRide('driver-unverified-001', 'ride-uuid-999'),
    ).rejects.toThrow(ConflictException);

    expect(dispatchEngine.validateAndConsume).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });

  it('2. Scenario 1: Agreed Price = 100 MAD, Balance = 20 MAD -> Commission 10% (10 MAD) debited, Balance = 10 MAD (Ledger untouched until trip completion)', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-A', userId: 'user-A' } as any);
    eligibilityService.canReceiveRides.mockResolvedValue(true);
    dispatchEngine.validateAndConsume.mockResolvedValue(true);

    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-100',
      status: 'DISPATCHED',
      estimatedPrice: 100.0,
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-A',
      balance: 20.0,
    } as any);

    const result = await service.acceptRide('driver-A', 'ride-100');

    expect(result.success).toBe(true);
    expect(result.agreedPrice).toBe(100);
    expect(result.commissionAmount).toBe(10);
    expect(result.driverNetEarnings).toBe(90);
    expect(result.newBalance).toBe(10);

    expect(prismaService.driverAccount.update).toHaveBeenCalledWith({
      where: { driverId: 'driver-A' },
      data: { balance: 10 },
    });

    expect(prismaService.driverTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        driverId: 'driver-A',
        type: 'DEBIT',
        amount: 10,
        referenceType: 'PLATFORM_COMMISSION',
      }),
    });

    // Verify: RideLedger is NOT created during acceptance to avoid double settlement upon trip completion
    expect(prismaService.rideLedger.upsert).not.toHaveBeenCalled();
  });

  it('3. Scenario 2: Agreed Price = 100 MAD, Balance = 5 MAD -> Rejects with InsufficientBalanceException (402)', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-low', userId: 'user-low' } as any);
    eligibilityService.canReceiveRides.mockResolvedValue(true);
    dispatchEngine.validateAndConsume.mockResolvedValue(true);

    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-100-low',
      status: 'DISPATCHED',
      estimatedPrice: 100.0,
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-low',
      balance: 5.0,
    } as any);

    await expect(service.acceptRide('driver-low', 'ride-100-low')).rejects.toThrow(
      InsufficientBalanceException,
    );

    expect(prismaService.driverAccount.update).not.toHaveBeenCalled();
    expect(prismaService.rideLedger.upsert).not.toHaveBeenCalled();
    expect(prismaService.driverTransaction.create).not.toHaveBeenCalled();
  });

  it('4. Scenario 3: Agreed Price = 100 MAD, Balance = 10 MAD -> Deducts 10 MAD, Balance = 0 MAD', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-exact', userId: 'user-exact' } as any);
    eligibilityService.canReceiveRides.mockResolvedValue(true);
    dispatchEngine.validateAndConsume.mockResolvedValue(true);

    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-100-exact',
      status: 'DISPATCHED',
      estimatedPrice: 100.0,
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-exact',
      balance: 10.0,
    } as any);

    const result = await service.acceptRide('driver-exact', 'ride-100-exact');

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(0);
    expect(result.commissionAmount).toBe(10);
  });

  it('5. Scenario 4: Idempotency Safety -> Repeated acceptance calls do not deduct commission twice', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-idempotent', userId: 'user-idem' } as any);
    eligibilityService.canReceiveRides.mockResolvedValue(true);
    dispatchEngine.validateAndConsume.mockResolvedValue(true);

    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-already-accepted',
      status: 'DRIVER_ACCEPTED',
      driverId: 'driver-idempotent',
      estimatedPrice: 100.0,
      actualPrice: 100.0,
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-idempotent',
      balance: 15.0,
    } as any);

    const result = await service.acceptRide('driver-idempotent', 'ride-already-accepted');

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(15);
    expect(prismaService.driverAccount.update).not.toHaveBeenCalled();
    expect(prismaService.driverTransaction.create).not.toHaveBeenCalled();
  });

  it('6. Scenario 5: Commission calculated strictly from agreed price (100 MAD = 10 MAD fee)', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-agreed', userId: 'user-agreed' } as any);
    eligibilityService.canReceiveRides.mockResolvedValue(true);
    dispatchEngine.validateAndConsume.mockResolvedValue(true);

    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-agreed-100',
      status: 'DISPATCHED',
      estimatedPrice: 120.0,
      actualPrice: 100.0, // Agreed price set by passenger/driver negotiation = 100 MAD
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-agreed',
      balance: 50.0,
    } as any);

    const result = await service.acceptRide('driver-agreed', 'ride-agreed-100');

    expect(result.agreedPrice).toBe(100);
    expect(result.commissionAmount).toBe(10);
    expect(result.driverNetEarnings).toBe(90);
  });
});
