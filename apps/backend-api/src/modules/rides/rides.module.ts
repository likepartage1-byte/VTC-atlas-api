import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { PricingModule } from '../pricing/pricing.module';
import { DriversModule } from '../drivers/drivers.module';
import { LocationModule } from '../location/location.module';
import { FinancialModule } from '../financial/financial.module';

import { RequestRideUseCase } from '../ride/application/use-cases/request-ride.use-case';
import { PricingService } from '../ride/domain/services/pricing.service';
import { PrismaRideRepository } from '../ride/infrastructure/persistence/prisma/prisma-ride.repository';
import { DriverLocationRepository } from '../location/infrastructure/repositories/driver-location.repository';

import { PassengerRideController } from './presentation/controllers/passenger-ride.controller';
import { DriverRideController } from './presentation/controllers/driver-ride.controller';
import { DriverController } from './presentation/controllers/driver.controller';
import { RideService } from './application/ride.service';
import { RideOrchestrator } from './application/orchestration/ride.orchestrator';
import { RideLifecycleService } from './application/ride-lifecycle.service';
import { TripFinalizerService } from './application/trip-finalizer.service';
import { WorkflowTraceService } from './application/orchestration/workflow-trace.service';
import { RideOtpService } from './application/ride-otp.service';

@Module({
  imports: [
    CoreModule, 
    PricingModule, 
    LocationModule,
    FinancialModule,
    forwardRef(() => DriversModule)
  ],
  controllers: [
    PassengerRideController, 
    DriverRideController, 
    DriverController
  ],
  providers: [
    RideService,
    RideOrchestrator,
    RideLifecycleService,
    TripFinalizerService,
    WorkflowTraceService,
    RideOtpService,
    RequestRideUseCase,
    PricingService,
    {
      provide: 'IRideRepository',
      useClass: PrismaRideRepository,
    },
    {
      provide: 'IDriverLocationRepository',
      useClass: DriverLocationRepository,
    },
  ],
  exports: [
    RideService,
    RideOrchestrator,
    RideLifecycleService,
    RideOtpService,
    RequestRideUseCase,
    'IRideRepository'
  ],
})
export class RidesModule {}
