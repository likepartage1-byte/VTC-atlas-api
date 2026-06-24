import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DriverAcceptanceService } from './application/driver-acceptance.service';
import { DriverOnboardingService } from './application/services/driver-onboarding.service';
import { DriverVerificationService } from './application/services/driver-verification.service';
import { DispatchModule } from '../dispatch/dispatch.module';
import { LocationModule } from '../location/location.module';

import { AdminDriverController } from './presentation/controllers/admin-driver.controller';
import { DriverVerificationController } from './presentation/controllers/driver-verification.controller';

@Module({
  imports: [
    CoreModule, 
    forwardRef(() => DispatchModule), 
    LocationModule
  ],
  controllers: [
    AdminDriverController,
    DriverVerificationController
  ],
  providers: [
    DriverAcceptanceService, 
    DriverOnboardingService,
    DriverVerificationService
  ],
  exports: [
    DriverAcceptanceService, 
    DriverOnboardingService,
    DriverVerificationService
  ],
})
export class DriversModule {}
