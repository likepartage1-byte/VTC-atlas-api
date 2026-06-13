import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDomainEvent } from './domain-event.interface';

@Injectable()
export class DomainEventBus {
  private readonly logger = new Logger(DomainEventBus.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(event: IDomainEvent): Promise<void> {
    this.logger.log(`Publishing event: ${event.eventType} [${event.aggregateId}]`);
    
    // We emit using the eventType as the key
    await this.eventEmitter.emitAsync(event.eventType, event);
  }

  async publishAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
