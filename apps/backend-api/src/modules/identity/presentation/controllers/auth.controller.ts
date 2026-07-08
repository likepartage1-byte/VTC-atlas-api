import { Controller, Post, Get, Body, UseGuards, Ip, Request, Version } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from '../../application/services/auth.service';
import { RedisThrottleGuard } from '../../../../core/common/guards/redis-throttle.guard';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @UseGuards(RedisThrottleGuard)
  @Version('1')
  async requestOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('deviceId') deviceId: string,
    @Ip() ip: string,
  ) {
    await this.authService.requestOtp(phoneNumber, deviceId, ip);
    return { message: 'OTP sent successfully.' };
  }

  @Post('otp/verify')
  @Version('1')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('code') code: string,
    @Body('deviceId') deviceId: string,
    @Body('role') role: UserRole, 
  ) {
    return this.authService.verifyOtp(phoneNumber, code, deviceId, role);
  }

  /**
   * GET /api/v1/auth/me
   * Returns the current authenticated user's profile.
   * Used by the driver app heartbeat to verify session validity.
   */
  @Get('me')
  @Version('1')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      role: user.role,
      deviceId: user.deviceId,
    };
  }

  /**
   * POST /api/v1/auth/refresh
   * Exchanges a refresh token for a new access token + refresh token pair.
   */
  @Post('refresh')
  @Version('1')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
