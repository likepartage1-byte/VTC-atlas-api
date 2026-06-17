import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DispatchSessionManager } from './application/services/dispatch-session.manager';
import { RideDispatcher } from './application/services/ride-dispatcher.service';
import { DispatchEngine } from './application/dispatch.engine';
import { AcceptRideUseCase } from '../ride/application/use-cases/accept-ride.use-case';
import { AssignmentLockService } from '../ride/infrastructure/services/assignment-lock.service';
import { PrismaRideRepository } from '../ride/infrastructure/persistence/prisma/prisma-ride.repository';
import { RealtimeModule } from '../realtime/realtime.module';
import { RidesModule } from '../rides/rides.module';
import { LocationModule } from '../location/location.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    CoreModule,
    RealtimeModule,
    LocationModule,
    forwardRef(() => RidesModule),
  ],
  providers: [
    DispatchSessionManager,
    RideDispatcher,
    DispatchEngine,
    AcceptRideUseCase,
    AssignmentLockService,
    {
      provide: 'IRideRepository',
      useClass: PrismaRideRepository,
    },
  ],
  exports: [
    DispatchSessionManager, 
    RideDispatcher, 
    DispatchEngine,
    AcceptRideUseCase
  ],
})
export class DispatchModule {}
