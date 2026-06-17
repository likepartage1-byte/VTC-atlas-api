import { Module } from '@nestjs/common';
import { NotificationRouter } from './application/routers/notification.router';
import { SmsAdapter, PushAdapter } from './infrastructure/adapters/channel-adapters';
import { WhatsAppService } from './infrastructure/whatsapp/whatsapp.service';
import { NotificationOrchestrator } from './application/orchestrators/notification.orchestrator';

@Module({
  providers: [NotificationRouter, SmsAdapter, PushAdapter, WhatsAppService, NotificationOrchestrator],
  exports: [NotificationRouter, WhatsAppService, NotificationOrchestrator],
})
export class NotificationsModule {}
