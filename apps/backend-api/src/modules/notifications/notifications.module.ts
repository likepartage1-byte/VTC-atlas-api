import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationRouter } from './application/routers/notification.router';
import { NotificationService } from './application/services/notification.service';
import { FCMService } from './application/services/fcm.service';
import { NotificationProcessor } from './application/queues/notification.processor';
import { NotificationOrchestrator } from './application/orchestrators/notification.orchestrator';
import { NotificationController } from './presentation/controllers/notification.controller';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [
    NotificationService,
    FCMService,
    NotificationProcessor,
    NotificationRouter,
    NotificationOrchestrator,
  ],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationOrchestrator],
})
export class NotificationsModule {}
