import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './presentation/gateways/socket.gateway';
import { IdentityModule } from '../identity/identity.module';
import { PresenceService } from './infrastructure/services/presence.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    IdentityModule,
    forwardRef(() => LocationModule)
  ],
  providers: [SocketGateway, PresenceService],
  exports: [SocketGateway, PresenceService],
})
export class RealtimeModule {}
