import { Injectable, Logger } from '@nestjs/common';
import { RewardPrize } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class RewardEngine {
  private readonly logger = new Logger(RewardEngine.name);

  /**
   * Selects a prize from a pool based on probabilistic weights.
   * Uses the 'Weighted Random Selection' algorithm.
   */
  async drawPrize(prizes: RewardPrize[]): Promise<RewardPrize | null> {
    if (prizes.length === 0) return null;

    // 1. Filter out prizes that are out of stock
    const availablePrizes = prizes.filter(p => p.stockLimit === 0 || p.claimedCount < p.stockLimit);
    if (availablePrizes.length === 0) {
      this.logger.warn('All prizes in current campaign are out of stock.');
      return null;
    }

    // 2. Calculate total weight
    const totalWeight = availablePrizes.reduce((sum, p) => sum + p.probWeight, 0);

    // 3. Generate random selection point (cryptographically secure)
    const randomInt = crypto.randomInt(0, totalWeight);
    
    // 4. Find the prize that corresponds to the random point
    let currentWeight = 0;
    for (const prize of availablePrizes) {
      currentWeight += prize.probWeight;
      if (randomInt < currentWeight) {
        return prize;
      }
    }

    return availablePrizes[availablePrizes.length - 1]; // Fallback to last prize
  }

  /**
   * Secure claim code generator for physical prizes
   */
  generateClaimCode(): string {
    return `ATLAS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
}
