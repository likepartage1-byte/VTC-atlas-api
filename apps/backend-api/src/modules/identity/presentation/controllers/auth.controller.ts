import { Controller, Post, Body, UseGuards, Ip } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from '../../application/services/auth.service';
import { RedisThrottleGuard } from '../../../../core/common/guards/redis-throttle.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @UseGuards(RedisThrottleGuard)
  async requestOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('deviceId') deviceId: string,
    @Ip() ip: string,
  ) {
    await this.authService.requestOtp(phoneNumber, deviceId, ip);
    return { message: 'OTP sent successfully.' };
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('code') code: string,
    @Body('deviceId') deviceId: string,
    @Body('role') role: UserRole, 
  ) {
    return this.authService.verifyOtp(phoneNumber, code, deviceId, role);
  }
}
