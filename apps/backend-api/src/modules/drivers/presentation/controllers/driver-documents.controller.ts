import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  UploadedFile, 
  UseInterceptors, 
  UseGuards, 
  Headers, 
  BadRequestException, 
  NotFoundException,
  Version
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { DriverVerificationService } from '../../application/services/driver-verification.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DocumentType, DocumentStatus, DriverVerificationStatus } from '@prisma/client';

@Controller('driver/documents')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER')
export class DriverDocumentsController {
  constructor(
    private readonly verificationService: DriverVerificationService,
    private readonly prisma: PrismaService,
  ) {}

  private async getDriverId(userId: string, xDriverId?: string): Promise<string> {
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

    return driverId;
  }

  @Get()
  @Version('1')
  async getDocuments(
    @CurrentUser('userId') userId: string,
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    const driverId = await this.getDriverId(userId, xDriverId);
    
    let verification = await this.prisma.driverVerification.findUnique({
      where: { driverId },
      include: {
        documents: {
          orderBy: { version: 'desc' }
        }
      }
    });

    if (!verification) {
      verification = await this.verificationService.initializeVerification(driverId);
      verification = await this.prisma.driverVerification.findUnique({
        where: { driverId },
        include: { documents: { orderBy: { version: 'desc' } } }
      });
    }

    if (!verification) {
      throw new NotFoundException('Verification profile not found');
    }

    // Determine metadata values
    const metadata = (verification.metadata as any) || {};
    const requiresTechnicalInspection = metadata.requiresTechnicalInspection === true;
    const additionalRequired = Array.isArray(metadata.requiredDocuments) ? metadata.requiredDocuments : [];

    // 1. Basic Required Documents (PROFILE_PHOTO & VEHICLE_PHOTO managed separately)
    const basicRequired = [
      'IDENTITY_CARD',
      'DRIVING_LICENSE',
      'CARTE_GRISE',
    ];

    // 2. Conditional required documents (triggered by system/admin)
    const conditionalRequired: string[] = [];
    if (requiresTechnicalInspection) {
      conditionalRequired.push('TECHNICAL_INSPECTION');
    }
    for (const type of additionalRequired) {
      const typeUpper = type.toUpperCase();
      if (!conditionalRequired.includes(typeUpper)) {
        conditionalRequired.push(typeUpper);
      }
    }

    // 3. Optional Documents
    const optionalTypes = [
      'INSURANCE_POLICY',
      'REGISTRE_COMMERCE',
      'RENTAL_AGREEMENT',
      'COMPANY_DOCS',
      'FLEET_PERMIT',
      'ADDITIONAL_DOC'
    ];

    // Combine all required types for calculation
    const allRequiredTypes = [...basicRequired, ...conditionalRequired];

    // Filter current active versions of documents
    const currentDocs = verification.documents.filter(d => d.isCurrent);
    const historyDocs = verification.documents.filter(d => !d.isCurrent);

    const uploadedDocuments = currentDocs.map(doc => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      url: doc.url,
      expiresAt: doc.expiresAt,
      rejectionReason: doc.rejectionReason,
      metadata: doc.metadata,
      version: doc.version,
      updatedAt: doc.updatedAt,
      history: historyDocs
        .filter(h => h.type === doc.type)
        .map(h => ({
          id: h.id,
          status: h.status,
          url: h.url,
          expiresAt: h.expiresAt,
          rejectionReason: h.rejectionReason,
          version: h.version,
          updatedAt: h.updatedAt
        }))
    }));

    const uploadedTypes = uploadedDocuments.map(d => d.type as string);
    const missingRequired = allRequiredTypes.filter(type => !uploadedTypes.includes(type));

    // Calculate progress based on approved required documents
    const totalRequired = allRequiredTypes.length;
    const approvedRequiredCount = uploadedDocuments.filter(d => 
      allRequiredTypes.includes(d.type) && d.status === DocumentStatus.APPROVED
    ).length;
    
    const progressPercentage = totalRequired > 0 ? Math.round((approvedRequiredCount / totalRequired) * 100) : 100;

    return {
      verificationStatus: verification.status,
      rejectionReason: verification.rejectionReason,
      progressPercentage,
      approvedRequiredCount,
      totalRequired,
      basicRequired,
      conditionalRequired,
      optionalTypes,
      uploadedDocuments,
      missingRequired,
      requiresTechnicalInspection,
      additionalRequired,
      updatedAt: verification.updatedAt
    };
  }

  @Get(':type/history')
  @Version('1')
  async getDocumentHistory(
    @CurrentUser('userId') userId: string,
    @Param('type') typeParam: string,
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    const driverId = await this.getDriverId(userId, xDriverId);
    const type = typeParam.toUpperCase() as DocumentType;

    const verification = await this.prisma.driverVerification.findUnique({
      where: { driverId },
      select: { id: true }
    });

    if (!verification) {
      throw new NotFoundException('Verification profile not found');
    }

    const allVersions = await this.prisma.driverDocument.findMany({
      where: {
        verification: { driverId },
        type,
      },
      orderBy: { version: 'asc' },
    });

    // Build timeline events from document versions
    const events = allVersions.flatMap(doc => {
      const evts: Array<{ date: Date; eventType: string; status: string; version: number; rejectionReason?: string | null; url?: string | null }> = [];

      evts.push({
        date: doc.createdAt,
        eventType: 'UPLOADED',
        status: 'UPLOADED',
        version: doc.version,
        url: doc.url,
      });

      if (doc.status === 'PENDING' || doc.status === 'APPROVED' || doc.status === 'REJECTED' || doc.status === 'EXPIRED') {
        evts.push({
          date: doc.updatedAt,
          eventType: doc.status,
          status: doc.status,
          version: doc.version,
          rejectionReason: doc.rejectionReason,
        });
      }

      return evts;
    });

    // Sort chronologically
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const current = allVersions.find(d => d.isCurrent) || null;

    return {
      type,
      current: current ? {
        id: current.id,
        status: current.status,
        url: current.url,
        expiresAt: current.expiresAt,
        rejectionReason: current.rejectionReason,
        version: current.version,
        updatedAt: current.updatedAt,
        createdAt: current.createdAt,
      } : null,
      events,
    };
  }

  @Post('upload')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { type: string; expiresAt?: string; metadata?: string },
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    const driverId = await this.getDriverId(userId, xDriverId);
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const typeStr = body.type?.toUpperCase();
    if (!typeStr || !Object.values(DocumentType).includes(typeStr as any)) {
      throw new BadRequestException(`Invalid or empty document type: ${body.type}`);
    }

    const type = typeStr as DocumentType;

    // Check if the current document is already approved
    const existingApproved = await this.prisma.driverDocument.findFirst({
      where: {
        verification: { driverId },
        type,
        status: DocumentStatus.APPROVED,
        isCurrent: true
      }
    });

    if (existingApproved) {
      throw new BadRequestException('Cannot replace an already APPROVED document. Please contact support.');
    }

    // Call service to perform file upload, db logging and versioning
    const doc = await this.verificationService.uploadDocument(driverId, type, file);

    // Update with extra payload fields: expiresAt, side, metadata, etc.
    let parsedMetadata: any = null;
    if (body.metadata) {
      try {
        parsedMetadata = JSON.parse(body.metadata);
      } catch (e) {
        parsedMetadata = { raw: body.metadata };
      }
    }

    const updatedDoc = await this.prisma.driverDocument.update({
      where: { id: doc.id },
      data: {
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        metadata: parsedMetadata || undefined
      }
    });

    // Invalidate verification status to PENDING if not there already
    const verification = await this.prisma.driverVerification.findUnique({
      where: { driverId }
    });
    if (verification && verification.status === DriverVerificationStatus.REJECTED) {
      await this.prisma.driverVerification.update({
        where: { id: verification.id },
        data: { status: DriverVerificationStatus.PENDING }
      });
    }

    return updatedDoc;
  }

  @Patch(':type')
  @Version('1')
  async patchDocument(
    @CurrentUser('userId') userId: string,
    @Param('type') typeParam: string,
    @Body() body: { expiresAt?: string; metadata?: any },
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    const driverId = await this.getDriverId(userId, xDriverId);
    const type = typeParam.toUpperCase() as DocumentType;

    // Get current version
    const doc = await this.prisma.driverDocument.findFirst({
      where: {
        verification: { driverId },
        type,
        isCurrent: true
      }
    });

    if (!doc) {
      throw new NotFoundException(`No active document of type ${type} found`);
    }

    const updateData: any = {};
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }
    if (body.metadata !== undefined) {
      updateData.metadata = body.metadata;
    }

    return this.prisma.driverDocument.update({
      where: { id: doc.id },
      data: updateData
    });
  }

  @Delete(':type')
  @Version('1')
  async deleteDocument(
    @CurrentUser('userId') userId: string,
    @Param('type') typeParam: string,
    @Headers('x-driver-id') xDriverId?: string,
  ) {
    const driverId = await this.getDriverId(userId, xDriverId);
    const type = typeParam.toUpperCase() as DocumentType;

    const doc = await this.prisma.driverDocument.findFirst({
      where: {
        verification: { driverId },
        type,
        isCurrent: true
      }
    });

    if (!doc) {
      throw new NotFoundException(`No active document of type ${type} found to delete`);
    }

    // Rule: Approved documents cannot be deleted
    if (doc.status === DocumentStatus.APPROVED) {
      throw new BadRequestException('Cannot delete an already APPROVED document');
    }

    // Perform deleting current flag
    await this.prisma.driverDocument.update({
      where: { id: doc.id },
      data: { isCurrent: false }
    });

    // Find previous version to restore as isCurrent if exists
    const prevDoc = await this.prisma.driverDocument.findFirst({
      where: {
        verification: { driverId },
        type,
        version: doc.version - 1
      }
    });

    if (prevDoc) {
      await this.prisma.driverDocument.update({
        where: { id: prevDoc.id },
        data: { isCurrent: true }
      });
    }

    return { success: true };
  }
}
