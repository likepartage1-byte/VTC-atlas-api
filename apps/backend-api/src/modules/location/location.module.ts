import { Module, forwardRef } from '@nestjs/common';
import { LocationService } from './application/location.service';
import { LocationIngestionService } from './application/location-ingestion.service';
import { LocationDiscoveryService } from './application/location-discovery.service';
import { LocationController } from './presentation/controllers/location.controller';
import { LocationGateway } from './presentation/gateways/location.gateway';
import { ETAService } from './domain/eta/eta.service';
import { DriverLocationRepository } from './infrastructure/repositories/driver-location.repository';
import { RealtimeModule } from '../realtime/realtime.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    forwardRef(() => RealtimeModule),
    forwardRef(() => DriversModule)
  ],
  providers: [
    LocationService, 
    LocationIngestionService,
    LocationDiscoveryService,
    LocationGateway, 
    ETAService, 
    DriverLocationRepository
  ],
  controllers: [LocationController],
  exports: [LocationService, LocationIngestionService, LocationDiscoveryService, DriverLocationRepository],
})
export class LocationModule {}
