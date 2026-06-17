import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDomainEvent } from './domain-event.interface';
import { OutboxService } from '../outbox/services/outbox.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DomainEventBus {
  private readonly logger = new Logger(DomainEventBus.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly outbox: OutboxService,
  ) {}

  async publish(event: IDomainEvent): Promise<void> {
    this.logger.log(`Publishing event: ${event.eventType} [${event.aggregateId}]`);
    await this.eventEmitter.emitAsync(event.eventType, event);
  }

  async publishAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Safely stages an event within a database transaction (Outbox Pattern).
   */
  async stage(event: IDomainEvent, tx: Prisma.TransactionClient): Promise<void> {
    await this.outbox.schedule(
        tx, 
        event.constructor.name, 
        event.aggregateId, 
        event.eventType, 
        event
    );
  }
}
