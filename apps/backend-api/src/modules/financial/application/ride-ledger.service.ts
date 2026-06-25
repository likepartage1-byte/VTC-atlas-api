import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SystemSettingsService } from '../../admin/application/services/system-settings.service';

@Injectable()
export class RideLedgerService {
  private readonly logger = new Logger(RideLedgerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SystemSettingsService,
  ) {}

  /**
   * Finalizes the financial aspect of a ride.
   * Creates a ledger entry and updates driver balance.
   *
   * Guards:
   * - Ride must be COMPLETED (prevents settlement on active/cancelled rides)
   * - Idempotent: if ledger record exists, returns gracefully
   */
  async settleRide(rideId: string, tx?: any): Promise<void> {
    this.logger.log(`Settling financials for ride: ${rideId}`);

    const executeSettlement = async (prismaClient: any) => {
      // 1. Get ride details
      const ride = await prismaClient.ride.findUniqueOrThrow({
        where: { id: rideId },
      });

      // GUARD: Ride must be in COMPLETED state
      if (ride.status !== 'COMPLETED') {
        throw new BadRequestException(
          `Cannot settle ride ${rideId}: status is ${ride.status}, expected COMPLETED.`,
        );
      }

      if (!ride.driverId) throw new Error('Cannot settle ride without a driver.');

      // IDEMPOTENCY: Check if already settled
      const existingLedger = await prismaClient.rideLedger.findUnique({
        where: { rideId },
      });

      if (existingLedger) {
        this.logger.warn(`Idempotency: Ledger already exists for ride [${rideId}]. Skipping.`);
        return;
      }
      
      const commissionRate = await this.settings.getCommissionRate();
      const totalAmount = Number(ride.actualPrice || ride.estimatedPrice);
      const companyFee = totalAmount * commissionRate;
      const driverEarnings = totalAmount - companyFee;

      // 2. Create Ledger Record (Immutable Proof)
      await prismaClient.rideLedger.create({
        data: {
          rideId: ride.id,
          driverId: ride.driverId,
          totalAmount,
          companyFee,
          driverEarnings,
          taxes: 0,
          status: 'PROCESSED',
          settledAt: new Date(),
        },
      });

      // 3. Update Driver Account Balance
      await prismaClient.driverAccount.upsert({
        where: { driverId: ride.driverId },
        update: {
          balance: { increment: driverEarnings },
          totalEarned: { increment: driverEarnings },
        },
        create: {
          driverId: ride.driverId,
          balance: driverEarnings,
          totalEarned: driverEarnings,
        },
      });

      this.logger.log(`Financial settlement complete for ride [${rideId}]. Rate: ${commissionRate * 100}%, Driver earned ${driverEarnings} MAD`);
    };

    if (tx) {
      await executeSettlement(tx);
    } else {
      await this.prisma.$transaction(async (newTx) => {
        await executeSettlement(newTx);
      });
    }
  }
}
