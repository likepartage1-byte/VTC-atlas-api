import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
      });
      this.logger.log(`[MailService] Initialized SMTP transporter for ${host}:${port}`);
    } else {
      this.logger.warn(`[MailService] SMTP credentials missing. Simulation mode active.`);
    }
  }

  async sendAdminOtp(toEmail: string, code: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', '"Yalla VTC Security" <no-reply@yallavtc.com>');
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (!this.transporter) {
      if (isProduction) {
        this.logger.warn(`[MailService] SMTP credentials missing in production. OTP email for ${toEmail} suppressed for security.`);
      } else {
        this.logger.log(`[SIMULATION] Admin Email OTP generated for ${toEmail}: ${code}`);
      }
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: toEmail,
        subject: 'YALLA VTC - Admin Security Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #eee; rounded: 8px;">
            <h2 style="color: #2563EB; margin-bottom: 8px;">YALLA VTC Platform Security</h2>
            <p style="font-size: 14px; color: #555;">Use the verification code below to authenticate into the Admin Dashboard:</p>
            <div style="background: #F1F5F9; padding: 16px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0F172A; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #64748B;">This code is valid for <strong>5 minutes</strong> and can only be used once. If you did not request this login, please contact platform security immediately.</p>
          </div>
        `,
      });
      this.logger.log(`[MailService] Successfully sent OTP email to ${toEmail}`);
    } catch (err: any) {
      this.logger.error(`[MailService] Failed to send OTP email to ${toEmail}: ${err.message}`);
      if (!isProduction) {
        this.logger.error(`[DEV FALLBACK CODE] OTP for ${toEmail} is: ${code}`);
      }
    }
  }
}
