import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WSAuthMiddleware } from '../../infrastructure/guards/ws-auth.middleware';
import { SessionService } from '../../../identity/application/services/session.service';
import { PresenceService } from '../../infrastructure/services/presence.service';
import { LocationIngestionService } from '../../../location/application/location-ingestion.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly presence: PresenceService,
    private readonly ingestion: LocationIngestionService, // Injected the guard rail
  ) {}

  afterInit(server: Server) {
    server.use(WSAuthMiddleware(this.jwtService, this.sessionService, this.logger));
    this.logger.log('WebSocket Gateway initialized with secure handshake.');
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;
    if (!user) return;
    await this.presence.setOnline(user.userId, client.id, user.role);
    client.join(`${user.role.toLowerCase()}:${user.userId}`);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) await this.presence.setOffline(user.userId);
  }

  /**
   * INBOUND NERVE: Driver location update stream.
   * Handled with Throttle/Backpressure control.
   */
  @SubscribeMessage('driver.location_update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number }
  ) {
    const user = client.data.user;
    if (user?.role !== 'DRIVER') return;

    // Delegate to ingestion service for throttling and validation
    const accepted = await this.ingestion.ingest(user.userId, data.lat, data.lng);
    
    if (accepted) {
      // Broadcast to specific ride room if driver is on a trip (Future step)
      return { status: 'buffered' };
    }
  }

  public sendToUser(userId: string, role: string, event: string, payload: any) {
    const roomName = `${role.toLowerCase()}:${userId}`;
    this.server.to(roomName).emit(event, payload);
  }
}
