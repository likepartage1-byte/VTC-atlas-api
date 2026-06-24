import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditService } from '../../../audit/audit.service';
import { RewardEngine } from '../../domain/services/reward-engine.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class GrowthService {
  private readonly logger = new Logger(GrowthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditService,
    private readonly rewardEngine: RewardEngine,
  ) {}

  /**
   * Validates and processes a Promo Code
   */
  async validatePromo(code: string, userId: string, cityId: string, rideValue: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code, isActive: true },
    });

    if (!promo || promo.expiresAt < new Date()) {
      throw new BadRequestException('PROMO.ERRORS.INVALID_OR_EXPIRED');
    }

    // Check usage limits
    if (promo.maxUsageTotal && promo.usedCount >= promo.maxUsageTotal) {
      throw new BadRequestException('PROMO.ERRORS.MAX_LIMIT_REACHED');
    }

    const userUsage = await this.prisma.promoUsage.count({
      where: { promoId: promo.id, userId },
    });

    if (userUsage >= promo.maxUsagePerUser) {
      throw new BadRequestException('PROMO.ERRORS.USER_LIMIT_REACHED');
    }

    // Check Business Rules
    if (promo.minRideValue && rideValue < Number(promo.minRideValue)) {
      throw new BadRequestException('PROMO.ERRORS.MIN_VALUE_NOT_MET');
    }

    // Success logic
    return promo;
  }

  /**
   * Handles Reward (Lottery) logic for a ticket
   */
  async processRewardTicket(promoId: string, userId: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
      include: { campaign: { include: { prizes: true } } }
    });

    if (!promo?.campaignId) throw new BadRequestException('PROMO.NOT_A_REWARD_TICKET');

    return await this.prisma.$transaction(async (tx) => {
      // 1. Draw Prize
      const prize = await this.rewardEngine.drawPrize(promo.campaign!.prizes);
      if (!prize) return null;

      // 2. Persist Win
      const userReward = await tx.userReward.create({
        data: {
          userId,
          prizeId: prize.id,
          claimCode: this.rewardEngine.generateClaimCode(),
        }
      });

      // 3. Update stock
      await tx.rewardPrize.update({
        where: { id: prize.id },
        data: { claimedCount: { increment: 1 } }
      });

      // 4. Audit
      await this.auditLog.log({
        actorId: userId,
        action: 'REWARD_WON',
        entityType: 'UserReward',
        entityId: userReward.id,
        newValue: { prizeName: prize.name, type: prize.type },
      });

      return { prize, userReward };
    });
  }

  /**
   * Referral System: Register a new referee
   */
  async registerReferral(referrerId: string, refereeId: string) {
    const program = await this.prisma.referralProgram.findFirst({
      where: { isActive: true }
    });

    if (!program) return;

    await this.prisma.referralReward.create({
      data: {
        programId: program.id,
        referrerId,
        refereeId,
        status: 'PENDING'
      }
    });

    this.logger.log(`Referral registered: ${referrerId} -> ${refereeId}`);
  }
}
