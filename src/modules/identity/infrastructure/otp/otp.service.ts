import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = 300; // 5 minutes
  private readonly COOLDOWN_TTL = 60; // 1 minute
  private readonly MAX_ATTEMPTS = 5;

  constructor(private readonly redis: RedisService) {}

  async generateAndStore(phone: string): Promise<string> {
    const redisClient = this.redis.getClient();

    // 1. Check Cooldown
    const cooldown = await redisClient.get(`otp:cooldown:${phone}`);
    if (cooldown) {
      throw new BadRequestException('Please wait before requesting a new code.');
    }

    // 2. Generate numeric 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store in Redis
    await redisClient.set(`otp:code:${phone}`, code, 'EX', this.OTP_TTL);
    await redisClient.set(`otp:cooldown:${phone}`, '1', 'EX', this.COOLDOWN_TTL);
    
    // Reset attempts on new request
    await redisClient.del(`otp:attempts:${phone}`);

    this.logger.log(`OTP generated for ${phone}: ${code} (SIMULATED SMS)`);
    return code;
  }

  async verify(phone: string, inputCode: string): Promise<boolean> {
    const redisClient = this.redis.getClient();
    const storedCode = await redisClient.get(`otp:code:${phone}`);
    const attemptsKey = `otp:attempts:${phone}`;

    if (!storedCode) {
      throw new BadRequestException('OTP expired or not found.');
    }

    // 1. Check Attempt Limit
    const attempts = await redisClient.incr(attemptsKey);
    if (attempts > this.MAX_ATTEMPTS) {
      await redisClient.del(`otp:code:${phone}`); // Kill the code on too many failures
      throw new BadRequestException('Too many failed attempts. Request a new code.');
    }

    // 2. Compare
    if (storedCode !== inputCode) {
      return false;
    }

    // 3. Success -> Cleanup
    await redisClient.del(`otp:code:${phone}`);
    await redisClient.del(attemptsKey);
    
    return true;
  }
}
