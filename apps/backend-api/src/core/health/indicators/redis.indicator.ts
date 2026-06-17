import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const start = Date.now();
    try {
      await this.redisService.getClient().ping();
      const latencyMs = Date.now() - start;
      return this.getStatus(key, true, { latencyMs });
    } catch (error) {
      const latencyMs = Date.now() - start;
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { message: error.message, latencyMs }),
      );
    }
  }
}
