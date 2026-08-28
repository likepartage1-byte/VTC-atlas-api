// ============================================================
// Domain: Drivers
// Layer: Application
// Responsibility: Ride Acceptance (Atomic Commission Debit Pipeline)
// ============================================================
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { BaseApplicationService } from '../../../core/common/base-application.service';
import { DomainEventBus } from '../../../core/events/domain-event-bus';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';
import { DispatchEngine } from '../../dispatch/application/dispatch.engine';
import { RideStatusChangedEvent } from '../../rides/domain/events/ride-status-changed.event';
import { RideStateMachine } from '../../rides/domain/state-machine/ride-state-machine';

import { DriverEligibilityService } from './services/driver-eligibility.service';
import { InsufficientBalanceException } from '../../../core/exceptions/insufficient-balance.exception';

export interface AcceptRideOptions {
  agreedPrice?: number;
  isNegotiationAccepted?: boolean;
}

export interface AcceptRideResponse {
  success: boolean;
  rideId: string;
  agreedPrice: number;
  commissionRate: number;
  commissionAmount: number;
  driverNetEarnings: number;
  newBalance: number;
}

@Injectable()
export class DriverAcceptanceService extends BaseApplicationService {
  private readonly logger = new Logger(DriverAcceptanceService.name);

  constructor(
    eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly dispatchEngine: DispatchEngine,
    private readonly eligibility: DriverEligibilityService,
  ) {
    super(eventBus);
  }

