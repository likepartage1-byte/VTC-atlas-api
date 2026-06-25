import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { RideLedgerService } from './application/ride-ledger.service';
import { FinancialDashboardService } from './application/financial-dashboard.service';
import { WithdrawalService } from './application/withdrawal.service';
import { AdminFinancialController } from './presentation/controllers/admin-financial.controller';
import { DriverWalletController, AdminWithdrawalController } from './presentation/controllers/withdrawal.controller';

@Module({
  imports: [CoreModule],
  providers: [
    RideLedgerService, 
    FinancialDashboardService,
    WithdrawalService
  ],
  controllers: [
    AdminFinancialController,
    DriverWalletController,
    AdminWithdrawalController
  ],
  exports: [RideLedgerService],
})
export class FinancialModule {}
