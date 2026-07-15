import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { DispatchCandidateFoundEvent } from '../domain/events/dispatch-events';
import { PrismaService } from '../../../core/prisma/prisma.service';
import * as crypto from 'crypto';

export type ClaimStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface DispatchClaim {
  id: string;
  rideId: string;
  driverId?: string;            // For legacy single-driver claims
  allowedDriverIds?: string[]; // For broadcast multi-driver claims
  status: ClaimStatus;
  createdAt: number;
  expiresAt: number;
  phase?: 1 | 2;
}

@Injectable()
export class DispatchEngine {
  private readonly logger = new Logger(DispatchEngine.name);
  private readonly DRIVERS_GEO_KEY = 'geo:drivers:available';
  private readonly CLAIM_TTL = 25; // seconds

  constructor(
    private readonly redis: RedisService,
    private readonly eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private async getSystemSetting(key: string, defaultValue: any): Promise<any> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
      if (setting && setting.value !== undefined && setting.value !== null) {
        return setting.value;
      }
    } catch (_) { /* graceful fallback */ }
    return defaultValue;
  }

  // ─── Two-Phase Smart Tier Dispatch ─────────────────────────────────────────

  /**
   * Phase 1 (Premier Window): Exclusively broadcast to Premier drivers (≥30 total rides)
   *                           for a configurable number of seconds.
   * Phase 2 (Open Broadcast): If unclaimed, broadcast simultaneously to Gold + Silver drivers.
   */
  async dispatchRide(rideId: string, lat: number, lng: number): Promise<void> {
    this.logger.log(`[SmartDispatch] Two-phase dispatch started for ride ${rideId}`);

    const searchRadiusKm   = Number(await this.getSystemSetting('search_radius_km', 5));
    const premierWindowSec = Number(await this.getSystemSetting('premier_priority_duration', 3));

    // 1. Fetch nearby available drivers from Redis
    const rawResults = await this.redis.getClient().georadius(
      this.DRIVERS_GEO_KEY,
      lng, lat,
      searchRadiusKm,
      'km',
      'WITHDIST', 'ASC',
    ) as any;

    if (!rawResults || rawResults.length === 0) {
      this.logger.warn(`[SmartDispatch] No nearby drivers found for ride ${rideId}`);
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

    // 2. Query total completed rides per driver (determines tier)
    const totalRidesGroups = await this.prisma.ride.groupBy({
      by: ['driverId'],
      where: { driverId: { in: driverIds }, status: 'COMPLETED' },
      _count: { id: true },
    });

    const totalCountsMap: Record<string, number> = {};
    for (const g of totalRidesGroups) {
      if (g.driverId) totalCountsMap[g.driverId] = g._count.id;
    }

    // 3. Classify drivers by tier:
    //    Premier : ≥ 30 total completed rides
    //    Gold    :  3–29 total completed rides
    //    Silver  :  0–2  total completed rides
    const premierIds: string[]    = [];
    const goldSilverIds: string[] = [];

    for (const cand of candidates) {
      const total = totalCountsMap[cand.id] || 0;
      if (total >= 30) {
        premierIds.push(cand.id);
      } else {
        goldSilverIds.push(cand.id);
      }
    }

    this.logger.log(
      `[SmartDispatch] Ride ${rideId} — Premier: ${premierIds.length}, Gold/Silver: ${goldSilverIds.length}`,
    );

    // ── PHASE 1: Premier-exclusive window ──────────────────────────────────
    if (premierIds.length > 0) {
      const claimed = await this.createBroadcastClaim(rideId, premierIds, 1);
      if (claimed) {
        // Broadcast offer to all Premier drivers simultaneously
        for (const driverId of premierIds) {
          await this.eventBus.publish(new DispatchCandidateFoundEvent(rideId, driverId));
        }
        this.logger.log(
          `[SmartDispatch] Phase 1 — Offer sent to ${premierIds.length} Premier driver(s). Waiting ${premierWindowSec}s…`,
        );

        // Wait the premier priority window then check if claim was consumed
        await new Promise(resolve => setTimeout(resolve, premierWindowSec * 1000));

        const remaining = await this.redis.getClient().get(`dispatch:claim:${rideId}`);
        if (!remaining) {
          this.logger.log(`[SmartDispatch] Ride ${rideId} claimed during Phase 1. Done.`);
          return;
        }

        // Expire Phase 1 claim, fall through to Phase 2
        await this.redis.getClient().del(`dispatch:claim:${rideId}`);
        this.logger.log(`[SmartDispatch] Phase 1 expired unclaimed. Launching Phase 2 broadcast.`);
      }
    }

    // ── PHASE 2: Gold + Silver simultaneous broadcast ──────────────────────
    const phase2Ids = goldSilverIds.length > 0 ? goldSilverIds : premierIds;

    if (phase2Ids.length === 0) {
      this.logger.warn(`[SmartDispatch] No eligible drivers for Phase 2 on ride ${rideId}`);
      return;
    }

    const phase2Claimed = await this.createBroadcastClaim(rideId, phase2Ids, 2);
    if (phase2Claimed) {
      for (const driverId of phase2Ids) {
        await this.eventBus.publish(new DispatchCandidateFoundEvent(rideId, driverId));
      }
      this.logger.log(
        `[SmartDispatch] Phase 2 — Offer sent to ${phase2Ids.length} Gold/Silver driver(s).`,
      );
    } else {
      this.logger.warn(`[SmartDispatch] Phase 2 claim failed for ride ${rideId} — possibly already claimed.`);
    }
  }

  // ─── Claim Management ──────────────────────────────────────────────────────

  /**
   * Creates a broadcast claim allowing any driver in allowedDriverIds to race-accept.
   * Only the first atomic validateAndConsume wins.
   */
  async createBroadcastClaim(
    rideId: string,
    allowedDriverIds: string[],
    phase: 1 | 2 = 1,
  ): Promise<DispatchClaim | null> {
    const now = Date.now();
    const claim: DispatchClaim = {
      id: crypto.randomUUID(),
      rideId,
      allowedDriverIds,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + (this.CLAIM_TTL * 1000),
      phase,
    };

    const claimKey = `dispatch:claim:${rideId}`;
    const result = await this.redis.getClient().set(
      claimKey, JSON.stringify(claim), 'EX', this.CLAIM_TTL, 'NX',
    );

    return result === 'OK' ? claim : null;
  }

  /**
   * Legacy single-driver claim — delegates to createBroadcastClaim.
   */
  async createClaim(rideId: string, driverId: string): Promise<DispatchClaim | null> {
    return this.createBroadcastClaim(rideId, [driverId], 1);
  }

  /**
   * Atomic Lua-based claim validation — supports both single and multi-driver claims.
   * First driver to call this wins; all others get 0.
   */
  async validateAndConsume(rideId: string, driverId: string): Promise<boolean> {
    const luaScript = `
      local claim = redis.call('get', KEYS[1])
      if not claim then return 0 end
      local decoded = cjson.decode(claim)
      if decoded.status ~= 'PENDING' then return 0 end

      local is_allowed = false

      if decoded.driverId == ARGV[1] then
        is_allowed = true
      end

      if not is_allowed and decoded.allowedDriverIds then
        for _, id in ipairs(decoded.allowedDriverIds) do
          if id == ARGV[1] then
            is_allowed = true
            break
          end
        end
      end

      if is_allowed then
        redis.call('del', KEYS[1])
        redis.call('del', KEYS[2])
        return 1
      end
      return 0
    `;

    const result = await this.redis.getClient().eval(
      luaScript, 2,
      `dispatch:claim:${rideId}`,
      `driver:claim:${driverId}`,
      driverId,
    );
    return result === 1;
  }

  async rejectClaim(rideId: string, driverId: string): Promise<void> {
    await this.redis.getClient().del(`dispatch:claim:${rideId}`);
    await this.redis.getClient().del(`driver:claim:${driverId}`);
  }
}
