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
import { SimulationModule } from './modules/simulation/simulation.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AdminModule } from './modules/admin/admin.module';
import { GrowthModule } from './modules/growth/growth.module';
import { IntegrityModule } from './modules/integrity/integrity.module';
import { HealthModule } from './core/health/health.module';
import { LoggerModule } from 'nestjs-pino';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { I18nInterceptor } from './core/i18n/interceptors/i18n.interceptor';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      },
    }),
    // Layer 0: Infrastructure (Global)
    AdminModule,
    IntegrityModule,
    CoreModule,
    HealthModule,

    // Layer 1: Trust & Identity
    IdentityModule,

    // Layer 2: Domain Aggregates
    PricingModule,
    DispatchModule,
    DriversModule,
    RidesModule,
    GrowthModule,

    // Layer 3: Real-time
    LocationModule,
    RealtimeModule,

    // Layer 4: Reactions
    NotificationsModule,

    // Layer 5: Insights
    AnalyticsModule,

    // Layer 6: Debug & Simulation
    SimulationModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nInterceptor,
    },
  ],
})
export class AppModule {}
