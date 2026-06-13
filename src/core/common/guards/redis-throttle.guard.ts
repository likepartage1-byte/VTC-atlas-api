import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';

@Injectable()
export class RedisThrottleGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `throttle:${ip}:${request.url}`;

    const redisClient = this.redis.getClient();
    const current = await redisClient.incr(key);

    if (current === 1) {
      await redisClient.expire(key, 60); // 1 minute window
    }

    if (current > 10) { // Limit to 10 requests per minute
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
