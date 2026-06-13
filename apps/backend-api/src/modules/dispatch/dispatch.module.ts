import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DispatchEngine } from './application/dispatch.engine';
import { DispatchListener } from './application/listeners/dispatch.listener';

@Module({
  imports: [CoreModule],
  providers: [DispatchEngine, DispatchListener],
  exports: [DispatchEngine],
})
export class DispatchModule {}
