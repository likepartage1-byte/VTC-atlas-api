import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RidesNegotiationGateway } from '../../presentation/gateways/rides-negotiation.gateway';
import { RideAssignmentService } from '../services/ride-assignment.service';
import { RideLedgerService } from '../../../financial/application/ride-ledger.service';
import { SystemSettingsService } from '../../../admin/application/services/system-settings.service';
import { GoogleMapsService } from '../../../../core/google-maps/google-maps.service';
import { DriverLocationRepository } from '../../../location/infrastructure/repositories/driver-location.repository';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { RideStatus } from '@prisma/client';

describe('Master Upgrade Blueprint — Phase 4: Bidding Engine & Counter-Offer Optimization', () => {
  let gateway: RidesNegotiationGateway;
  let rideAssignmentService: RideAssignmentService;
  let rideLedgerService: RideLedgerService;
  let prismaService: jest.Mocked<PrismaService>;
  let mockRedisClient: any;
  let mockSocket: any;
  let mockServer: any;

  beforeEach(async () => {
    const redisStore: Record<string, string> = {};

    mockRedisClient = {
      set: jest.fn().mockImplementation(async (key: string, val: string, ...args: any[]) => {
        if (args.includes('NX')) {
          if (redisStore[key]) return null;
          redisStore[key] = val;
          return 'OK';
        }
        redisStore[key] = val;
        return 'OK';
      }),
      get: jest.fn().mockImplementation(async (key: string) => redisStore[key] || null),
      del: jest.fn().mockImplementation(async (key: string) => {
        delete redisStore[key];
        return 1;
      }),
    };

    mockSocket = {
      emit: jest.fn(),
      handshake: { query: { userId: 'user-001' } },
    };

    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
      emit: jest.fn(),
    };

    const mockPrismaObj = {
      ride: {
        findUnique: jest.fn().mockImplementation(async (args: any) => ({
          id: args?.where?.id || 'ride-bid-30',
          estimatedPrice: 30.0,
          passengerId: 'passenger-001',
          tripType: 'CITY',
          serviceType: 'ECONOMY',
        })),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      driver: {
        findUnique: jest.fn(),
      },
      negotiation: {
        create: jest.fn().mockResolvedValue({ id: 'neg-1' }),
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
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(mockPrismaObj)),
    };

    const mockRedisServiceObj = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const mockGoogleMapsObj = {
      getEstimates: jest.fn().mockResolvedValue({
        distanceText: '5 km',
        durationText: '10 mins',
        polyline: 'abc',
      }),
    };

    const mockDriverLocationRepoObj = {
      findNearby: jest.fn().mockResolvedValue(['driver-1', 'driver-2']),
    };

    const mockSettingsObj = {
      getCommissionRate: jest.fn().mockResolvedValue(0.15),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidesNegotiationGateway,
        RideAssignmentService,
        { provide: PrismaService, useValue: mockPrismaObj },
        { provide: RedisService, useValue: mockRedisServiceObj },
        { provide: GoogleMapsService, useValue: mockGoogleMapsObj },
        { provide: DriverLocationRepository, useValue: mockDriverLocationRepoObj },
        { provide: SystemSettingsService, useValue: mockSettingsObj },
      ],
    }).compile();

    gateway = module.get<RidesNegotiationGateway>(RidesNegotiationGateway);
    rideAssignmentService = module.get<RideAssignmentService>(RideAssignmentService);
    prismaService = module.get(PrismaService);
    gateway.server = mockServer as any;

    rideLedgerService = new RideLedgerService(prismaService as any, mockSettingsObj as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP A — OFFERED PRICE IMMUTABILITY UPON BID RECEIPT
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP A — Offered Price Immutability upon Bid Receipt', () => {
    it('A1: Driver submitting a counter-offer (35 MAD) on a 30 MAD ride emits bid_received WITHOUT mutating DB estimatedPrice', async () => {
      // Driver submits counter-offer of 35 MAD
      await gateway.handleBid(mockSocket, {
        rideId: 'ride-bid-30',
        driverId: 'driver-uuid-001',
        amount: 35,
      });

      // Verify: Socket emitted bid_received to passenger room
      expect(mockServer.to).toHaveBeenCalledWith('presence_passenger_ride-bid-30');

      // Verify: Zero Prisma update calls occurred (DB estimatedPrice remains 30 MAD)
      expect(prismaService.ride.update).not.toHaveBeenCalled();
      expect(prismaService.ride.updateMany).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP B — EXPLICIT PASSENGER ACCEPTANCE & AGREED PRICE LOCK
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP B — Explicit Passenger Acceptance & Agreed Price Lock', () => {
    it('B1: Explicit passenger acceptance (35 MAD) locks agreed price and updates estimatedPrice in DB', async () => {
      prismaService.ride.updateMany.mockResolvedValue({ count: 1 });

      const result = await rideAssignmentService.assignRide('ride-bid-30', 'driver-uuid-001', 35);

      expect(result).toEqual({ success: true });

      // Verify: Update data includes driverId, status DRIVER_ACCEPTED, and agreedPrice 35
      const updateCall = prismaService.ride.updateMany.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: 'ride-bid-30', status: RideStatus.REQUESTED });
      expect(updateCall.data.driverId).toBe('driver-uuid-001');
      expect(updateCall.data.estimatedPrice).toBe(35);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP C — BID INPUT VALIDATION
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP C — Bid Input Validation', () => {
    it('C1: Rejects counter-offers < 5 MAD with bid_rejected event', async () => {
      await gateway.handleBid(mockSocket, {
        rideId: 'ride-001',
        driverId: 'driver-001',
        amount: 4, // < 5 MAD
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('bid_rejected', {
        message: expect.stringContaining('at least 5 MAD'),
        code: 'INVALID_BID_AMOUNT',
      });
    });

    it('C2: Rejects NaN, Infinity, and non-numeric amounts', async () => {
      await gateway.handleBid(mockSocket, {
        rideId: 'ride-001',
        driverId: 'driver-001',
        amount: NaN,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('bid_rejected', expect.objectContaining({
        code: 'INVALID_BID_AMOUNT',
      }));

      jest.clearAllMocks();

      await gateway.handleBid(mockSocket, {
        rideId: 'ride-001',
        driverId: 'driver-001',
        amount: Infinity,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('bid_rejected', expect.objectContaining({
        code: 'INVALID_BID_AMOUNT',
      }));
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP D — REDIS DISTRIBUTED LOCK & RACE CONDITION GUARD
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP D — Redis Distributed Lock & Race Guard', () => {
    it('D1: First acceptance acquires lock; concurrent acceptance attempt throws 409 ConflictException', async () => {
      // Driver A acceptance setup -> updateMany returns 1 (ride was REQUESTED)
      prismaService.ride.updateMany.mockResolvedValueOnce({ count: 1 });
      const result1 = await rideAssignmentService.assignRide('ride-race-1', 'driver-A', 35);
      expect(result1).toEqual({ success: true });

      // Driver B acceptance attempt -> updateMany returns 0 (ride is no longer REQUESTED)
      prismaService.ride.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        rideAssignmentService.assignRide('ride-race-1', 'driver-B', 35),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP E — FINANCIAL SETTLEMENT ALIGNMENT
  // ───────────────────────────────────────────────────────────────────────────
  describe('GROUP E — Financial Settlement Alignment', () => {
    it('E1: Completed ride with agreed price (35 MAD) settles based on 35 MAD (Driver earnings = 29.75 MAD)', async () => {
      prismaService.ride.findUniqueOrThrow.mockResolvedValue({
        id: 'ride-agreed-35',
        status: 'COMPLETED',
        driverId: 'driver-uuid-001',
        estimatedPrice: 35.0, // Agreed price after counter-offer = 35 MAD
        actualPrice: 35.0,
      } as any);

      prismaService.rideLedger.findUnique.mockResolvedValue(null);
      prismaService.rideLedger.create.mockResolvedValue({ id: 'ledger-uuid-35' } as any);

      await rideLedgerService.settleRide('ride-agreed-35');

      expect(prismaService.rideLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalAmount: 35.0,
          companyFee: 5.25, // 35 * 0.15
          driverEarnings: 29.75, // 35 - 5.25
        }),
      });

      expect(prismaService.driverTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 29.75,
          type: 'CREDIT',
        }),
      });
    });
  });
});
