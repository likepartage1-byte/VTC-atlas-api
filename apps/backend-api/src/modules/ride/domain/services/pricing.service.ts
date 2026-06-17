import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  private readonly BASE_FARE = 10; // DH
  private readonly PER_KM_RATE = 5; // DH
  private readonly MINIMUM_FARE = 15; // DH

  /**
   * CALCULATE: Synchronous domain logic for pricing.
   */
  public calculateFare(distanceKm: number, durationMin: number, surgeMultiplier: number = 1.0): number {
    const distanceCost = distanceKm * this.PER_KM_RATE;
    const timeCost = durationMin * 0.5; // Example: 0.5 DH per minute
    
    const total = (this.BASE_FARE + distanceCost + timeCost) * surgeMultiplier;

    return Math.max(total, this.MINIMUM_FARE);
  }

  /**
   * Split: Calculate company fee and driver earnings.
   */
  public calculateSplit(totalFare: number, commissionRate: number) {
    const companyFee = totalFare * commissionRate;
    const driverEarnings = totalFare - companyFee;

    return {
      totalFare,
      companyFee: Number(companyFee.toFixed(2)),
      driverEarnings: Number(driverEarnings.toFixed(2)),
      commissionRate,
    };
  }
}
