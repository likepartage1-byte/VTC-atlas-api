import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriverVerificationService } from '../../application/services/driver-verification.service';
import { DocumentType } from '@prisma/client';

@Controller('driver/verification')
export class DriverVerificationController {
  constructor(private readonly verificationService: DriverVerificationService) {}

  @Get('summary')
  async getSummary(@Req() req: any) {
    const driverId = req.user?.driverId || req.headers['x-driver-id']; // Fallback for dev
    if (!driverId) throw new BadRequestException('Driver ID missing in session/headers');
    return this.verificationService.getVerificationSummary(driverId);
  }

  @Post('documents/:type')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const driverId = req.user?.driverId || req.headers['x-driver-id'];
    if (!driverId) throw new BadRequestException('Driver ID missing in session/headers');
    
    if (!file) throw new BadRequestException('No file uploaded');

    // Validate type exists in enum
    if (!Object.values(DocumentType).includes(type.toUpperCase() as any)) {
      throw new BadRequestException(`Invalid document type: ${type}`);
    }

    return this.verificationService.uploadDocument(
      driverId, 
      type.toUpperCase() as DocumentType, 
      file
    );
  }
}
