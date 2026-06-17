import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../presentation/guards/auth.guard';
import { SessionService } from '../../application/services/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // 1. FAST PATH: Redis Session Check via Service
    const sessionExists = await this.sessionService.isSessionValid(payload.userId, payload.deviceId);
    
    if (!sessionExists) {
      throw new UnauthorizedException('Session has been revoked or expired.');
    }

    return payload;
  }
}
