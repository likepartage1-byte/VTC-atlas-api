import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TraceService } from '../../common/services/trace.service';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly trace: TraceService
  ) {}

  /**
   * PROCESS: Background poller to transition PENDING -> COMPLETED
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const events = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 50,
        orderBy: { sequence: 'asc' },
      });

      for (const event of events) {
        // 🧠 RESTORE CONTEXT: Ensure the background work carries the original ID
        await this.trace.run((event as any).correlationId || 'system', async () => {
          try {
            const correlationId = (event as any).correlationId;
            this.logger.log(`[OutboxProcessor] Emitting: ${event.eventType} (Trace: ${correlationId})`);
            
            await this.eventEmitter.emitAsync(event.eventType, event.payload);

            await this.prisma.outboxEvent.update({
              where: { id: event.id },
              data: { 
                status: 'COMPLETED',
                processedAt: new Date()
              },
            });
          } catch (err) {
            this.logger.error(`Failed to process outbox event ${event.id}`, err);
            // Simple retry logic incrementing a hidden version or status
            await this.prisma.outboxEvent.update({
              where: { id: event.id },
              data: { status: 'FAILED' },
            });
          }
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
