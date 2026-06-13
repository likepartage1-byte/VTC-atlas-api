import { Controller, Post, Body, UseGuards, Version } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { RedisThrottleGuard } from '../../../../core/common/guards/redis-throttle.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @UseGuards(RedisThrottleGuard)
  @Version('1')
  async requestOtp(@Body('phoneNumber') phoneNumber: string) {
    await this.authService.requestOtp(phoneNumber);
    return { message: 'OTP sent successfully.' };
  }

  @Post('otp/verify')
  @Version('1')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('code') code: string,
    @Body('deviceId') deviceId: string,
  ) {
    return this.authService.verifyOtp(phoneNumber, code, deviceId);
  }
}
