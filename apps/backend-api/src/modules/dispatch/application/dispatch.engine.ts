import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { DispatchCandidateFoundEvent } from '../domain/events/dispatch-events';
import { PrismaService } from '../../../core/prisma/prisma.service';

export type ClaimStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface DispatchClaim {
  id: string;
  rideId: string;
  driverId: string;
  status: ClaimStatus;
  createdAt: number;
  expiresAt: number;
}

@Injectable()
export class DispatchEngine {
  private readonly logger = new Logger(DispatchEngine.name);
  private readonly DRIVERS_GEO_KEY = 'geo:drivers:available';
  private readonly CLAIM_TTL = 25; // Seconds

  constructor(
    private readonly redis: RedisService,
    private readonly eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Calculates the start of the current week (Monday 00:00)
   */
  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * Orchestrates the search, scoring, prioritization, and claim of candidates.
   */
  async dispatchRide(rideId: string, lat: number, lng: number): Promise<void> {
    this.logger.log(`Dispatching ride ${rideId}`);

    // 1. Fetch nearby available drivers from Redis GEORADIUS with distance
    const rawResults = await this.redis.getClient().georadius(
      this.DRIVERS_GEO_KEY,
      lng,
      lat,
      5,
      'km',
      'WITHDIST',
      'ASC'
    ) as any;

    if (!rawResults || rawResults.length === 0) {
      this.logger.warn(`No nearby drivers found for ride ${rideId}`);
      return;
    }

    const candidates: { id: string; distance: number }[] = [];
    for (const item of rawResults) {
      if (Array.isArray(item)) {
        candidates.push({ id: item[0], distance: parseFloat(item[1]) });
      } else if (typeof item === 'string') {
        candidates.push({ id: item, distance: 0 });
      }
    }

    const driverIds = candidates.map(c => c.id);

    // 2. Query Driver details (rating, last completed ride completedAt timestamp) from DB
    const dbDrivers = await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      include: {
        rides: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    // 3. Query weekly ride count to evaluate status priority levels
    const startOfWeek = this.getStartOfWeek();
    const weeklyRidesCount = await this.prisma.ride.groupBy({
      by: ['driverId'],
      where: {
        driverId: { in: driverIds },
        status: 'COMPLETED',
        completedAt: { gte: startOfWeek },
      },
      _count: { id: true },
    });

    const weeklyCountsMap: Record<string, number> = {};
    for (const count of weeklyRidesCount) {
      if (count.driverId) {
        weeklyCountsMap[count.driverId] = count._count.id;
      }
    }

    // 4. Map, score, and rank each candidate
    const scoredCandidates = candidates.map(cand => {
      const dbDriver = dbDrivers.find(d => d.id === cand.id);
      const weeklyCount = weeklyCountsMap[cand.id] || 0;

      const rating = dbDriver ? dbDriver.rating : 5.0;
      const lastRideCompletedAt = dbDriver?.rides?.[0]?.completedAt || new Date(0);

      // Level priorities:
      // 1. Platinum (weekly >= 30)
      // 2. Gold (weekly >= 15)
      // 3. Silver (weekly >= 5)
      // 4. New Drivers (weekly < 5)
      let levelPriority = 4;
      if (weeklyCount >= 30) levelPriority = 1;
      else if (weeklyCount >= 15) levelPriority = 2;
      else if (weeklyCount >= 5) levelPriority = 3;

      const idleTimeMs = Date.now() - lastRideCompletedAt.getTime();

      return {
        id: cand.id,
        distance: cand.distance,
        rating,
        levelPriority,
        idleTimeMs,
      };
    });

    // 5. Sort candidates: Level (ASC), Distance (ASC), Rating (DESC), IdleTimeMs (ASC)
    scoredCandidates.sort((a, b) => {
      if (a.levelPriority !== b.levelPriority) {
        return a.levelPriority - b.levelPriority;
      }
      if (Math.abs(a.distance - b.distance) > 0.01) {
        return a.distance - b.distance;
      }
      if (Math.abs(a.rating - b.rating) > 0.01) {
        return b.rating - a.rating;
      }
      return a.idleTimeMs - b.idleTimeMs;
    });

    // 6. Try to create dispatch claim for the top matched candidate
    for (const matched of scoredCandidates) {
      const claim = await this.createClaim(rideId, matched.id);
      if (claim) {
        this.logger.log(`Dispatch Candidate selected: Driver ${matched.id} (LevelPriority: ${matched.levelPriority}, Dist: ${matched.distance}km)`);
        await this.eventBus.publish(new DispatchCandidateFoundEvent(rideId, matched.id));
        return;
      }
    }
  }

  /**
   * Atomic Claim Creation (Single Source of Truth)
   */
  async createClaim(rideId: string, driverId: string): Promise<DispatchClaim | null> {
    const redisClient = this.redis.getClient();
    const now = Date.now();
    const claim: DispatchClaim = {
      id: crypto.randomUUID(),
      rideId,
      driverId,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + (this.CLAIM_TTL * 1000),
    };

    const claimKey = `dispatch:claim:${rideId}`;
    const driverIdxKey = `driver:claim:${driverId}`;

    const multi = redisClient.multi();
    multi.set(claimKey, JSON.stringify(claim), 'EX', this.CLAIM_TTL, 'NX');
    multi.set(driverIdxKey, rideId, 'EX', this.CLAIM_TTL, 'NX');

    const results = await multi.exec();
    if (!results) return null;

    if (results[0][1] === 'OK' && results[1][1] === 'OK') {
      return claim;
    }

    // Rollback partial success
    if (results[0][1] === 'OK') await redisClient.del(claimKey);
    if (results[1][1] === 'OK') await redisClient.del(driverIdxKey);

    return null;
  }

  async validateAndConsume(rideId: string, driverId: string): Promise<boolean> {
    const luaScript = `
      local claim = redis.call('get', KEYS[1])
      if not claim then return 0 end
      local decoded = cjson.decode(claim)
      if decoded.driverId == ARGV[1] and decoded.status == 'PENDING' then
        redis.call('del', KEYS[1])
        redis.call('del', KEYS[2])
        return 1
      else return 0 end
    `;
    const result = await this.redis.getClient().eval(luaScript, 2, `dispatch:claim:${rideId}`, `driver:claim:${driverId}`, driverId);
    return result === 1;
  }

  async rejectClaim(rideId: string, driverId: string): Promise<void> {
    await this.redis.getClient().del(`dispatch:claim:${rideId}`);
    await this.redis.getClient().del(`driver:claim:${driverId}`);
  }
}
