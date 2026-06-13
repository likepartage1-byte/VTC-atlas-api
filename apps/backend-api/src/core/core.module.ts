import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { DomainEventBus } from './events/domain-event-bus';
import { OutboxService } from './events/outbox.service';
import { OutboxProcessor } from './events/outbox.processor';
import { EventWorker } from './events/event.worker';
import { QueueModule } from './queues/queue.module';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';
import { validate } from './common/env.validation';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    ConfigModule.forRoot({ 
      isGlobal: true,
      validate,
    }),
    ScheduleModule.forRoot(),
    QueueModule,
  ],
  providers: [
    PrismaService, 
    RedisService, 
    DomainEventBus, 
    OutboxService, 
    OutboxProcessor, 
    EventWorker,
    CorrelationMiddleware
  ],
  exports: [
    PrismaService, 
    RedisService, 
    DomainEventBus, 
    OutboxService, 
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
