import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';

@Injectable()
export class LocationIngestionService {
  private readonly logger = new Logger(LocationIngestionService.name);
  private readonly THROTTLE_TTL = 3; // Seconds between updates per driver
  private readonly LAST_UPDATE_PREFIX = 'location:last:';

  constructor(private readonly redis: RedisService) {}

  /**
   * INGEST: Filter and process high-frequency location data.
   */
  async ingest(driverId: string, lat: number, lng: number): Promise<boolean> {
    const redisClient = this.redis.getClient();
    const throttleKey = `${this.LAST_UPDATE_PREFIX}${driverId}`;

    // 1. THROTTLE CHECK (Backpressure control)
    const isThrottled = await redisClient.get(throttleKey);
    if (isThrottled) {
      // Too fast - silent drop to save compute
      return false;
    }

    // 2. VALIDATION (Optional: Check for teleportation jumps here)
    // For now, we assume simple validity.

    // 3. SET THROTTLE LOCK (Fibonacci or fixed?) - Staying fixed for simplicity.
    await redisClient.set(throttleKey, '1', 'EX', this.THROTTLE_TTL);

    // 4. WRITE TO REAL-TIME RADAR (Geospatial)
    // We update Redis GEO immediately after passing the throttle
    await redisClient.geoadd('drivers:location', lng, lat, driverId);

    this.logger.log(`[Ingestion] Accepted update for Driver: ${driverId} @ [${lat}, ${lng}]`);
    
    return true;
  }
}
