import { Module } from '@nestjs/common';
import { AnalyticsConsumer } from './application/consumers/analytics.consumer';
import { DashboardController } from './presentation/controllers/dashboard.controller';

@Module({
  providers: [AnalyticsConsumer],
  controllers: [DashboardController],
})
export class AnalyticsModule {}
