import { Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly DAILY_PHONE_LIMIT = 10;
  private readonly DAILY_IP_LIMIT = 100;
  private readonly COOLDOWN_SECONDS = 90;

  constructor(private readonly redis: RedisService) {}

  async checkAbuse(phone: string, ip: string): Promise<void> {
    const redisClient = this.redis.getClient();
    const phoneKey = `limit:phone:${phone}`;
    const ipKey = `limit:ip:${ip}`;
    const cooldownKey = `limit:cooldown:${phone}`;

    const isInCooldown = await redisClient.get(cooldownKey);
    if (isInCooldown) throw new BadRequestException('Please wait before requesting again.');

    const [phoneHits, ipHits] = await Promise.all([
      redisClient.get(phoneKey),
      redisClient.get(ipKey),
    ]);

    if (Number(phoneHits) >= this.DAILY_PHONE_LIMIT) {
      this.logger.warn(`Quota exceeded for phone: ${phone}`);
      throw new ForbiddenException('SMS quota exceeded.');
    }

    if (Number(ipHits) >= this.DAILY_IP_LIMIT) {
      throw new ForbiddenException('Too many requests from this IP.');
    }

    await Promise.all([
      this.increment(phoneKey),
      this.increment(ipKey),
      redisClient.set(cooldownKey, '1', 'EX', this.COOLDOWN_SECONDS),
    ]);
  }

  private async increment(key: string) {
    const redisClient = this.redis.getClient();
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 86400);
  }
}
