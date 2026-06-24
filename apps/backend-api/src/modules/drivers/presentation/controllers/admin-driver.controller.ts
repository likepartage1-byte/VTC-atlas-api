import { Controller, Post, Get, Param, Body, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { DriverOnboardingService } from '../../application/services/driver-onboarding.service';
import { DriverVerificationService } from '../../application/services/driver-verification.service';
import { DriverVerificationStatus, DocumentStatus } from '@prisma/client';

/**
 * مسئول عن العمليات الإدارية الخاصة بالسائقين
 * في المستقبل يجب إضافة @UseGuards(AdminGuard) هنا
 */
@Controller('admin/drivers')
export class AdminDriverController {
  private readonly logger = new Logger(AdminDriverController.name);

  constructor(
    private readonly onboardingService: DriverOnboardingService,
    private readonly verificationService: DriverVerificationService
  ) {}

  @Post(':userId/promote')
  async promote(@Param('userId') userId: string) {
    this.logger.log(`Admin request: Promoting user [${userId}] to DRIVER`);
    await this.onboardingService.promoteUserToDriver(userId);
    return { 
      success: true, 
      message: `User ${userId} has been promoted to DRIVER and profile initialized.` 
    };
  }

  @Get('verification/pending')
  async getPending() {
    return this.verificationService.listPendingVerifications();
  }

  @Post('verification/:id/review')
  async reviewVerification(
    @Param('id') id: string,
    @Body() body: { status: DriverVerificationStatus; reason?: string }
  ) {
    if (!body.status) throw new BadRequestException('Status is required');
    return this.verificationService.reviewVerification(id, body.status, body.reason);
  }

  @Post('verification/documents/:docId/review')
  async reviewDocument(
    @Param('docId') docId: string,
    @Body() body: { status: DocumentStatus; reason?: string }
  ) {
    if (!body.status) throw new BadRequestException('Status is required');
    return this.verificationService.reviewDocument(docId, body.status, body.reason);
  }
}
