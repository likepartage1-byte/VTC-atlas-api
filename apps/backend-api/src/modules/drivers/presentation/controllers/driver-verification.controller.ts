import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { DriverVerificationService } from '../application/services/driver-verification.service';

@Controller('v1/driver/verification')
export class DriverVerificationController {
  constructor(private readonly verificationService: DriverVerificationService) {}

  @Get('summary')
  async getSummary(@Req() req: any) {
    // Note: In a real app, driverId would come from the JWT session.
    // For now we assume req.user.driverId or similar.
    const driverId = req.user?.driverId; 
    return this.verificationService.getVerificationSummary(driverId);
  }

  @Post('documents/:type')
  async uploadDocument(
    @Param('type') type: string,
    @Req() req: any
  ) {
    // Placeholder for Multipart upload logic
    return {
      message: `Upload logic for ${type} is being implemented.`,
      status: 'PLANNING'
    };
  }
}
