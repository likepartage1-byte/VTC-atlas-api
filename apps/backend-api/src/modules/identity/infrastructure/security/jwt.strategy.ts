import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../presentation/guards/auth.guard';
import { SessionService } from '../../application/services/session.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
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

    // 2. Strict Account Status Check (TRASHED / Soft Deleted)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { status: true, deletedAt: true },
    });

    if (!user || user.status === 'TRASHED' || user.deletedAt != null) {
      throw new UnauthorizedException('User account is trashed or suspended.');
    }

    return payload;
  }
}
