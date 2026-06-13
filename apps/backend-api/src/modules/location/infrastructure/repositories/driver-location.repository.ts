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
  
  constructor(private readonly redis: RedisService) {}

  /**
   * Encapsulates Redis key schema for driver locations.
   * Part of the v3 Architecture Contract.
   */
  async get(driverId: string): Promise<DriverLocation | null> {
    const raw = await this.redis.getClient().hgetall(`driver:${driverId}:location`);
    
    if (!raw || !raw.lat || !raw.lng) {
      return null;
    }

    return {
      lat: Number(raw.lat),
      lng: Number(raw.lng),
      updatedAt: raw.updatedAt,
    };
  }

  async save(driverId: string, location: DriverLocation): Promise<void> {
    await this.redis.getClient().hset(`driver:${driverId}:location`, {
      lat: location.lat,
      lng: location.lng,
      updatedAt: location.updatedAt,
    });
  }
}
