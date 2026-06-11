import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Helper for Geo operations (Central logic for Dispatch)
  async updateLocation(key: string, lng: number, lat: number, id: string): Promise<void> {
    await this.client.geoadd(key, lng, lat, id);
  }

  async findNearby(key: string, lng: number, lat: number, radiusKm: number): Promise<string[]> {
    const results = await this.client.georadius(key, lng, lat, radiusKm, 'km');
    return results as string[];
  }
}
