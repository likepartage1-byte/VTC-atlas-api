import { Module } from '@nestjs/common';
import { LocationService } from './application/location.service';
import { LocationController } from './presentation/controllers/location.controller';
import { LocationGateway } from './presentation/gateways/location.gateway';
import { ETAService } from './domain/eta/eta.service';
import { DriverLocationRepository } from './infrastructure/repositories/driver-location.repository';

@Module({
  providers: [LocationService, LocationGateway, ETAService, DriverLocationRepository],
  controllers: [LocationController],
  exports: [LocationService, DriverLocationRepository],
})
export class LocationModule {}
