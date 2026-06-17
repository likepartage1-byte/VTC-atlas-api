import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { parsePhoneNumberWithError, CountryCode } from 'libphonenumber-js';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = 300; 

  constructor(private readonly redis: RedisService) {}

  /**
   * PURE SYNC CALL: Generate and store. No events.
   */
  async generateAndSave(rawPhone: string): Promise<string> {
    const phone = this.normalizePhone(rawPhone);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const redisClient = this.redis.getClient();
    await redisClient.set(`otp:code:${phone}`, code, 'EX', this.OTP_TTL);
    await redisClient.del(`otp:attempts:${phone}`);

    this.logger.log(`[OTP] Generated successfully for ${phone}`);
    return code;
  }

  async verify(rawPhone: string, inputCode: string): Promise<boolean> {
    const phone = this.normalizePhone(rawPhone);
    const redisClient = this.redis.getClient();
    const key = `otp:code:${phone}`;

    const storedCode = await redisClient.get(key);
    if (!storedCode) return false;

    if (storedCode !== inputCode) return false;

    await redisClient.del(key); // Burn after use
    return true;
  }

  private normalizePhone(phone: string, defaultCountry: CountryCode = 'MA'): string {
    try {
      return parsePhoneNumberWithError(phone, defaultCountry).format('E.164');
    } catch (e) {
      throw new BadRequestException('Invalid phone number format.');
    }
  }
}
