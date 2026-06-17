import { Module, Global } from '@nestjs/common';
import { IntegrityService } from './application/services/integrity.service';
import { FraudGateway } from './presentation/gateways/fraud.gateway';

@Global()
@Module({
  providers: [IntegrityService, FraudGateway],
  exports: [IntegrityService, FraudGateway],
})
export class IntegrityModule {}
