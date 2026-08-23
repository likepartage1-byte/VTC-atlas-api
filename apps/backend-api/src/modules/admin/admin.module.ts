import { Module, Global } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module';
import { IdentityModule } from '../identity/identity.module';

import { SystemSettingsService } from './application/services/system-settings.service';
import { AdminGrowthController } from './presentation/controllers/admin-growth.controller';
import { AdminSettingsController } from './presentation/controllers/admin-settings.controller';
import { AdminIntegrityController } from './presentation/controllers/admin-integrity.controller';
import { AdminAuditController } from './presentation/controllers/admin-audit.controller';
import { AdminOperationsController } from './presentation/controllers/admin-operations.controller';
import { AdminVerificationController } from './presentation/controllers/admin-verification.controller';
import { AdminHomepageController } from './presentation/controllers/admin-homepage.controller';
import { PublicHomepageController } from '../homepage/public-homepage.controller';
import { AdminPassengerDistanceBenefitController } from './presentation/controllers/admin-passenger-distance-benefit.controller';
import { AdminUserTrashController } from './presentation/controllers/admin-user-trash.controller';
import { AdminUserTrashService } from './application/services/admin-user-trash.service';

@Global()
@Module({
  imports: [DriversModule, IdentityModule],
  controllers: [
    AdminGrowthController, 
    AdminSettingsController, 
    AdminIntegrityController,
    AdminAuditController,
    AdminOperationsController,
    AdminVerificationController,
    AdminHomepageController,
    PublicHomepageController,
    AdminPassengerDistanceBenefitController,
    AdminUserTrashController,
  ],
  providers: [SystemSettingsService, AdminUserTrashService],
  exports: [SystemSettingsService, AdminUserTrashService],
})
export class AdminModule {}