  /**
   * Strong Consistency Single Source of Truth Acceptance Pipeline:
   * Eligibility Gate → Claim/Lock Gate → Atomic DB Wallet Commission Debit Transaction → GEO Eviction → Domain Event
   */
  async acceptRide(
    userIdOrDriverId: string,
    rideId: string,
    options?: AcceptRideOptions,
  ): Promise<AcceptRideResponse> {
    this.logger.log(`Driver [${userIdOrDriverId}] attempting ACCEPT for Ride [${rideId}] (options: ${JSON.stringify(options ?? {})})`);

    const driver = await this.prisma.driver.findFirst({
      where: { OR: [{ id: userIdOrDriverId }, { userId: userIdOrDriverId }] },
    });
    if (!driver) throw new ConflictException('Driver profile not found.');
    const driverId = driver.id;

    // 0. Eligibility Check (Security Gate)
    const canAccept = await this.eligibility.canReceiveRides(driverId);
    if (!canAccept) {
      this.logger.warn(`Rejected acceptance: Driver [${driverId}] is not eligible (KYC/Account).`);
      throw new ConflictException('You are not eligible to accept rides. Please check your verification status.');
    }

    // 1. Race Protection & Claim/Lock Validation
    if (!options?.isNegotiationAccepted) {
      const isClaimValid = await this.dispatchEngine.validateAndConsume(rideId, driverId);
      if (!isClaimValid) {
        this.logger.warn(`Stale/missing claim: Driver [${driverId}] / Ride [${rideId}]`);
        throw new ConflictException('Ride is no longer available or claim has expired.');
      }
    } else {
      // Distributed Lock for Negotiation Acceptance
      const lockKey = `lock:ride_assignment:${rideId}`;
      const acquired = await this.redis.getClient().set(lockKey, driverId, 'EX', 5, 'NX');
      if (acquired !== 'OK') {
        this.logger.warn(`Race condition detected: Driver [${driverId}] failed lock for Ride [${rideId}]`);
        throw new ConflictException('Désolé, cette course est en cours de traitement.');
      }
    }

    try {
      // 2. Atomic DB Transaction (Wallet Balance + 10% Commission Debit + Ride State Transition)
      const result = await this.prisma.$transaction(async (tx) => {
        const ride = await tx.ride.findUniqueOrThrow({ where: { id: rideId } });

        // Idempotency Guard: Avoid double deduction if driver taps Accept multiple times quickly
        if (ride.status === 'DRIVER_ACCEPTED') {
          if (ride.driverId === driverId) {
            this.logger.log(`Ride [${rideId}] was already accepted by Driver [${driverId}]. Returning idempotent state.`);
            const acc = await tx.driverAccount.findUnique({ where: { driverId } });
            const agreedPrice = Number(ride.actualPrice ?? ride.estimatedPrice ?? 0);
            const comm = Math.round(agreedPrice * 0.10 * 100) / 100;
            return {
              success: true,
              rideId,
              agreedPrice,
              commissionRate: 0.10,
              commissionAmount: comm,
              driverNetEarnings: Math.round((agreedPrice - comm) * 100) / 100,
              newBalance: Number(acc?.balance ?? 0),
            };
          } else {
            throw new ConflictException('Ride has already been accepted by another driver.');
          }
        }

        // State Machine Transition Check (supports REQUESTED -> DRIVER_ACCEPTED & DISPATCHED -> DRIVER_ACCEPTED)
        RideStateMachine.transition(ride.status as any, 'DRIVER_ACCEPTED');

        // Financial Calculation: Agreed Price & 10% Platform Commission
        const agreedPriceNum = Number(
          options?.agreedPrice !== undefined && Number.isFinite(options.agreedPrice) && options.agreedPrice >= 5
            ? options.agreedPrice
            : (ride.actualPrice ?? ride.estimatedPrice ?? 0)
        );

        const commissionRate = 0.10; // 10% Platform Commission
        const requiredCommissionNum = Math.round(agreedPriceNum * commissionRate * 100) / 100;
        const driverNetEarningsNum = Math.round((agreedPriceNum - requiredCommissionNum) * 100) / 100;

        // Fetch or Create Driver Wallet Account
        let driverAccount = await tx.driverAccount.findUnique({ where: { driverId } });
        if (!driverAccount) {
          driverAccount = await tx.driverAccount.create({
            data: {
              driverId,
              balance: 100.00, // Seed default balance for active drivers
            },
          });
        }

        const currentBalanceNum = Number(driverAccount.balance);

        // Balance Gate: Enforce Wallet Balance >= 10% Commission BEFORE Accepting Ride
        if (currentBalanceNum < requiredCommissionNum) {
          const missingAmount = Math.round((requiredCommissionNum - currentBalanceNum) * 100) / 100;
          this.logger.warn(
            `Insufficient wallet balance for Driver [${driverId}]: Required Commission = ${requiredCommissionNum} MAD, Balance = ${currentBalanceNum} MAD, Missing = ${missingAmount} MAD.`
          );

          throw new InsufficientBalanceException({
            message: 'رصيد المحفظة غير كافٍ لخصم عمولة الطلب ⚠️',
            requiredCommission: requiredCommissionNum,
            currentBalance: currentBalanceNum,
            missingAmount: missingAmount,
          });
        }

        // Execute Commission Balance Deduction
        const newBalanceNum = Math.round((currentBalanceNum - requiredCommissionNum) * 100) / 100;

        await tx.driverAccount.update({
          where: { driverId },
          data: {
            balance: newBalanceNum,
          },
        });

        // Record Driver Financial Audit Transaction (DriverTransaction - DEBIT)
        await tx.driverTransaction.create({
          data: {
            driverId,
            type: 'DEBIT',
            amount: requiredCommissionNum,
            status: 'COMPLETED',
            referenceType: 'PLATFORM_COMMISSION',
            description: `Platform 10% commission deduction (${requiredCommissionNum} MAD) for ride #${rideId}`,
            metadata: {
              rideId,
              grossPrice: agreedPriceNum,
              commissionRate,
              commissionAmount: requiredCommissionNum,
              driverNetEarnings: driverNetEarningsNum,
            },
          },
        });

        // Update Ride State (Preserve passenger original offered price in estimatedPrice)
        await tx.ride.update({
          where: { id: rideId },
          data: {
            status: 'DRIVER_ACCEPTED',
            driverId,
            acceptedAt: new Date(),
            actualPrice: agreedPriceNum,
            ...(ride.estimatedPrice === null || ride.estimatedPrice === undefined ? { estimatedPrice: agreedPriceNum } : {}),
          },
        });

        // Update Driver Status
        await tx.driver.update({
          where: { id: driverId },
          data: { status: 'ON_TRIP' },
        });

        // Log Ride Status History
        await tx.rideStatusHistory.create({
          data: { rideId, fromStatus: ride.status, toStatus: 'DRIVER_ACCEPTED' },
        });

        return {
          success: true,
          rideId,
          agreedPrice: agreedPriceNum,
          commissionRate,
          commissionAmount: requiredCommissionNum,
          driverNetEarnings: driverNetEarningsNum,
          newBalance: newBalanceNum,
        };
      });

      // 3. Post-commit: Remove driver from available GEO index
      await this.redis.getClient().zrem('geo:drivers:available', driverId);

      // 4. Emit domain event
      await this.eventBus.publish(
        new RideStatusChangedEvent(rideId, {
          from: 'DISPATCHED' as any,
          to: 'DRIVER_ACCEPTED' as any,
          timestamp: new Date(),
        }),
      );

      this.logger.log(`Ride [${rideId}] ACCEPTED by Driver [${driverId}] — 10% Commission (${result.commissionAmount} MAD) debited. New Balance = ${result.newBalance} MAD.`);

      return result;
    } catch (error) {
      this.logger.error(`Acceptance transaction failed for Ride [${rideId}]: ${error.message}`);
      throw error;
    }
  }
}
