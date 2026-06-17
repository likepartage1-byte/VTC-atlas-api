import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { RequestRideUseCase } from '../ride/application/use-cases/request-ride.use-case';
import { PricingService } from '../ride/domain/services/pricing.service';
import { PrismaRideRepository } from '../ride/infrastructure/persistence/prisma/prisma-ride.repository';
import { PricingModule } from '../pricing/pricing.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    CoreModule, 
    PricingModule, 
    forwardRef(() => DriversModule)
  ],
  providers: [
    RequestRideUseCase,
    PricingService,
    {
      provide: 'IRideRepository',
      useClass: PrismaRideRepository,
    },
  ],
  exports: [
    RequestRideUseCase,
    'IRideRepository'
  ],
})
export class RidesModule {}
