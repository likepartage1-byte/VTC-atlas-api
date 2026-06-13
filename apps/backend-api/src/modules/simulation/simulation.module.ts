import { Module } from '@nestjs/common';
import { SimulationController } from './presentation/controllers/simulation.controller';
import { RidesModule } from '../rides/rides.module';
import { LocationModule } from '../location/location.module';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule, RidesModule, LocationModule],
  controllers: [SimulationController],
})
export class SimulationModule {}
