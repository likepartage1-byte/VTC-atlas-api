import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, Req, BadRequestException, UseGuards, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriverVerificationService } from '../../application/services/driver-verification.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { DocumentType } from '@prisma/client';

@Controller('driver/verification')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER')
export class DriverVerificationController {
  constructor(
    private readonly verificationService: DriverVerificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('summary')
  async getSummary(
    @CurrentUser('userId') userId: string,
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    let driverId: string | null = null;
    
    if (userId) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
        select: { id: true },
      });
      driverId = driver?.id || null;
    }

    if (!driverId) {
      driverId = xDriverId || null;
    }

    if (!driverId) {
      throw new BadRequestException('Driver ID missing in session/headers');
    }

    return this.verificationService.getVerificationSummary(driverId);
  }

  @Post('documents/:type')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    let driverId: string | null = null;

    if (userId) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
        select: { id: true },
      });
      driverId = driver?.id || null;
    }

    if (!driverId) {
      driverId = xDriverId || null;
    }

    if (!driverId) {
      throw new BadRequestException('Driver ID missing in session/headers');
    }
    
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

