import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@Processor('domain-events')
export class EventWorker extends WorkerHost {
  private readonly logger = new Logger(EventWorker.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  /**
   * Phase 2 - Durable Event Dispatcher
   * Acts as a mini-Kafka consumer within the NestJS context.
   */
  async process(job: Job<any, any, string>): Promise<any> {
    const now = Date.now();
    const age = now - job.timestamp;

    // 1. LOAD SHEDDING (v3.0): Survive retry storms by dropping stale events
    if (age > 60000) { 
      this.logger.warn(`Load Shedding: Dropping stale event ${job.name} [Age: ${age}ms]`);
      return { status: 'SHEDDED' };
    }

    this.logger.debug(`Dispatching durable event: ${job.name} [ID: ${job.id}]`);
    
    try {
      // 2. IDEMPOTENT ROUTING (The Switch Brain)
      // This routes durable events to their respective internal listeners.
      switch (job.name) {
        case 'ride.requested':
        case 'ride.status.changed':
        case 'negotiation.accepted':
        case 'driver.location.updated':
          // Emit to local system listeners (Gateways, Analytics, etc.)
          await this.eventEmitter.emitAsync(job.name, job.data);
          break;

        default:
          this.logger.warn(`Unregistered event type ignored: ${job.name}`);
      }

      return { status: 'COMPLETED', sequence: job.data._metadata?.sequence };
    } catch (err) {
      this.logger.error(`Event Worker failed: ${err.message}`);
      throw err; // Trigger BullMQ retry
    }
  }
}
