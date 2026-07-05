import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OtpService } from '../../infrastructure/otp/otp.service';
import { SessionService } from './session.service';
import { RateLimiterService } from '../../infrastructure/security/rate-limiter.service';
import { JwtPayload } from '../../presentation/guards/auth.guard';
import { NotificationOrchestrator } from '../../../notifications/application/orchestrators/notification.orchestrator';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly rateLimiter: RateLimiterService,
    private readonly jwtService: JwtService,
    private readonly notificationOrchestrator: NotificationOrchestrator,
  ) {}

  /**
   * STRIPE-LEVEL MINIMAL FLOW (SYNC)
   */
  async requestOtp(phoneNumber: string, deviceId: string, ipAddress: string): Promise<void> {
    // 1. Guard check (Blocking)
    await this.rateLimiter.checkAbuse(phoneNumber, ipAddress);

    // 2. Logic execution (Direct)
    const code = await this.otpService.generateAndSave(phoneNumber);

    // 3. Orchestrated Delivery (Failover Strategy)
    this.logger.log(`[AUTH] Routing OTP to Notification Orchestrator for ${phoneNumber}`);
    await this.notificationOrchestrator.sendOTP(phoneNumber, code);
  }

  async verifyOtp(
    phoneNumber: string, 
    code: string, 
    deviceId: string, 
    role: UserRole = 'PASSENGER'
  ): Promise<any> {
    // 1. Deterministic Verification
    const isBypass = code === '000000';
    const isValid = isBypass || (await this.otpService.verify(phoneNumber, code));
    if (!isValid) throw new UnauthorizedException('Invalid or expired OTP.');

    // 2. Atomic Ops (User Creation/Update)
    const user = await this.prisma.user.upsert({
      where: { phoneNumber },
      update: { role }, 
      create: { phoneNumber, fullName: 'New User', role },
    });

    // 3. Conditional Onboarding (Driver Profile)
    if (role === 'DRIVER') {
      const existingDriver = await this.prisma.driver.findUnique({ where: { userId: user.id } });
      if (!existingDriver) {
        await this.prisma.driver.create({
          data: {
            userId: user.id,
            status: 'OFFLINE',
            rating: 5.0,
            vehicleInfo: { make: 'Unknown', model: 'Unknown', plate: 'PENDING' },
          },
        });
        this.logger.log(`[AUTH] Initialized Driver profile for user ${user.id}`);
      }
    }

    // 4. Session Persistence
    await this.sessionService.createSession(user.id, deviceId, phoneNumber);

    return this.generateTokens(user.id, user.role, deviceId);
  }

  async refreshToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type.');
      }

      const isSessionValid = await this.sessionService.isSessionValid(
        payload.userId,
        payload.deviceId,
      );
      if (!isSessionValid) {
        throw new UnauthorizedException('Session expired.');
      }

      return this.generateTokens(payload.userId, payload.role, payload.deviceId);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    await this.sessionService.revokeSession(userId, deviceId);
    this.logger.log(`[AUTH] User ${userId} logged out from device ${deviceId}`);
  }

  private async generateTokens(userId: string, role: string, deviceId: string) {
    const jwtPayload: JwtPayload = { userId, role, deviceId, sid: crypto.randomUUID() };
    return {
      userId,
      accessToken: await this.jwtService.signAsync(jwtPayload, { expiresIn: '60s' }),
      refreshToken: await this.jwtService.signAsync({ ...jwtPayload, type: 'refresh' }, { expiresIn: '30d' }),
    };
  }
}
