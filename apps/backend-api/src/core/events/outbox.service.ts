import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IDomainEvent } from './domain-event.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Stages an event in the Outbox table.
   * MUST be called within a transaction to ensure atomicity.
   */
  async stage(event: IDomainEvent, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma;
    
    await client.outboxEvent.create({
      data: {
        aggregateType: event.eventType.split('.')[0] || 'Unknown', 
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event as any,
        status: 'PENDING',
        version: 1,
      },
    });

    this.logger.debug(`Event [${event.eventType}] staged in outbox for [${event.aggregateId}]`);
  }
}
