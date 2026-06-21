import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TraceService } from '../../common/services/trace.service';

export interface IDomainEvent {
  eventType: string;
  aggregateId: string;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trace: TraceService
  ) {}

  /**
   * Stages an event in the Outbox table using a Domain Event object.
   */
  async stage(event: IDomainEvent, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma;
    const correlationId = this.trace.getCorrelationId();
    
    await client.outboxEvent.create({
      data: {
        aggregateType: event.eventType.split('.')[0] || 'Unknown', 
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event as any,
        status: 'PENDING',
        correlationId,
      } as any,
    });

    this.logger.debug(`Event [${event.eventType}] staged in outbox for [${event.aggregateId}]`);
  }

  /**
   * Schedules an event in the Outbox table using explicit parameters.
   */
  async schedule(
    tx: Prisma.TransactionClient,
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: any
  ) {
    const correlationId = this.trace.getCorrelationId();
    
    return tx.outboxEvent.create({
      data: {
        aggregateType,
        aggregateId,
        eventType,
        payload,
        status: 'PENDING',
        correlationId,
      } as any,
    });
  }
}
