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
import { LocationModule } from '../location/location.module';
import { RideOrchestrator } from './application/orchestration/ride.orchestrator';
import { WorkflowTraceService } from './application/orchestration/workflow-trace.service';

import { StateReconcilerService } from './application/orchestration/state-reconciler.service';
import { NegotiationService } from './application/negotiation.service';
import { RideGateway } from './presentation/gateways/ride.gateway';

@Module({
  imports: [CoreModule, PricingModule, DriversModule, FinancialModule, LocationModule],
  controllers: [PassengerRideController, DriverRideController, DriverController],
  providers: [
    RideService,
    RideLifecycleService,
    RideOtpService,
    TripFinalizerService,
    NegotiationService,
    RideGateway,
    RideOrchestrator,
    WorkflowTraceService,
    StateReconcilerService,
  ],
  exports: [RideOrchestrator, NegotiationService, RideService, RideLifecycleService, TripFinalizerService],
})
export class RidesModule {}
