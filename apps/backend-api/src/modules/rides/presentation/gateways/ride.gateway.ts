import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'rides',
  cors: { origin: '*' },
})
export class RideGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RideGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to RidesGateway: ${client.id}`);
  }

  @SubscribeMessage('joinRide')
  handleJoinRide(client: Socket, rideId: string) {
    client.join(`ride:${rideId}`);
  }

  /**
   * Real-time Negotiation Updates
   */
  @OnEvent('negotiation.counter_offered')
  handleCounterOffer(payload: any) {
    // Notify the passenger
    this.server.to(`ride:${payload.rideId}`).emit('counterOffered', payload);
  }

  @OnEvent('negotiation.accepted')
  handleNegotiationAccepted(payload: any) {
    // Notify all parties
    this.server.to(`ride:${payload.rideId}`).emit('negotiationAccepted', payload);
  }

  /**
   * Ride Status Sync
   */
  @OnEvent('ride.status.changed')
  handleRideStatusChanged(payload: any) {
    this.server.to(`ride:${payload.rideId}`).emit('statusChanged', payload);
  }
}
