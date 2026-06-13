import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface LocationPingDto {
  lat: number;
  lng: number;
}

export interface DriverLocationEvent {
  driverId: string;
  rideId?: string;
  lat: number;
  lng: number;
  state: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
  source: 'PING' | 'STATE_CHANGE';
  timestamp: number;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly AVAILABLE_KEY = 'geo:drivers:available';
  private readonly ON_TRIP_KEY = 'geo:drivers:on_trip';
  private readonly LOCATION_TTL = 30;

  constructor(
    private readonly redis: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Hardened Ingress (v1.3)
   * Structured payload for intelligent downstream filtering.
   */
  async updateDriverLocation(driverId: string, data: LocationPingDto): Promise<void> {
    const redisClient = this.redis.getClient();
    const { lat, lng } = data;

    // 1. BACKPRESSURE: 2-second Throttle Gate (Redis-based)
    const throttleKey = `driver:${driverId}:throttle:ping`;
    const isThrottled = await redisClient.set(throttleKey, '1', 'PX', 2000, 'NX');
    if (!isThrottled) return;

    const driverState = (await redisClient.get(`driver:${driverId}:state`)) || 'OFFLINE';
    const activeRideId = await redisClient.get(`driver:${driverId}:active_ride`); 

    if (driverState === 'OFFLINE') return;

    const pipeline = redisClient.pipeline();
    pipeline.hset(`driver:${driverId}:location`, { lat, lng, updatedAt: new Date().toISOString() });
    pipeline.expire(`driver:${driverId}:location`, this.LOCATION_TTL);
    pipeline.zrem(this.AVAILABLE_KEY, driverId);
    pipeline.zrem(this.ON_TRIP_KEY, driverId);

    if (driverState === 'AVAILABLE') {
      pipeline.geoadd(this.AVAILABLE_KEY, lng, lat, driverId);
    } else if (driverState === 'ON_TRIP') {
      pipeline.geoadd(this.ON_TRIP_KEY, lng, lat, driverId);
    }

    // 2. DURABLE EVENT STREAM: Redis XADD
    pipeline.xadd('driver:location:stream', 'MAXLEN', '~', 100000, '*', 
      'driverId', driverId,
      'rideId', activeRideId || '',
      'lat', String(lat),
      'lng', String(lng),
      'timestamp', String(Date.now())
    );

    await pipeline.exec();

    // EMIT STRUCTURED EVENT
    const event: DriverLocationEvent = {
      driverId,
      rideId: activeRideId || undefined,
      lat,
      lng,
      state: driverState as any,
      source: 'PING',
      timestamp: Date.now(),
    };

    this.eventEmitter.emit('driver.location.updated', event);
  }

  async syncDriverState(driverId: string, state: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE', rideId?: string): Promise<void> {
    await this.redis.getClient().set(`driver:${driverId}:state`, state);
    if (rideId) {
      await this.redis.getClient().set(`driver:${driverId}:active_ride`, rideId);
    } else {
      await this.redis.getClient().del(`driver:${driverId}:active_ride`);
    }
  }

  async getDriverLocation(driverId: string): Promise<{ lat: number, lng: number, updatedAt: string } | null> {
    const data = await this.redis.getClient().hgetall(`driver:${driverId}:location`);
    if (!data || Object.keys(data).length === 0) return null;
    return {
      lat: Number(data.lat),
      lng: Number(data.lng),
      updatedAt: data.updatedAt,
    };
  }
}
