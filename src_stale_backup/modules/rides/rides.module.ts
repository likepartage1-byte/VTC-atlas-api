import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { RideService } from './application/ride.service';
import { RideLifecycleService } from './application/ride-lifecycle.service';
import { RideOtpService } from './application/ride-otp.service';
import { TripFinalizerService } from './application/trip-finalizer.service';
import { PricingModule } from '../pricing/pricing.module';
import { FinancialModule } from '../financial/financial.module';
import { PassengerRideController } from './presentation/controllers/passenger-ride.controller';
import { DriverRideController } from './presentation/controllers/driver-ride.controller';
import { DriverController } from './presentation/controllers/driver.controller';
import { DriversModule } from '../drivers/drivers.module';
import { RideOrchestrator } from './application/orchestration/ride.orchestrator';
import { WorkflowTraceService } from './application/orchestration/workflow-trace.service';

@Module({
  imports: [CoreModule, PricingModule, DriversModule, FinancialModule],
  controllers: [PassengerRideController, DriverRideController, DriverController],
  providers: [
    RideService,
    RideLifecycleService,
    RideOtpService,
    TripFinalizerService,
    RideOrchestrator,
    WorkflowTraceService,
  ],
  exports: [RideOrchestrator],
})
export class RidesModule {}
