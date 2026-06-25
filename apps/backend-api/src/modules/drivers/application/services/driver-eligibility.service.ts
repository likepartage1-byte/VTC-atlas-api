import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { DriverVerificationStatus } from '@prisma/client';

@Injectable()
export class DriverEligibilityService {
  private readonly logger = new Logger(DriverEligibilityService.name);
  private readonly CACHE_PREFIX = 'driver:eligibility:';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Centralized check for ride eligibility.
   * Checks KYC status, account standing, and future constraints.
   */
  async canReceiveRides(driverId: string): Promise<boolean> {
    const cacheKey = `${this.CACHE_PREFIX}${driverId}`;
    const redisClient = this.redis.getClient();

    // 1. Try Cache
    const cached = await redisClient.get(cacheKey);
    if (cached !== null) {
      return cached === '1';
    }

    // 2. DB Check
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: { verification: true },
    });

    if (!driver) return false;

    // RULE 1: Must have an APPROVED verification profile
    const isKycApproved = driver.verification?.status === DriverVerificationStatus.APPROVED;
    
    // RULE 2: Driver must NOT be suspended (placeholder for future field)
    const isNotSuspended = true; 

    const isEligible = isKycApproved && isNotSuspended;

    // 3. Store in Cache
    await redisClient.set(cacheKey, isEligible ? '1' : '0', 'EX', this.CACHE_TTL);

    if (!isEligible) {
      this.logger.debug(`Driver [${driverId}] is NOT eligible for rides. KYC: ${driver.verification?.status}`);
    }

    return isEligible;
  }

  /**
   * Invalidates the eligibility cache for a driver.
   * Should be called when KYC status changes or admin suspends the driver.
   */
  async invalidateCache(driverId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${driverId}`;
    await this.redis.getClient().del(cacheKey);
  }
}
