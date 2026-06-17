import { Controller, Post, Param, UseGuards, Logger } from '@nestjs/common';
import { DriverOnboardingService } from '../../application/services/driver-onboarding.service';

/**
 * مسئول عن العمليات الإدارية الخاصة بالسائقين
 * في المستقبل يجب إضافة @UseGuards(AdminGuard) هنا
 */
@Controller('admin/drivers')
export class AdminDriverController {
  private readonly logger = new Logger(AdminDriverController.name);

  constructor(private readonly onboardingService: DriverOnboardingService) {}

  @Post(':userId/promote')
  async promote(@Param('userId') userId: string) {
    this.logger.log(`Admin request: Promoting user [${userId}] to DRIVER`);
    await this.onboardingService.promoteUserToDriver(userId);
    return { 
      success: true, 
      message: `User ${userId} has been promoted to DRIVER and profile initialized.` 
    };
  }
}
