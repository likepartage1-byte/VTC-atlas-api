import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { DomainEventBus } from './events/domain-event-bus';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
  ],
  providers: [PrismaService, RedisService, DomainEventBus, CorrelationMiddleware],
  exports: [PrismaService, RedisService, DomainEventBus, CorrelationMiddleware],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationMiddleware)
      .forRoutes('*');
  }
}
