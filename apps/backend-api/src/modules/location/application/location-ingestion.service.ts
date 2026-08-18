import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class LocationIngestionService {
  private readonly logger = new Logger(LocationIngestionService.name);
  private readonly THROTTLE_TTL = 2; // Seconds between updates per driver
  private readonly LAST_UPDATE_PREFIX = 'location:last:';

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * INGEST: Filter and process high-frequency location data.
   */
  async ingest(userId: string, rawLat: any, rawLng: any): Promise<boolean> {
    const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat);
    const lng = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng);

    if (isNaN(lat) || isNaN(lng)) return false;

    const redisClient = this.redis.getClient();
    const throttleKey = `${this.LAST_UPDATE_PREFIX}${userId}`;

    // 1. THROTTLE CHECK (Backpressure control)
    const isThrottled = await redisClient.get(throttleKey);
    if (isThrottled) {
      return false;
    }

    // 2. SET THROTTLE LOCK
    await redisClient.set(throttleKey, '1', 'EX', this.THROTTLE_TTL);

    // 3. Resolve driver.id from userId if possible
    let driverId = userId;
    try {
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (driver) driverId = driver.id;
    } catch (_) {}

    // 4. WRITE TO REAL-TIME RADAR (Geospatial)
    // We update Redis GEO for both userId and driverId to guarantee candidate lookup
    await redisClient.geoadd('drivers:location', lng, lat, userId);
    await redisClient.geoadd('geo:drivers:available', lng, lat, userId);
    if (driverId !== userId) {
      await redisClient.geoadd('drivers:location', lng, lat, driverId);
      await redisClient.geoadd('geo:drivers:available', lng, lat, driverId);
    }

    this.logger.log(`[Ingestion] Accepted update for Driver: ${driverId} (User: ${userId}) @ [${lat}, ${lng}]`);

    return true;
  }
}

