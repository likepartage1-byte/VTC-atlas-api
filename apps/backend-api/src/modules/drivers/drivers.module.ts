import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DriverAcceptanceService } from './application/driver-acceptance.service';
import { DriverOnboardingService } from './application/services/driver-onboarding.service';
import { DriverVerificationService } from './application/services/driver-verification.service';
import { DriverEligibilityService } from './application/services/driver-eligibility.service';
import { ProfileService } from './application/services/profile.service';
import { WeeklyResetTask } from './application/services/weekly-reset.task';
import { LocalStorageProvider } from './infrastructure/storage/storage.provider';
import { DispatchModule } from '../dispatch/dispatch.module';
import { LocationModule } from '../location/location.module';

import { AdminDriverController } from './presentation/controllers/admin-driver.controller';
import { DriverVerificationController } from './presentation/controllers/driver-verification.controller';
import { ProfileController } from './presentation/controllers/profile.controller';

@Module({
  imports: [
    CoreModule, 
    forwardRef(() => DispatchModule), 
    LocationModule
  ],
  controllers: [
    AdminDriverController,
    DriverVerificationController,
    ProfileController
  ],
  providers: [
    DriverAcceptanceService, 
    DriverOnboardingService,
    DriverVerificationService,
    DriverEligibilityService,
    ProfileService,
    WeeklyResetTask,
    LocalStorageProvider
  ],
  exports: [
    DriverAcceptanceService, 
    DriverOnboardingService,
    DriverVerificationService,
    DriverEligibilityService,
    ProfileService,
    WeeklyResetTask,
    LocalStorageProvider
  ],
})
export class DriversModule {}
