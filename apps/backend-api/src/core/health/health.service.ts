import { Injectable } from '@nestjs/common';
import { 
  HealthCheckService, 
  HealthCheck, 
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator, RedisHealthIndicator } from './indicators';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private redisIndicator: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.prismaIndicator.isHealthy('database'),
      () => this.redisIndicator.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),   // 300MB
    ]);
  }
}
