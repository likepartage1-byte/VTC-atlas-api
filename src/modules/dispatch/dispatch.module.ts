import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DispatchEngine } from './application/dispatch.engine';
import { DispatchListener } from './application/listeners/dispatch.listener';
import { DispatchClaimService } from './domain/claims/dispatch-claim.service';

@Module({
  imports: [CoreModule],
  providers: [DispatchEngine, DispatchClaimService, DispatchListener],
  exports: [DispatchEngine, DispatchClaimService],
})
export class DispatchModule {}
