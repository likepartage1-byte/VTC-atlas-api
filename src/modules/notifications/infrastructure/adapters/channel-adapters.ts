import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsAdapter {
  private readonly logger = new Logger(SmsAdapter.name);

  async send(phone: string, message: string): Promise<void> {
    // Integration point for Twilio / Infobip / BulkSMS
    this.logger.log(`[SMS OUTBOUND] To: ${phone} | Content: ${message}`);
  }
}

@Injectable()
export class PushAdapter {
  private readonly logger = new Logger(PushAdapter.name);

  async send(targetToken: string, title: string, body: string): Promise<void> {
    // Integration point for Firebase Cloud Messaging (FCM)
    this.logger.log(`[PUSH OUTBOUND] Token: ${targetToken} | Title: ${title} | Body: ${body}`);
  }
}
