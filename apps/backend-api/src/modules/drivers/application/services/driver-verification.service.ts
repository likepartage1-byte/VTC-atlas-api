import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DriverVerificationStatus, VerificationEventType, DocumentStatus } from '@prisma/client';

@Injectable()
export class DriverVerificationService {
  private readonly logger = new Logger(DriverVerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

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

    const presentTypes = verification.documents.map((d) => d.type);
    const missingDocuments = requiredTypes.filter((t) => !presentTypes.includes(t as any));

    return {
      status: verification.status,
      missingDocuments,
      documents: verification.documents,
      rejectionReason: verification.rejectionReason,
    };
  }
}
