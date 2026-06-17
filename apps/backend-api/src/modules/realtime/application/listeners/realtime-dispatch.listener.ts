import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketGateway } from '../../presentation/gateways/socket.gateway';

@Injectable()
export class RealtimeDispatchListener {
  private readonly logger = new Logger(RealtimeDispatchListener.name);

  constructor(private readonly socketGateway: SocketGateway) {}

  @OnEvent('Dispatch.CandidateFound')
  async handleCandidateFound(event: { rideId: string; driverId: string }) {
    const { rideId, driverId } = event;
    const traceId = `trace:${rideId.slice(0, 8)}`;
    
    this.logger.log(`[${traceId}] Attempting to dispatch offer to Driver [${driverId}]`);

    const driverRoom = `driver:${driverId}`;
    
    // إرسال العرض مع نظام تتبع بسيط
    this.socketGateway.server.to(driverRoom).emit('ride_offer', {
      rideId,
      expiresAt: Date.now() + 25000,
      traceId
    }, (ack: any) => {
      if (ack && ack.status === 'ok') {
        this.logger.log(`[${traceId}] Offer delivered and acknowledged by Driver [${driverId}]`);
      } else {
        this.logger.warn(`[${traceId}] Offer sent but NO ACK from Driver [${driverId}]`);
      }
    });
  }
}
