import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SessionService } from '../../../identity/application/services/session.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminUserTrashService {
  private readonly logger = new Logger(AdminUserTrashService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Move array of user IDs to Trash.
   * - Saves deletedFromStatus = current user.status
   * - Sets status = TRASHED, deletedAt = now, deletedBy = adminId
   * - Revokes active sessions & clears targeted single-user Redis presence
   */
  async bulkTrashUsers(userIds: string[], adminId: string) {
    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('userIds array cannot be empty.');
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { id: { in: userIds } },
          { driverProfile: { id: { in: userIds } } },
        ],
      },
      include: { driverProfile: true },
    });

    if (users.length === 0) {
      throw new NotFoundException('No matching users found.');
    }

    const updatedResults: any[] = [];

    for (const user of users) {
      const currentStatus = user.status;
      const driverId = user.driverProfile?.id;

      // 1. Update user record to TRASHED state in Database (strict, unhandled DB errors throw)
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.TRASHED,
          deletedAt: new Date(),
          deletedBy: adminId,
          deletedFromStatus: currentStatus,
        },
      });

      // 2. Target single-user session & presence wipe (non-blocking warning on Redis cleanup error)
      try {
        await this.sessionService.revokeAllUserSessions(user.id, driverId);
      } catch (redisErr: any) {
        this.logger.warn(
          `[AdminUserTrash] Redis session cleanup warning for user ${user.id}: ${redisErr.message}`
        );
      }

      updatedResults.push(updatedUser);
    }

    this.logger.log(`[AdminUserTrash] Soft trashed ${updatedResults.length} users by Admin [${adminId}]`);
    return {
      success: true,
      count: updatedResults.length,
      message: `${updatedResults.length} users moved to trash bin.`,
    };
  }

  /**
   * Restore array of user IDs from Trash.
   * - Reverts status to deletedFromStatus (or ACTIVE fallback)
   * - Clears deletedAt, deletedBy, deletedFromStatus
   * - ZERO changes to ride history or financial records
   */
  async bulkRestoreUsers(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('userIds array cannot be empty.');
    }

    const users = await this.prisma.user.findMany({
      where: {
        status: UserStatus.TRASHED,
        OR: [
          { id: { in: userIds } },
          { driverProfile: { id: { in: userIds } } },
        ],
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('No trashed users found matching criteria.');
    }

    const restoredResults: any[] = [];

    for (const user of users) {
      const restoredStatus = user.deletedFromStatus || UserStatus.ACTIVE;

      const restoredUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: restoredStatus,
          deletedAt: null,
          deletedBy: null,
          deletedFromStatus: null,
        },
      });

      restoredResults.push(restoredUser);
    }

    this.logger.log(`[AdminUserTrash] Restored ${restoredResults.length} users from trash bin`);
    return {
      success: true,
      count: restoredResults.length,
      message: `${restoredResults.length} users restored from trash bin.`,
    };
  }

  /**
   * Standalone Session & Redis Cache Wipe (without moving to Trash)
   * - Forces logout across all devices
   * - Clears Redis presence & GEO set for targeted single user
   * - User remains ACTIVE in database with ride history 100% untouched
   */
  async bulkWipeSessions(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('userIds array cannot be empty.');
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { id: { in: userIds } },
          { driverProfile: { id: { in: userIds } } },
        ],
      },
      include: { driverProfile: true },
    });

    for (const user of users) {
      const driverId = user.driverProfile?.id;
      await this.sessionService.revokeAllUserSessions(user.id, driverId);
    }

    this.logger.log(`[AdminUserTrash] Wiped sessions for ${users.length} users`);
    return {
      success: true,
      count: users.length,
      message: `Sessions and presence wiped for ${users.length} users.`,
    };
  }

  /**
   * Fetch items currently in Trash Bin
   */
  async getTrashBinItems() {
    const trashedUsers = await this.prisma.user.findMany({
      where: { status: UserStatus.TRASHED },
      include: {
        driverProfile: true,
        _count: {
          select: {
            customerRides: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });

    const passengers = trashedUsers
      .filter((u) => u.role === 'PASSENGER')
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        email: u.email,
        role: u.role,
        deletedAt: u.deletedAt,
        deletedBy: u.deletedBy,
        deletedFromStatus: u.deletedFromStatus,
        totalTrips: u._count.customerRides,
      }));

    const drivers = trashedUsers
      .filter((u) => u.role === 'DRIVER' || u.driverProfile != null)
      .map((u) => ({
        id: u.id,
        driverId: u.driverProfile?.id,
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        email: u.email,
        role: u.role,
        rating: u.driverProfile?.rating || 5.0,
        deletedAt: u.deletedAt,
        deletedBy: u.deletedBy,
        deletedFromStatus: u.deletedFromStatus,
      }));

    return {
      passengers,
      drivers,
      totalCount: trashedUsers.length,
    };
  }

  /**
   * Permanent Delete with Safe PII Anonymization
   * - Anonymizes personal info (fullName, phoneNumber, email, avatar, fcmToken)
   * - Releases real phone number for fresh re-registration
   * - PRESERVES User record ID, Ride history, and RideLedger foreign keys 100% intact
   */
  /**
   * Permanent Delete with Safe Cascade or PII Anonymization
   * - Strict Guard: Target users MUST be in TRASHED status and cannot be ADMIN.
   * - Path A (No Ride/Financial History): True physical database deletion via cascading transaction.
   * - Path B (Has Ride/Financial History): PII anonymization + Terminal SUSPENDED state (permanently excluded from fleet).
   */
  async permanentDeleteUsers(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      throw new BadRequestException('userIds array cannot be empty.');
    }

    const users = await this.prisma.user.findMany({
      where: {
        status: UserStatus.TRASHED,
        role: { not: 'ADMIN' },
        OR: [
          { id: { in: userIds } },
          { driverProfile: { id: { in: userIds } } },
        ],
      },
      include: {
        driverProfile: {
          include: {
            _count: {
              select: {
                rides: true,
                transactions: true,
                ledgerEntries: true,
                withdrawals: true,
              },
            },
          },
        },
        _count: {
          select: {
            customerRides: true,
          },
        },
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('No eligible trashed users found for permanent deletion.');
    }

    let physicallyDeletedCount = 0;
    let anonymizedCount = 0;

    for (const user of users) {
      const passengerRidesCount = user._count.customerRides || 0;
      const driverProfile = user.driverProfile;
      const driverRidesCount = driverProfile?._count?.rides || 0;
      const driverTxCount = driverProfile?._count?.transactions || 0;
      const driverLedgerCount = driverProfile?._count?.ledgerEntries || 0;
      const driverWithdrawalCount = driverProfile?._count?.withdrawals || 0;

      const hasHistory =
        passengerRidesCount > 0 ||
        driverRidesCount > 0 ||
        driverTxCount > 0 ||
        driverLedgerCount > 0 ||
        driverWithdrawalCount > 0;

      if (!hasHistory) {
        // Path A: Physical Cascade Delete
        await this.prisma.$transaction(async (tx) => {
          await tx.pushToken.deleteMany({ where: { userId: user.id } });
          await tx.notification.deleteMany({ where: { userId: user.id } });

          if (driverProfile) {
            const driverId = driverProfile.id;
            await tx.driverLocationHistory.deleteMany({ where: { driverId } });

            const verification = await tx.driverVerification.findUnique({
              where: { driverId },
            });
            if (verification) {
              await tx.verificationEvent.deleteMany({
                where: { verificationId: verification.id },
              });
              await tx.driverDocument.deleteMany({
                where: { verificationId: verification.id },
              });
              await tx.driverVerification.delete({
                where: { id: verification.id },
              });
            }

            await tx.driverAccount.deleteMany({ where: { driverId } });
            await tx.driver.delete({ where: { id: driverId } });
          }

          await tx.user.delete({ where: { id: user.id } });
        });

        physicallyDeletedCount++;
        this.logger.log(`[AdminUserTrash] Physically deleted user [${user.id}] (${user.fullName}) from database.`);
      } else {
        // Path B: Anonymization & Terminal Hidden State
        const anonTag = `deleted_${Date.now()}_${user.id.slice(0, 6)}`;
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            fullName: `Deleted User (${user.id.slice(0, 6)})`,
            phoneNumber: anonTag,
            email: null,
            fcmToken: null,
            avatar: null,
            address: null,
            city: null,
            firstName: null,
            lastName: null,
            status: UserStatus.SUSPENDED,
            deletedAt: user.deletedAt || new Date(),
            deletedBy: user.deletedBy,
            deletedFromStatus: UserStatus.TRASHED,
          },
        });

        anonymizedCount++;
        this.logger.log(`[AdminUserTrash] Anonymized user [${user.id}] preserving historical ride/ledger data.`);
      }
    }

    const totalCount = physicallyDeletedCount + anonymizedCount;
    return {
      success: true,
      count: totalCount,
      physicallyDeletedCount,
      anonymizedCount,
      message: `${physicallyDeletedCount} user(s) physically deleted from database, ${anonymizedCount} user(s) anonymized with historical records preserved.`,
    };
  }

  /**
   * Empty entire Trash Bin
   */
  async emptyTrash() {
    const trashedUsers = await this.prisma.user.findMany({
      where: { status: UserStatus.TRASHED },
      select: { id: true },
    });

    if (trashedUsers.length === 0) {
      return { success: true, count: 0, message: 'Trash bin is already empty.' };
    }

    const ids = trashedUsers.map((u) => u.id);
    return this.permanentDeleteUsers(ids);
  }
}
