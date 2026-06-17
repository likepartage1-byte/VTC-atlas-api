import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TraceService } from '../../common/services/trace.service';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trace: TraceService
  ) {}

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
