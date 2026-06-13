import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../presentation/guards/auth.guard';
import { RedisService } from '../../../../core/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // 1. FAST PATH: Redis Session Check
    // If Redis is reachable, we verify the session status.
    // If Redis is down, we fall back to stateless JWT verification (Trade-off: Availability > Strict Revocation)
    try {
      const sessionKey = `session:${payload.userId}:${payload.deviceId}`;
      const sessionExists = await this.redis.getClient().exists(sessionKey);
      
      if (!sessionExists) {
        throw new UnauthorizedException('Session has been revoked or expired.');
      }
    } catch (error) {
       // Redis connectivity issue — allow stateless jwt check to continue
       if (error instanceof UnauthorizedException) throw error;
    }

    return payload;
  }
}
