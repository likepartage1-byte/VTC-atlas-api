import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { PresenceService } from '../../realtime/infrastructure/services/presence.service';

export interface DriverCandidate {
  driverId: string;
  distance: number;
  lastSeen: string;
}

@Injectable()
export class LocationDiscoveryService {
  private readonly logger = new Logger(LocationDiscoveryService.name);
  private readonly DEFAULT_RADIUS_KM = 5;

  constructor(
    private readonly redis: RedisService,
    private readonly presence: PresenceService
  ) {}

  /**
   * DISCOVER: Find, filter, and rank the best drivers for a given location.
   */
  async findNearbyDrivers(
    lat: number,
    lng: number,
    radiusKm: number = this.DEFAULT_RADIUS_KM
  ): Promise<DriverCandidate[]> {
    const redisClient = this.redis.getClient();

    // 1. GEO SEARCH (Physical proximity)
    // Returns: [[driverId, distance], ...]
    const rawResults = await redisClient.georadius(
      'drivers:location',
      lng,
      lat,
      radiusKm,
      'km',
      'WITHDIST',
      'ASC'
    );

    if (!rawResults || rawResults.length === 0) return [];

    const candidates: DriverCandidate[] = [];

    // 2. INTELLIGENT FILTERING LAYER
    for (const [driverId, distance] of rawResults as any[]) {
      // Check Real-time Presence (Is he still connected?)
      const socketId = await this.presence.getSocketId(driverId);
      
      if (socketId) {
        candidates.push({
          driverId,
          distance: parseFloat(distance),
          lastSeen: new Date().toISOString(), // In production, get actual timestamp from presence
        });
      }
      
      // Limit results for performance
      if (candidates.length >= 10) break;
    }

    this.logger.log(`[Discovery] Found ${candidates.length} qualified drivers near [${lat}, ${lng}]`);
    
    return candidates;
  }
}
