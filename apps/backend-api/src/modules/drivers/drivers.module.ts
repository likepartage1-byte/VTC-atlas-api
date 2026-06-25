import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DriverAcceptanceService } from './application/driver-acceptance.service';
import { DriverOnboardingService } from './application/services/driver-onboarding.service';
import { DriverVerificationService } from './application/services/driver-verification.service';
import { DriverEligibilityService } from './application/services/driver-eligibility.service';
import { LocalStorageProvider } from './infrastructure/storage/storage.provider';
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
    DriverVerificationService,
    DriverEligibilityService,
    LocalStorageProvider
  ],
  exports: [
    DriverAcceptanceService, 
    DriverOnboardingService,
    DriverVerificationService,
    DriverEligibilityService,
    LocalStorageProvider
  ],
})
export class DriversModule {}
