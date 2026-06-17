import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;
      return this.getStatus(key, true, { latencyMs });
    } catch (error) {
      const latencyMs = Date.now() - start;
      throw new HealthCheckError(
        'Prisma check failed',
        this.getStatus(key, false, { message: error.message, latencyMs }),
      );
    }
  }
}
