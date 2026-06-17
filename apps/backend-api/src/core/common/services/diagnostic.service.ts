import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class DiagnosticService {
  private readonly logger = new Logger(DiagnosticService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async captureBaseline() {
    this.logger.warn('--- [PRE-WAR SNAPSHOT START] ---');

    const redisStart = Date.now();
    await this.redis.getClient().ping();
    const redisLatency = Date.now() - redisStart;

    const dbStart = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    const outboxBacklog = await (this.prisma.outboxEvent as any).count({ where: { status: 'PENDING' } });

    const report = {
      timestamp: new Date().toISOString(),
      infra: {
        redisLatencyMs: redisLatency,
        dbLatencyMs: dbLatency,
      },
      resources: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        cpuUser: cpu.user,
        cpuSystem: cpu.system,
      },
      backlogs: {
        outboxPending: outboxBacklog,
      }
    };

    this.logger.log(`[Baseline] System Metrics: ${JSON.stringify(report, null, 2)}`);
    this.logger.warn('--- [PRE-WAR SNAPSHOT COMPLETE - READY FOR WAR] ---');
    
    return report;
  }
}
