import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. REQUEST WITHDRAWAL
   * Logic: Ensure available balance >= amount, then lock it.
   */
  async requestWithdrawal(driverId: string, amount: number, bankDetails: any) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return await this.prisma.$transaction(async (tx) => {
      const account = await tx.driverAccount.findUnique({
        where: { driverId },
      });

      if (!account) throw new NotFoundException('Driver account not found');

      const availableBalance = Number(account.balance) - Number(account.lockedBalance);

      if (availableBalance < amount) {
        throw new BadRequestException(`Insufficient funds. Available: ${availableBalance} MAD`);
      }

      // Lock the balance
      await tx.driverAccount.update({
        where: { driverId },
        data: {
          lockedBalance: { increment: amount },
        },
      });

      // Create Request
      return await tx.withdrawalRequest.create({
        data: {
          driverId,
          amount,
          bankDetails,
          status: 'PENDING',
        },
      });
    });
  }

  /**
   * 2. REJECT WITHDRAWAL
   * Logic: Release the locked balance back to available.
   */
  async rejectWithdrawal(requestId: string, reason: string, adminId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const request = await tx.withdrawalRequest.findUnique({
        where: { id: requestId },
      });

      if (!request || request.status !== 'PENDING') {
        throw new BadRequestException('Request not found or not in PENDING state');
      }

      // Unlock balance
      await tx.driverAccount.update({
        where: { driverId: request.driverId },
        data: {
          lockedBalance: { decrement: request.amount },
        },
      });

      // Update request status
      return await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          adminId,
          processedAt: new Date(),
        },
      });
    });
  }

  /**
   * 3. MARK AS PAID (The Final Settlement)
   * Logic: Real balance deduction and audit trail creation.
   */
  async markAsPaid(requestId: string, adminId: string, notes?: string) {
    return await this.prisma.$transaction(async (tx) => {
      const request = await tx.withdrawalRequest.findUnique({
        where: { id: requestId },
      });

      if (!request || request.status !== 'PENDING') {
        throw new BadRequestException('Request not found or not in PENDING state');
      }

      const amount = Number(request.amount);

      // Final Balance Deduction
      await tx.driverAccount.update({
        where: { driverId: request.driverId },
        data: {
          balance: { decrement: amount },
          lockedBalance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      });

      // Create Financial Transaction (The Audit Trail)
      await tx.driverTransaction.create({
        data: {
          driverId: request.driverId,
          type: 'DEBIT',
          amount: amount,
          status: 'COMPLETED',
          referenceId: request.id,
          referenceType: 'WITHDRAWAL_PAID',
          description: `Withdrawal payout for request ${request.id}`,
          metadata: { adminId, notes },
        },
      });

      // Update Request
      return await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          processedAt: new Date(),
          adminId,
          notes,
        },
      });
    });
  }

  async getDriverRequests(driverId: string) {
    return this.prisma.withdrawalRequest.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminPendingRequests() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        driver: {
          include: { user: { select: { fullName: true, phoneNumber: true } } }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
