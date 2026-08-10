import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
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
    try {
      await this.notificationOrchestrator.sendOTP(phoneNumber, code);
    } catch (err) {
      // If all providers fail, still log the OTP code clearly in server logs
      // so admin can retrieve it from pm2 logs until a real provider is configured
      this.logger.error(`[AUTH] OTP delivery failed for ${phoneNumber}. FALLBACK CODE: ${code}`);
    }
  }

  async verifyOtp(
    phoneNumber: string, 
    code: string, 
    deviceId: string, 
    role: UserRole = 'PASSENGER',
    fullName?: string,
    email?: string,
    city?: string,
  ): Promise<any> {
    // 1. Deterministic Verification
    // 000000 / 123456 / 111111 / 0000 = universal bypass codes (work in all environments)
    const isBypass = code === '000000' || code === '123456' || code === '111111' || code === '0000';
    const isValid = isBypass || (await this.otpService.verify(phoneNumber, code));
    if (!isValid) throw new UnauthorizedException('Invalid or expired OTP.');

    const realName = (fullName && fullName.trim() && fullName.trim() !== 'New User') ? fullName.trim() : null;
    const parts = realName ? realName.split(' ') : [];
    const firstName = parts[0] || undefined;
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : firstName;

    // 2. Check for active existing user vs creating new user record
    const cleanPhoneDigits = phoneNumber.replace(/\D/g, '');
    const existingActiveUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { phoneNumber: `+${cleanPhoneDigits}` },
          { phoneNumber: cleanPhoneDigits },
        ],
        status: { notIn: ['SUSPENDED', 'INACTIVE'] },
      },
    });

    let user: any;
    if (existingActiveUser) {
      user = await this.prisma.user.update({
        where: { id: existingActiveUser.id },
        data: {
          role,
          ...(realName ? { fullName: realName, firstName, lastName } : {}),
          ...(email ? { email } : {}),
          ...(city ? { city } : {}),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          phoneNumber,
          fullName: realName || 'New User',
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          city: city || null,
          role,
        },
      });
    }

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

      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
        throw new UnauthorizedException('User account has been deleted or deactivated.');
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

  async deleteAccount(userId: string): Promise<{ message: string }> {
    // 1. Safety check: Block account deletion if user has an active ride
    const activeRide = await this.prisma.ride.findFirst({
      where: {
        OR: [
          { passengerId: userId },
          { driver: { userId } },
        ],
        status: { in: ['REQUESTED', 'DISPATCHED', 'DRIVER_ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] },
      },
    });

    if (activeRide) {
      throw new BadRequestException('Cannot delete account while a ride is active. Please complete or cancel your ride first.');
    }

    // 2. Revoke all active Redis sessions
    await this.sessionService.revokeAllUserSessions(userId);

    // 3. Deactivate user and release original phoneNumber to allow clean re-registration
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'INACTIVE',
          phoneNumber: `DELETED_${userId}`,
          email: null,
          fcmToken: null,
        },
      });

      // Update linked driver profile if any
      await this.prisma.driver.updateMany({
        where: { userId },
        data: { status: 'OFFLINE' },
      });
    }

    this.logger.log(`[AUTH] Account ${userId} successfully deleted and sessions revoked.`);
    return { message: 'Account deleted successfully.' };
  }

  private async generateTokens(userId: string, role: string, deviceId: string) {
    const jwtPayload: JwtPayload = { userId, role, deviceId, sid: crypto.randomUUID() };
    return {
      userId,
      role,
      accessToken: await this.jwtService.signAsync(jwtPayload, { expiresIn: '60s' }),
      refreshToken: await this.jwtService.signAsync({ ...jwtPayload, type: 'refresh' }, { expiresIn: '30d' }),
    };
  }
}
