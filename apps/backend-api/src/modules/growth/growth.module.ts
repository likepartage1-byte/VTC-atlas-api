import { Module } from '@nestjs/common';
import { GrowthService } from './application/services/growth.service';
import { RewardEngine } from './domain/services/reward-engine.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  providers: [GrowthService, RewardEngine],
  exports: [GrowthService],
})
export class GrowthModule {}
