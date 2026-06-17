import { Module, Global } from '@nestjs/common';
import { OutboxService } from './services/outbox.service';
import { OutboxProcessor } from './services/outbox.processor';

@Global()
@Module({
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
