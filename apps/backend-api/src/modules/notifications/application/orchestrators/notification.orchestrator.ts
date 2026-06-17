import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingsService } from '../../../admin/application/services/system-settings.service';
import { WhatsAppService } from '../../infrastructure/whatsapp/whatsapp.service';
// import { SmsService } from '../../infrastructure/sms/sms.service'; // To be added later

export enum NotificationProvider {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

interface NotificationStrategy {
  otp: {
    primary: NotificationProvider;
    fallback?: NotificationProvider;
  };
}

@Injectable()
export class NotificationOrchestrator {
  private readonly logger = new Logger(NotificationOrchestrator.name);
  private readonly DEFAULT_STRATEGY: NotificationStrategy = {
    otp: {
      primary: NotificationProvider.WHATSAPP,
      fallback: NotificationProvider.SMS,
    },
  };

  constructor(
    private settings: SystemSettingsService,
    private whatsapp: WhatsAppService,
  ) {}

  async sendOTP(phoneNumber: string, code: string): Promise<void> {
    const strategy = await this.getStrategy();
    const providers = [strategy.otp.primary, strategy.otp.fallback].filter(Boolean);

    for (const provider of providers) {
      try {
        const success = await this.attemptSend(provider as NotificationProvider, phoneNumber, code);
        if (success) {
          this.logger.log(`OTP successfully sent to ${phoneNumber} via ${provider}`);
          return;
        }
      } catch (error) {
        this.logger.warn(`Failed to send OTP via ${provider}: ${error.message}. Trying next...`);
      }
    }

    throw new Error('All notification providers failed to deliver OTP.');
  }

  private async attemptSend(provider: NotificationProvider, to: string, code: string): Promise<boolean> {
    switch (provider) {
      case NotificationProvider.WHATSAPP:
        return await this.whatsapp.sendOTP(to, code);
      case NotificationProvider.SMS:
        this.logger.log(`[FAILOVER] Attempting SMS fallback for ${to} (MOCK)`);
        // return await this.sms.send(to, `Atlas OTP: ${code}`);
        return true; // Mocking true for now until SMS is added
      default:
        return false;
    }
  }

  private async getStrategy(): Promise<NotificationStrategy> {
    try {
      const config = await this.settings.getSetting<NotificationStrategy>('notification_strategy');
      return config || this.DEFAULT_STRATEGY;
    } catch (e) {
      return this.DEFAULT_STRATEGY;
    }
  }
}
