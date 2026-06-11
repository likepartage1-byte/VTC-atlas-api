import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class RideLedgerService {
  private readonly logger = new Logger(RideLedgerService.name);
  private readonly COMPANY_FEE_RATE = 0.20; // 20% Fee

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finalizes the financial aspect of a ride.
   * Creates a ledger entry and updates driver balance.
   *
   * Guards:
   * - Ride must be COMPLETED (prevents settlement on active/cancelled rides)
   * - Idempotent: if ledger record exists, returns gracefully
   */
  async settleRide(rideId: string): Promise<void> {
    this.logger.log(`Settling financials for ride: ${rideId}`);

    await this.prisma.$transaction(async (tx) => {
      // 1. Get ride details
      const ride = await tx.ride.findUniqueOrThrow({
        where: { id: rideId },
      });

      // GUARD: Ride must be in COMPLETED state
      if (ride.status !== 'COMPLETED') {
        throw new BadRequestException(
          `Cannot settle ride ${rideId}: status is ${ride.status}, expected COMPLETED.`,
        );
      }

      if (!ride.driverId) throw new Error('Cannot settle ride without a driver.');

      // IDEMPOTENCY: Check if already settled (graceful, no exception)
      const existingLedger = await tx.rideLedger.findUnique({
        where: { rideId },
      });

      if (existingLedger) {
        this.logger.warn(`Idempotency: Ledger already exists for ride [${rideId}]. Skipping.`);
        return;
      }
      
      const totalAmount = Number(ride.actualPrice || ride.estimatedPrice);
      const companyFee = totalAmount * this.COMPANY_FEE_RATE;
      const driverEarnings = totalAmount - companyFee;

      // 2. Create Ledger Record (Immutable Proof)
      await tx.rideLedger.create({
        data: {
          rideId: ride.id,
          driverId: ride.driverId,
          totalAmount,
          companyFee,
          driverEarnings,
          taxes: 0, // Simplified for now
          status: 'PROCESSED',
          settledAt: new Date(),
        },
      });

      // 3. Update Driver Account Balance
      await tx.driverAccount.upsert({
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

      this.logger.log(`Financial settlement complete for ride [${rideId}]. Driver [${ride.driverId}] earned ${driverEarnings} MAD`);
    });
  }
}
