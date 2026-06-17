import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(private configService: ConfigService) {
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
    this.apiUrl = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
  }

  async sendOTP(to: string, code: string): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn('WhatsApp credentials missing. Simulation mode active.');
      this.logger.log(`[SIMULATION] Sending OTP ${code} to WhatsApp: ${to}`);
      return true;
    }

    try {
      // Basic formatting: ensure phone starts with 212 and no +
      const formattedPhone = to.replace('+', '');

      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'otp_verification', // Pre-approved template name in Meta
            language: { code: 'ar' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: code }],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: code }],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`WhatsApp OTP sent to ${to}. ID: ${response.data.messages[0].id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
      return false;
    }
  }
}
