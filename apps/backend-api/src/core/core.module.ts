import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { TraceService } from './common/services/trace.service';
import { DiagnosticService } from './common/services/diagnostic.service';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';
import { validate } from './common/env.validation';
import { OutboxService } from './outbox/services/outbox.service';
import { OutboxProcessor } from './outbox/services/outbox.processor';
import { DomainEventBus } from './events/domain-event-bus';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    ConfigModule.forRoot({ 
      isGlobal: true,
      validate,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    PrismaService, 
    RedisService, 
    TraceService,
    DiagnosticService,
    OutboxService,
    OutboxProcessor,
    DomainEventBus,
    CorrelationMiddleware
  ],
  exports: [
    PrismaService, 
    RedisService, 
    TraceService,
    DiagnosticService,
    OutboxService,
    DomainEventBus,
    CorrelationMiddleware
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationMiddleware)
      .forRoutes('*');
  }
}
