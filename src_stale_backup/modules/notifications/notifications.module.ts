import { Module } from '@nestjs/common';
import { NotificationRouter } from './application/routers/notification.router';
import { SmsAdapter, PushAdapter } from './infrastructure/adapters/channel-adapters';

@Module({
  providers: [NotificationRouter, SmsAdapter, PushAdapter],
  exports: [NotificationRouter],
})
export class NotificationsModule {}
