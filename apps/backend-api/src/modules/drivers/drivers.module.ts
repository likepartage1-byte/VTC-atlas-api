import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DriverAcceptanceService } from './application/driver-acceptance.service';
import { DispatchModule } from '../dispatch/dispatch.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [CoreModule, DispatchModule, LocationModule],
  providers: [DriverAcceptanceService],
  exports: [DriverAcceptanceService],
})
export class DriversModule {}
