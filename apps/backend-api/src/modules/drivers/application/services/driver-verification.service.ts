import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DriverVerificationStatus, VerificationEventType, DocumentStatus, DocumentType } from '@prisma/client';
import { LocalStorageProvider } from '../../infrastructure/storage/storage.provider';
import * as path from 'path';

@Injectable()
export class DriverVerificationService {
  private readonly logger = new Logger(DriverVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalStorageProvider,
  ) {}

  /**
   * Initializes a verification record for a new driver.
   */
  async initializeVerification(driverId: string, tx?: any) {
    const prisma = tx || this.prisma;

    const existing = await prisma.driverVerification.findUnique({
      where: { driverId },
    });

    if (existing) return existing;

    const verification = await prisma.driverVerification.create({
      data: {
        driverId,
        status: DriverVerificationStatus.PENDING,
      },
    });

    await this.logEvent(verification.id, {
      type: VerificationEventType.SUBMITTED,
      reason: 'Driver onboarding - verification initialized',
    }, tx);

    return verification;
  }

  /**
   * Records a verification event for auditing.
   */
  async logEvent(
    verificationId: string,
    data: {
      type: VerificationEventType;
      statusFrom?: DriverVerificationStatus;
      statusTo?: DriverVerificationStatus;
      reason?: string;
      actorId?: string;
      actorType?: string;
      metadata?: any;
    },
    tx?: any
  ) {
    const prisma = tx || this.prisma;

    return prisma.verificationEvent.create({
      data: {
        verificationId,
        eventType: data.type,
        statusFrom: data.statusFrom,
        statusTo: data.statusTo,
        reason: data.reason,
        actorId: data.actorId,
        actorType: data.actorType || 'SYSTEM',
        metadata: data.metadata,
      },
    });
  }

  /**
   * Returns the verification status and missing documents for a driver.
   */
  async getVerificationSummary(driverId: string) {
    const verification = await this.prisma.driverVerification.findUnique({
      where: { driverId },
      include: {
        documents: {
          where: { isCurrent: true },
        },
      },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    const requiredTypes = [
      'IDENTITY_CARD',
      'DRIVING_LICENSE',
      'CARTE_GRISE',
      'INSURANCE_POLICY',
      'PROFILE_PHOTO',
    ];

    const currentDocuments = verification.documents.map(doc => ({
      type: doc.type,
      status: doc.status,
      url: doc.url,
      expiresAt: doc.expiresAt,
      rejectionReason: doc.rejectionReason,
      updatedAt: doc.updatedAt
    }));

    const presentTypes = currentDocuments.map((d) => d.type);
    const missingDocuments = requiredTypes.filter((t) => !presentTypes.includes(t as any));

    return {
      status: verification.status,
      rejectionReason: verification.rejectionReason,
      missingDocuments,
      uploadedDocuments: currentDocuments,
      isComplete: missingDocuments.length === 0,
      updatedAt: verification.updatedAt
    };
  }

  /**
   * Handles document upload, versioning, and status update.
   */
  async uploadDocument(driverId: string, type: DocumentType, file: Express.Multer.File) {
    const verification = await this.prisma.driverVerification.findUnique({
      where: { driverId },
      include: { documents: { where: { type, isCurrent: true } } }
    });

    if (!verification) {
      throw new NotFoundException('Verification record not initialized');
    }

    const currentVersion = verification.documents[0];
    const newVersionNumber = currentVersion ? currentVersion.version + 1 : 1;

    // Generate unique storage key: drivers/{driverId}/{type}_v{version}.{ext}
    const ext = path.extname(file.originalname) || '.jpg';
    const storageKey = `drivers/${driverId}/${type.toLowerCase()}_v${newVersionNumber}${ext}`;

    const { url, storageKey: finalKey } = await this.storage.uploadFile(file, storageKey);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Mark previous version as not current
      if (currentVersion) {
        await tx.driverDocument.update({
          where: { id: currentVersion.id },
          data: { isCurrent: false },
        });
      }

      // 2. Create new document record
      const doc = await tx.driverDocument.create({
        data: {
          verificationId: verification.id,
          type,
          status: DocumentStatus.PENDING,
          storageProvider: 'LOCAL',
          storageKey: finalKey,
          url,
          mimeType: file.mimetype,
          fileSize: file.size,
          version: newVersionNumber,
          isCurrent: true,
        },
      });

      // 3. Update verification status if it was REJECTED
      if (verification.status === DriverVerificationStatus.REJECTED) {
        await tx.driverVerification.update({
          where: { id: verification.id },
          data: { status: DriverVerificationStatus.PENDING },
        });
      }

      // 4. Log event
      await this.logEvent(verification.id, {
        type: VerificationEventType.DOCUMENT_REPLACED,
        reason: `Uploaded new version of ${type}`,
        metadata: { docId: doc.id, version: newVersionNumber },
      }, tx);

      return doc;
    });
  }

  /**
   * Admin action to update the overall verification status.
   */
  async reviewVerification(
    verificationId: string,
    status: DriverVerificationStatus,
    reason?: string,
    adminId?: string
  ) {
    const verification = await this.prisma.driverVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) throw new NotFoundException('Verification not found');

    const updated = await this.prisma.driverVerification.update({
      where: { id: verificationId },
      data: {
        status,
        rejectionReason: status === DriverVerificationStatus.REJECTED ? reason : null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    const eventType = status === DriverVerificationStatus.APPROVED ? VerificationEventType.APPROVED : VerificationEventType.REJECTED;

    await this.logEvent(verificationId, {
      type: eventType,
      statusFrom: verification.status,
      statusTo: status,
      reason,
      actorId: adminId,
      actorType: 'ADMIN',
    });

    return updated;
  }

  /**
   * Admin action to approve/reject an individual document.
   */
  async reviewDocument(
    documentId: string,
    status: DocumentStatus,
    reason?: string,
    adminId?: string
  ) {
    const doc = await this.prisma.driverDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedDoc = await tx.driverDocument.update({
        where: { id: documentId },
        data: {
          status,
          rejectionReason: status === DocumentStatus.REJECTED ? reason : null,
        },
      });

      // Log specific event
      await this.logEvent(doc.verificationId, {
        type: status === DocumentStatus.APPROVED ? VerificationEventType.APPROVED : VerificationEventType.REJECTED,
        reason: `Document ${doc.type} reviewed: ${status}. ${reason || ''}`,
        actorId: adminId,
        actorType: 'ADMIN',
        metadata: { docId: documentId, type: doc.type },
      }, tx);

      return updatedDoc;
    });
  }

  /**
   * Lists drivers awaiting review.
   */
  async listPendingVerifications() {
    return this.prisma.driverVerification.findMany({
      where: {
        status: { in: [DriverVerificationStatus.PENDING, DriverVerificationStatus.UNDER_REVIEW] }
      },
      include: {
        driver: {
          include: { user: { select: { fullName: true, phoneNumber: true } } }
        },
        documents: { where: { isCurrent: true } }
      },
      orderBy: { updatedAt: 'asc' }
    });
  }
}
