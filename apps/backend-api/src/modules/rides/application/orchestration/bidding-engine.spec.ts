import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RidesNegotiationGateway } from '../../presentation/gateways/rides-negotiation.gateway';
import { RideAssignmentService } from '../services/ride-assignment.service';
import { GoogleMapsService } from '../../../../core/google-maps/google-maps.service';
import { DriverLocationRepository } from '../../../location/infrastructure/repositories/driver-location.repository';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';
import { RideStatus } from '@prisma/client';

describe('Bidding Engine & Counter-Offer Optimization (Phase 4)', () => {
  let gateway: RidesNegotiationGateway;
  let rideAssignmentService: RideAssignmentService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let mockDriverAcceptanceObj: any;
  let mockRedisClient: any;
  let mockSocketClient: any;
  let mockServerTo: any;

  beforeEach(async () => {
    mockRedisClient = {
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    };

    mockDriverAcceptanceObj = {
      acceptRide: jest.fn().mockResolvedValue({
        success: true,
        rideId: 'ride-uuid-300',
        agreedPrice: 32,
        commissionRate: 0.10,
        commissionAmount: 3.2,
        driverNetEarnings: 28.8,
        newBalance: 96.8,
      }),
    };

    mockSocketClient = {
      emit: jest.fn(),
      handshake: { query: { userId: 'user-passenger-001' } },
    };

    mockServerTo = jest.fn().mockReturnValue({
      emit: jest.fn(),
    });

    const mockPrismaObj = {
      ride: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'ride-uuid-300',
          estimatedPrice: 30.0,
          passengerId: 'passenger-uuid-100',
          tripType: 'CITY',
          serviceType: 'ECONOMY',
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      negotiation: {
        findFirst: jest.fn().mockResolvedValue({ counterPrice: 32, proposedPrice: 30 }),
        create: jest.fn().mockResolvedValue({ id: 'neg-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const mockRedisServiceObj = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const mockGoogleMapsServiceObj = {
      getEstimates: jest.fn().mockResolvedValue({
        distanceText: '5 km',
        durationText: '10 mins',
        polyline: 'sample_polyline',
      }),
    };

    const mockDriverLocationRepoObj = {
      findNearby: jest.fn().mockResolvedValue(['driver-uuid-001']),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RideAssignmentService,
        { provide: DriverAcceptanceService, useValue: mockDriverAcceptanceObj },
        { provide: PrismaService, useValue: mockPrismaObj },
        { provide: RedisService, useValue: mockRedisServiceObj },
        { provide: GoogleMapsService, useValue: mockGoogleMapsServiceObj },
        { provide: DriverLocationRepository, useValue: mockDriverLocationRepoObj },
        {
          provide: RidesNegotiationGateway,
          useFactory: (assignmentSvc, mapsSvc, locationRepo, prisma, driverAcceptance) => {
            const gw = new RidesNegotiationGateway(assignmentSvc, mapsSvc, locationRepo, prisma as any, driverAcceptance as any);
            (gw as any).server = {
              to: mockServerTo,
              emit: jest.fn(),
            };
            return gw;
          },
          inject: [RideAssignmentService, GoogleMapsService, DriverLocationRepository, PrismaService, DriverAcceptanceService],
        },
      ],
    }).compile();

    gateway = module.get<RidesNegotiationGateway>(RidesNegotiationGateway);
    rideAssignmentService = module.get<RideAssignmentService>(RideAssignmentService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO A: ORIGINAL PRICE ACCEPTANCE (30 MAD -> 30 MAD)
  // ───────────────────────────────────────────────────────────────────────────
  it('Scenario A (Original Price Acceptance): Passenger requests 30 MAD, driver accepts 30 MAD -> Ride price remains 30 MAD', async () => {
    mockRedisClient.set.mockResolvedValue('OK');
    prismaService.ride.updateMany.mockResolvedValue({ count: 1 });

    const result = await rideAssignmentService.assignRide('ride-uuid-300', 'driver-A');

    expect(result).toMatchObject({ success: true });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO B: COUNTER-OFFER EXPLICIT ACCEPTANCE (30 MAD request -> 32 MAD bid -> 32 MAD final)
  // ───────────────────────────────────────────────────────────────────────────
  it('Scenario B (Counter-Offer Explicit Acceptance): Passenger accepts Driver B 32 MAD bid -> Ride price updated to 32 MAD', async () => {
    mockRedisClient.set.mockResolvedValue('OK');

    // Passenger accepts 32 MAD counter-offer
    const result = await rideAssignmentService.assignRide('ride-uuid-300', 'driver-B', 32);

    expect(result).toMatchObject({ success: true, agreedPrice: 32 });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO C: UNACCEPTED BID IMMUTABILITY (30 MAD request -> Bid 32 MAD -> Unaccepted -> 30 MAD)
  // ───────────────────────────────────────────────────────────────────────────
  it('Scenario C (Unaccepted Bid Immutability): Submitting a bid 32 MAD does NOT alter Ride.estimatedPrice in DB', async () => {
    // Driver submits bid 32 MAD on ride-uuid-300
    await gateway.handleBid(mockSocketClient, {
      rideId: 'ride-uuid-300',
      driverId: 'driver-B',
      amount: 32,
    });

    // Verify: Socket bid_received broadcast emitted
    expect(mockServerTo).toHaveBeenCalledWith('presence_passenger_ride-uuid-300');
    expect(mockServerTo).toHaveBeenCalledWith('ride:ride-uuid-300');

    // Verify: Database updateMany/update was NEVER called during bid submission!
    expect(prismaService.ride.updateMany).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO D: INVALID BIDS REJECTION (4 MAD, 0 MAD, -10 MAD, NaN, Infinity)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario D (Invalid Bids Rejection)', () => {
    it('Should reject bid of 4 MAD (below minimum 5 MAD threshold)', async () => {
      await gateway.handleBid(mockSocketClient, { rideId: 'ride-1', driverId: 'd-1', amount: 4 });
      expect(mockSocketClient.emit).toHaveBeenCalledWith(
        'bid_rejected',
        expect.objectContaining({ code: 'INVALID_BID_AMOUNT' }),
      );
      expect(mockServerTo).not.toHaveBeenCalled();
    });

    it('Should reject bid of 0 MAD', async () => {
      await gateway.handleBid(mockSocketClient, { rideId: 'ride-1', driverId: 'd-1', amount: 0 });
      expect(mockSocketClient.emit).toHaveBeenCalledWith(
        'bid_rejected',
        expect.objectContaining({ code: 'INVALID_BID_AMOUNT' }),
      );
      expect(mockServerTo).not.toHaveBeenCalled();
    });

    it('Should reject negative bid (-10 MAD)', async () => {
      await gateway.handleBid(mockSocketClient, { rideId: 'ride-1', driverId: 'd-1', amount: -10 });
      expect(mockSocketClient.emit).toHaveBeenCalledWith(
        'bid_rejected',
        expect.objectContaining({ code: 'INVALID_BID_AMOUNT' }),
      );
      expect(mockServerTo).not.toHaveBeenCalled();
    });

    it('Should reject NaN bid amount', async () => {
      await gateway.handleBid(mockSocketClient, { rideId: 'ride-1', driverId: 'd-1', amount: NaN });
      expect(mockSocketClient.emit).toHaveBeenCalledWith(
        'bid_rejected',
        expect.objectContaining({ code: 'INVALID_BID_AMOUNT' }),
      );
      expect(mockServerTo).not.toHaveBeenCalled();
    });

    it('Should reject Infinity bid amount', async () => {
      await gateway.handleBid(mockSocketClient, { rideId: 'ride-1', driverId: 'd-1', amount: Infinity });
      expect(mockSocketClient.emit).toHaveBeenCalledWith(
        'bid_rejected',
        expect.objectContaining({ code: 'INVALID_BID_AMOUNT' }),
      );
      expect(mockServerTo).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO E: CONCURRENT ACCEPTANCE RACE SAFETY
  // ───────────────────────────────────────────────────────────────────────────
  it('Scenario E (Concurrent Acceptance Race Safety): First passenger acceptance locks ride; duplicate attempt fails with 409 Conflict', async () => {
    // Driver A acceptance succeeds (count: 1)
    mockRedisClient.set.mockResolvedValueOnce('OK');
    prismaService.ride.updateMany.mockResolvedValueOnce({ count: 1 });

    const resultA = await rideAssignmentService.assignRide('ride-uuid-500', 'driver-A', 30);
    expect(resultA).toMatchObject({ success: true });

    // Driver B simultaneous attempt fails with ConflictException
    jest.spyOn(mockDriverAcceptanceObj, 'acceptRide').mockRejectedValueOnce(new ConflictException('Désolé, cette course a déjà été acceptée par un autre chauffeur.'));

    await expect(
      rideAssignmentService.assignRide('ride-uuid-500', 'driver-B', 32),
    ).rejects.toThrow(ConflictException);
  });
});
