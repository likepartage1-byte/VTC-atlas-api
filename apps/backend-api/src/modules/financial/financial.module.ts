import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { RideLedgerService } from './application/ride-ledger.service';
import { FinancialDashboardService } from './application/financial-dashboard.service';
import { AdminFinancialController } from './presentation/controllers/admin-financial.controller';

@Module({
  imports: [CoreModule],
  providers: [RideLedgerService, FinancialDashboardService],
  controllers: [AdminFinancialController],
  exports: [RideLedgerService],
})
export class FinancialModule {}
