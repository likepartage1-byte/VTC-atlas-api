import { Test, TestingModule } from '@nestjs/testing';
import { DriverRideController } from './driver-ride.controller';
import { RideOrchestrator } from '../../application/orchestration/ride.orchestrator';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';
import { RideService } from '../../application/ride.service';
import { RideLifecycleService } from '../../application/ride-lifecycle.service';
import { LocationService } from '../../../location/application/location.service';
import { PricingService } from '../../../pricing/domain/pricing.service';
import { RideLedgerService } from '../../../financial/application/ride-ledger.service';
import { TripFinalizerService } from '../../application/trip-finalizer.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { DomainEventBus } from '../../../../core/events/domain-event-bus';
import { DispatchEngine } from '../../../dispatch/application/dispatch.engine';
import { DriverEligibilityService } from '../../../drivers/application/services/driver-eligibility.service';
import { WorkflowTraceService } from '../../application/orchestration/workflow-trace.service';
import { InsufficientBalanceException } from '../../../../core/exceptions/insufficient-balance.exception';

describe('DriverRideController -> RideOrchestrator -> DriverAcceptanceService Integration E2E Pipeline', () => {
  let controller: DriverRideController;
  let prismaService: jest.Mocked<PrismaService>;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      zrem: jest.fn().mockResolvedValue(1),
    };

    const mockEventBusObj = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaObj: any = {
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
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaObj)),
    };

    const mockRedisServiceObj = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const mockDispatchEngineObj = {
      validateAndConsume: jest.fn().mockResolvedValue(true),
    };

    const mockEligibilityServiceObj = {
      canReceiveRides: jest.fn().mockResolvedValue(true),
    };

    const mockWorkflowTraceServiceObj = {
      capture: jest.fn().mockResolvedValue(undefined),
    };

    const mockRideServiceObj = {
      getActiveRideForDriver: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverRideController],
      providers: [
        RideOrchestrator,
        DriverAcceptanceService,
        { provide: RideService, useValue: mockRideServiceObj },
        { provide: RideLifecycleService, useValue: {} },
        { provide: LocationService, useValue: {} },
        { provide: PricingService, useValue: {} },
        { provide: RideLedgerService, useValue: {} },
        { provide: TripFinalizerService, useValue: {} },
        { provide: DomainEventBus, useValue: mockEventBusObj },
        { provide: PrismaService, useValue: mockPrismaObj },
        { provide: RedisService, useValue: mockRedisServiceObj },
        { provide: DispatchEngine, useValue: mockDispatchEngineObj },
        { provide: DriverEligibilityService, useValue: mockEligibilityServiceObj },
        { provide: WorkflowTraceService, useValue: mockWorkflowTraceServiceObj },
      ],
    }).compile();

    controller = module.get<DriverRideController>(DriverRideController);
    prismaService = module.get(PrismaService);
  });

  it('E2E Pipeline Success: Driver accepts ride #ride-100 (agreed 100 MAD), wallet balance = 50 MAD -> 10% (10 MAD) debited, returns new balance 40 MAD', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-e2e-1', userId: 'user-e2e-1' } as any);
    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-100',
      status: 'DISPATCHED',
      estimatedPrice: 100.0,
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-e2e-1',
      balance: 50.0,
    } as any);

    const res = await controller.acceptRide('ride-100', 'user-e2e-1');

    expect(res.success).toBe(true);
    expect(res.agreedPrice).toBe(100);
    expect(res.commissionAmount).toBe(10);
    expect(res.driverNetEarnings).toBe(90);
    expect(res.newBalance).toBe(40);

    expect(prismaService.driverAccount.update).toHaveBeenCalledWith({
      where: { driverId: 'driver-e2e-1' },
      data: { balance: 40 },
    });

    expect(prismaService.driverTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        driverId: 'driver-e2e-1',
        type: 'DEBIT',
        amount: 10,
        referenceType: 'PLATFORM_COMMISSION',
      }),
    });
  });

  it('E2E Pipeline Failure: Driver accepts ride #ride-200 (agreed 100 MAD), wallet balance = 2 MAD -> Throws InsufficientBalanceException (402)', async () => {
    (prismaService.driver.findFirst as jest.Mock).mockResolvedValue({ id: 'driver-e2e-low', userId: 'user-e2e-low' } as any);
    (prismaService.ride.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'ride-200',
      status: 'DISPATCHED',
      estimatedPrice: 100.0,
    } as any);

    (prismaService.driverAccount.findUnique as jest.Mock).mockResolvedValue({
      driverId: 'driver-e2e-low',
      balance: 2.0,
    } as any);

    await expect(controller.acceptRide('ride-200', 'user-e2e-low')).rejects.toThrow(InsufficientBalanceException);

    expect(prismaService.driverAccount.update).not.toHaveBeenCalled();
    expect(prismaService.driverTransaction.create).not.toHaveBeenCalled();
  });
});
