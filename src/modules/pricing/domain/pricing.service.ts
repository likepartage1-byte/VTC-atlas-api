import { Injectable } from '@nestjs/common';

export interface PricingEstimate {
  baseFare: number;
  distanceCharge: number;
  total: number;
  currency: string;
}

@Injectable()
export class PricingService {
  private readonly BASE_FARE = 10.0; // 10 MAD
  private readonly PER_KM_RATE = 2.5; // 2.5 MAD/KM

  /**
   * Pure domain calculation for the initial estimate.
   */
  calculateEstimate(distanceKm: number): PricingEstimate {
    const distanceCharge = distanceKm * this.PER_KM_RATE;
    const total = this.BASE_FARE + distanceCharge;

    return {
      baseFare: this.BASE_FARE,
      distanceCharge,
      total: Math.max(total, 15.0), // Minimum fare of 15 MAD
      currency: 'MAD',
    };
  }
}
