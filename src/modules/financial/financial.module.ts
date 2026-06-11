import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { RideLedgerService } from './application/ride-ledger.service';

@Module({
  imports: [CoreModule],
  providers: [RideLedgerService],
  exports: [RideLedgerService],
})
export class FinancialModule {}
