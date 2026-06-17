import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DriverAcceptanceService } from './application/driver-acceptance.service';
import { DriverOnboardingService } from './application/services/driver-onboarding.service';
import { DispatchModule } from '../dispatch/dispatch.module';
import { LocationModule } from '../location/location.module';

import { AdminDriverController } from './presentation/controllers/admin-driver.controller';

@Module({
  imports: [
    CoreModule, 
    forwardRef(() => DispatchModule), 
    LocationModule
  ],
  controllers: [AdminDriverController],
  providers: [DriverAcceptanceService, DriverOnboardingService],
  exports: [DriverAcceptanceService, DriverOnboardingService],
})
export class DriversModule {}
