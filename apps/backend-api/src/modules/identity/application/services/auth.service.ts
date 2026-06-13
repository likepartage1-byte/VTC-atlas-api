import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DomainEventBus } from '../../../../core/events/domain-event-bus';
import { OtpService } from '../../infrastructure/otp/otp.service';
import { OtpRequestedEvent, OtpVerifiedEvent, SessionCreatedEvent } from '../../domain/events/identity-events';
import { JwtPayload } from '../../presentation/guards/auth.guard';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp(phoneNumber: string): Promise<void> {
    this.logger.log(`OTP request for: ${phoneNumber}`);
    await this.otpService.generateAndStore(phoneNumber);
    await this.eventBus.publish(new OtpRequestedEvent(phoneNumber));
  }

  async verifyOtp(phoneNumber: string, code: string, deviceId: string): Promise<any> {
    const isValid = await this.otpService.verify(phoneNumber, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code.');
    }

    const user = await this.prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: {
        phoneNumber,
        fullName: 'New User',
        role: 'PASSENGER',
      },
    });

    await this.eventBus.publish(new OtpVerifiedEvent(user.id, phoneNumber));
    await this.eventBus.publish(new SessionCreatedEvent(user.id, deviceId));

    return this.generateTokens(user.id, user.role, deviceId);
  }

  async refreshToken(oldRefreshToken: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      return this.generateTokens(payload.userId, payload.role, payload.deviceId);
    } catch (e) {
      throw new UnauthorizedException('Refresh token expired or invalid.');
    }
  }

  private async generateTokens(userId: string, role: string, deviceId: string) {
    const jwtPayload: JwtPayload = {
      userId,
      role,
      deviceId,
      sid: crypto.randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, { 
      expiresIn: '24h',
      secret: this.jwtService.getInternalOptions().secret // Fallback to config
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...jwtPayload, type: 'refresh' },
      { expiresIn: '30d' },
    );

    return {
      userId,
      accessToken,
      refreshToken,
    };
  }
}
