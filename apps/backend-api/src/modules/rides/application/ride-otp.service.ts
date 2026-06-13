import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from '../../../core/redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class RideOtpService {
  private readonly logger = new Logger(RideOtpService.name);
  private readonly TTL = 900; // 15 minutes extension for better UX

  constructor(private readonly redis: RedisService) {}

  /**
   * Generates a unique 4-digit OTP using crypto-secure randomness.
   * This is the "Verification Token" for the physical handshake.
   */
  async generateForRide(rideId: string): Promise<string> {
    const otp = crypto.randomInt(1000, 9999).toString();
    
    // Store with ride context to prevent cross-ride replay
    await this.redis.getClient().set(`ride:v1:otp:${rideId}`, otp, 'EX', this.TTL);
    
    this.logger.log(`[Handshake] OTP generated for Ride ${rideId}`);
    return otp;
  }

  /**
   * Validates the OTP provided by the driver.
   * Atomically consumes the token on success.
   */
  async validate(rideId: string, inputOtp: string): Promise<boolean> {
    const key = `ride:v1:otp:${rideId}`;
    const storedOtp = await this.redis.getClient().get(key);
    
    if (!storedOtp) {
      this.logger.warn(`Verification failed: No active OTP session for Ride ${rideId}`);
      throw new BadRequestException('Verification code has expired or session invalid.');
    }

    if (storedOtp !== inputOtp) {
      this.logger.warn(`Invalid OTP attempt for Ride ${rideId}`);
      return false;
    }

    // Handshake Success -> Burn the token immediately
    await this.redis.getClient().del(key);
    return true;
  }
}
