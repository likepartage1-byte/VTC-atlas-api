import { Controller, Get, Post, Param, Body, BadRequestException, Logger } from '@nestjs/common';
import { DriverVerificationService } from '../../../drivers/application/services/driver-verification.service';
import { DriverVerificationStatus, DocumentStatus } from '@prisma/client';

/**
 * Admin Verification Dashboard Controller
 * Handles the workflow for driver KYC/Verification.
 */
@Controller('admin/verification')
export class AdminVerificationController {
  private readonly logger = new Logger(AdminVerificationController.name);

  constructor(private readonly verificationService: DriverVerificationService) {}

  /**
   * List all drivers pending verification or currently under review.
   * GET /admin/verification/pending
   */
  @Get('pending')
  async getPending() {
    const items = await this.verificationService.listPendingVerifications();
    return {
      count: items.length,
      items: items.map(v => ({
        id: v.id,
        driverId: v.driverId,
        name: v.driver.user.fullName,
        phone: v.driver.user.phoneNumber,
        status: v.status,
        documentCount: v.documents.length,
        updatedAt: v.updatedAt
      }))
    };
  }

  /**
   * Update the overall verification status of a driver.
   * POST /admin/verification/:id/review
   */
  @Post(':id/review')
  async reviewVerification(
    @Param('id') id: string,
    @Body() body: { status: DriverVerificationStatus; reason?: string }
  ) {
    if (!body.status) throw new BadRequestException('Status is required');
    
    this.logger.log(`Admin reviewing verification [${id}] -> ${body.status}`);
    
    return this.verificationService.reviewVerification(
        id, 
        body.status, 
        body.reason, 
        'admin-system' // Replace with actual admin ID from auth in the future
    );
  }

  /**
   * Review an individual document.
   * POST /admin/verification/documents/:docId/review
   */
  @Post('documents/:docId/review')
  async reviewDocument(
    @Param('docId') docId: string,
    @Body() body: { status: DocumentStatus; reason?: string }
  ) {
    if (!body.status) throw new BadRequestException('Status is required');
    
    this.logger.log(`Admin reviewing document [${docId}] -> ${body.status}`);
    
    return this.verificationService.reviewDocument(
        docId, 
        body.status, 
        body.reason, 
        'admin-system'
    );
  }
}
