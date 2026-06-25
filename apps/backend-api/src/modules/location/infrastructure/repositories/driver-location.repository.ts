import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

export interface DriverLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

@Injectable()
export class DriverLocationRepository {
  private readonly logger = new Logger(DriverLocationRepository.name);
  private readonly GEO_KEY = 'drivers:geo:locations';
  
  constructor(private readonly redis: RedisService) {}

  /**
   * Saves location in both Hash (for precise details) and GeoSet (for proximity searching)
   */
  async save(driverId: string, location: DriverLocation): Promise<void> {
    const client = this.redis.getClient();
    
    // 1. Precise data in Hash
    await client.hset(`driver:${driverId}:location`, {
      lat: location.lat,
      lng: location.lng,
      updatedAt: location.updatedAt,
    });

    // 2. Proximity index for Geofencing (P3 Implementation)
    // NOTE: Redis coordinates are (longitude, latitude)
    await client.geoadd(this.GEO_KEY, location.lng, location.lat, driverId);
    
    // Optional: expire geo entry after X minutes if no update
    // await client.expire(this.GEO_KEY, 300);
  }

  async get(driverId: string): Promise<DriverLocation | null> {
    const raw = await this.redis.getClient().hgetall(`driver:${driverId}:location`);
    if (!raw || !raw.lat || !raw.lng) return null;

    return {
      lat: Number(raw.lat),
      lng: Number(raw.lng),
      updatedAt: raw.updatedAt,
    };
  }

  /**
   * Find nearby drivers within a radius (in KM)
   * Uses O(log N) Redis GEOSEARCH
   */
  async findNearby(lng: number, lat: number, radiusKm: number): Promise<string[]> {
    return (await this.redis.getClient().georadius(
      this.GEO_KEY, 
      lng, 
      lat, 
      radiusKm, 
      'km'
    )) as string[];
  }

  async remove(driverId: string): Promise<void> {
    await this.redis.getClient().zrem(this.GEO_KEY, driverId);
    await this.redis.getClient().del(`driver:${driverId}:location`);
  }
}
