import { Module, Global } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module';

import { SystemSettingsService } from './application/services/system-settings.service';
import { AdminGrowthController } from './presentation/controllers/admin-growth.controller';
import { AdminSettingsController } from './presentation/controllers/admin-settings.controller';
import { AdminIntegrityController } from './presentation/controllers/admin-integrity.controller';
import { AdminAuditController } from './presentation/controllers/admin-audit.controller';
import { AdminOperationsController } from './presentation/controllers/admin-operations.controller';
import { AdminVerificationController } from './presentation/controllers/admin-verification.controller';

@Global()
@Module({
  imports: [DriversModule],
  controllers: [
    AdminGrowthController, 
    AdminSettingsController, 
    AdminIntegrityController,
    AdminAuditController,
    AdminOperationsController,
    AdminVerificationController
  ],
  providers: [SystemSettingsService],
  exports: [SystemSettingsService],
})
export class AdminModule {}
