import { Module, Global } from '@nestjs/common';
import { AuditLogService } from './application/services/audit-log.service';
import { SystemSettingsService } from './application/services/system-settings.service';
import { AdminGrowthController } from './presentation/controllers/admin-growth.controller';
import { AdminSettingsController } from './presentation/controllers/admin-settings.controller';
import { AdminIntegrityController } from './presentation/controllers/admin-integrity.controller';

@Global()
@Module({
  controllers: [AdminGrowthController, AdminSettingsController, AdminIntegrityController],
  providers: [AuditLogService, SystemSettingsService],
  exports: [AuditLogService, SystemSettingsService],
})
export class AdminModule {}
