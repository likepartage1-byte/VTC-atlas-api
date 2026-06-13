import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { IdentityModule } from './modules/identity/identity.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { RidesModule } from './modules/rides/rides.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { LocationModule } from './modules/location/location.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // Layer 0: Infrastructure (Global)
    CoreModule,

    // Layer 1: Trust & Identity
    IdentityModule,

    // Layer 2: Domain Aggregates
    PricingModule,
    DispatchModule,
    DriversModule,
    RidesModule,

    // Layer 3: Real-time
    LocationModule,

    // Layer 4: Reactions
    NotificationsModule,

    // Layer 5: Insights
    AnalyticsModule,
  ],
})
export class AppModule {}
