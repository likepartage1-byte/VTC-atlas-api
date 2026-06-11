import { Module } from '@nestjs/common';
import { PricingService } from './domain/pricing.service';

@Module({
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
