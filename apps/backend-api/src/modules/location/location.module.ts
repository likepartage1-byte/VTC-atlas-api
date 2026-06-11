import { Module } from '@nestjs/common';
import { LocationService } from './application/location.service';
import { LocationController } from './presentation/controllers/location.controller';
import { LocationGateway } from './presentation/gateways/location.gateway';
import { ETAService } from './domain/eta/eta.service';

@Module({
  providers: [LocationService, LocationGateway, ETAService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
