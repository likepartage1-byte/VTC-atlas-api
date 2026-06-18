import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './presentation/gateways/socket.gateway';
import { IdentityModule } from '../identity/identity.module';
import { PresenceService } from './infrastructure/services/presence.service';
import { LocationModule } from '../location/location.module';
import { RealtimeDispatchListener } from './application/listeners/realtime-dispatch.listener';

@Module({
  imports: [
    IdentityModule,
    forwardRef(() => LocationModule)
  ],
  providers: [SocketGateway, PresenceService, RealtimeDispatchListener],
  exports: [SocketGateway, PresenceService],
})
export class RealtimeModule {}
