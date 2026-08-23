import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserTrashService } from './admin-user-trash.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SessionService } from '../../../identity/application/services/session.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserStatus, UserRole } from '@prisma/client';

describe('AdminUserTrashService (Lifecycle & Safety Guards)', () => {
  let service: AdminUserTrashService;
  let prisma: any;
  let sessionService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      driver: {
        delete: jest.fn(),
      },
      pushToken: { deleteMany: jest.fn() },
      notification: { deleteMany: jest.fn() },
      driverLocationHistory: { deleteMany: jest.fn() },
      driverVerification: { findUnique: jest.fn(), delete: jest.fn() },
      verificationEvent: { deleteMany: jest.fn() },
      driverDocument: { deleteMany: jest.fn() },
      driverAccount: { deleteMany: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    sessionService = {
      revokeAllUserSessions: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserTrashService,
        { provide: PrismaService, useValue: prisma },
        { provide: SessionService, useValue: sessionService },
      ],
    }).compile();

    service = module.get<AdminUserTrashService>(AdminUserTrashService);
  });

  describe('Safety Guards', () => {
    it('should throw BadRequestException if userIds is empty', async () => {
      await expect(service.permanentDeleteUsers([])).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if targeted user is NOT in TRASHED status', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await expect(service.permanentDeleteUsers(['user-active-123'])).rejects.toThrow(NotFoundException);
    });
  });

  describe('Path A: Physical Cascade Delete (Account with NO history)', () => {
    it('should physically delete user and driver from database when ride history count is 0', async () => {
      const mockSyntheticUser = {
        id: 'synthetic-user-1',
        fullName: 'LoadTest Driver 1',
        phoneNumber: '+212600000001',
        role: UserRole.DRIVER,
        status: UserStatus.TRASHED,
        deletedAt: new Date(),
        deletedBy: 'admin-1',
        deletedFromStatus: UserStatus.ACTIVE,
        _count: { customerRides: 0 },
        driverProfile: {
          id: 'driver-prof-1',
          _count: {
            rides: 0,
            transactions: 0,
            ledgerEntries: 0,
            withdrawals: 0,
          },
        },
      };

      prisma.user.findMany.mockResolvedValue([mockSyntheticUser]);
      prisma.driverVerification.findUnique.mockResolvedValue({ id: 'verif-1' });

      const result = await service.permanentDeleteUsers(['synthetic-user-1']);

      expect(result.success).toBe(true);
      expect(result.physicallyDeletedCount).toBe(1);
      expect(result.anonymizedCount).toBe(0);

      // Verify physical cascading delete operations
      expect(prisma.pushToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'synthetic-user-1' } });
      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: 'synthetic-user-1' } });
      expect(prisma.driverLocationHistory.deleteMany).toHaveBeenCalledWith({ where: { driverId: 'driver-prof-1' } });
      expect(prisma.verificationEvent.deleteMany).toHaveBeenCalledWith({ where: { verificationId: 'verif-1' } });
      expect(prisma.driverDocument.deleteMany).toHaveBeenCalledWith({ where: { verificationId: 'verif-1' } });
      expect(prisma.driverVerification.delete).toHaveBeenCalledWith({ where: { id: 'verif-1' } });
      expect(prisma.driverAccount.deleteMany).toHaveBeenCalledWith({ where: { driverId: 'driver-prof-1' } });
      expect(prisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'driver-prof-1' } });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'synthetic-user-1' } });
    });
  });

  describe('Path B: Anonymization & Terminal Hidden State (Account WITH history)', () => {
    it('should anonymize PII and set status = SUSPENDED when user has ride history', async () => {
      const mockHistoricalUser = {
        id: 'historical-user-2',
        fullName: 'Real Test Driver',
        phoneNumber: '+212661234567',
        role: UserRole.DRIVER,
        status: UserStatus.TRASHED,
        deletedAt: new Date(),
        deletedBy: 'admin-1',
        deletedFromStatus: UserStatus.ACTIVE,
        _count: { customerRides: 5 },
        driverProfile: {
          id: 'driver-prof-2',
          _count: {
            rides: 10,
            transactions: 10,
            ledgerEntries: 10,
            withdrawals: 0,
          },
        },
      };

      prisma.user.findMany.mockResolvedValue([mockHistoricalUser]);

      const result = await service.permanentDeleteUsers(['historical-user-2']);

      expect(result.success).toBe(true);
      expect(result.physicallyDeletedCount).toBe(0);
      expect(result.anonymizedCount).toBe(1);

      // Verify physical deletion was NOT called for user row
      expect(prisma.user.delete).not.toHaveBeenCalled();

      // Verify PII anonymization & SUSPENDED state
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'historical-user-2' },
        data: expect.objectContaining({
          fullName: expect.stringMatching(/^Deleted User \(histor\)$/),
          phoneNumber: expect.stringMatching(/^deleted_\d+_histor$/),
          email: null,
          status: UserStatus.SUSPENDED,
        }),
      });
    });
  });
});
