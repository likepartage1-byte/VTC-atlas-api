import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('domain-events') private readonly eventQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async processOutbox() {
    if (this.isProcessing) return;
    
    // 1. CLUSTER LOCK: Ensure only one node processes the outbox at a time
    const lockKey = 'outbox:process:lock';
    const locked = await this.redis.acquireLock(lockKey, 'outbox-processor', 5000);
    if (!locked) return;

    this.isProcessing = true;

    try {
      // 2. Fetch & Lock PENDING events
      const pendingEvents = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 100,
        orderBy: { sequence: 'asc' },
      });

      if (pendingEvents.length === 0) return;

      this.logger.debug(`Batch Lock: Processing ${pendingEvents.length} events.`);

      for (const event of pendingEvents) {
        // Enqueue with backoff & retry strategy
        await this.eventQueue.add(
          event.eventType, 
          { 
            ...event.payload as object,
            _metadata: {
              eventId: event.id,
              sequence: event.sequence,
              version: event.version,
            }
          },
          { 
            jobId: event.id, 
            removeOnComplete: true,
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 } 
          }
        );
        
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            status: 'COMPLETED',
            processedAt: new Date()
          },
        });
      }
    } catch (error) {
       this.logger.error(`Outbox batch failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
      await this.redis.releaseLock(lockKey, 'outbox-processor');
    }
  }
}
