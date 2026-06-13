import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import type { DriverLocationEvent } from '../../application/location.service';

@WebSocketGateway({
  namespace: 'location',
  cors: { origin: '*' },
})
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRide')
  handleJoinRide(client: Socket, rideId: string) {
    client.join(`ride:${rideId}`);
    this.logger.log(`Client ${client.id} joined room: ride:${rideId}`);
  }

  /**
   * Broadcast Driver Motion
   */
  @OnEvent('driver.location.updated')
  async handleDriverLocationUpdate(event: DriverLocationEvent) {
    if (event.rideId) {
      this.server.to(`ride:${event.rideId}`).emit('driverMoved', {
        lat: event.lat,
        lng: event.lng,
        timestamp: event.timestamp,
        seq: event.timestamp, // Simple timestamp-based sequencing
      });
    }
  }

  /**
   * Broadcast ETA Updates
   * Pure forwarder from Event Bus to Ride Room
   */
  @OnEvent('ride.eta.updated')
  async handleEtaUpdate(event: any) {
    this.server.to(`ride:${event.rideId}`).emit('etaUpdated', {
      etaMinutes: event.etaMinutes,
      distanceKm: event.distanceKm,
    });
    this.logger.debug(`ETA Broadcasted to ride:${event.rideId}`);
  }
}
