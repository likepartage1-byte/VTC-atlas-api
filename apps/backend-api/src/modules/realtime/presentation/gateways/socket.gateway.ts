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
import { PrismaService } from '../../../../core/prisma/prisma.service';

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
    private readonly ingestion: LocationIngestionService,
    private readonly prisma: PrismaService,
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

    // If DRIVER, also join canonical room for Driver.id (resolves User.id vs Driver.id socket room mismatch)
    if (user.role === 'DRIVER') {
      const driver = await this.prisma.driver.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (driver) {
        client.join(`driver:${driver.id}`);
        this.logger.log(`[Gateway] DRIVER joined canonical rooms: driver:${user.userId} AND driver:${driver.id}`);
      }
    }

    this.logger.log(`[Gateway] ${user.role} ${user.userId} connected (${client.id})`);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (!user) return;
    await this.presence.setOffline(user.userId);
    // Reset driver status to OFFLINE in DB on disconnect
    if (user.role === 'DRIVER') {
      await this.prisma.driver.updateMany({
        where: { userId: user.userId },
        data: { status: 'OFFLINE' },
      });
    }
    this.logger.log(`[Gateway] ${user.role} ${user.userId} disconnected`);
  }

  /**
   * INBOUND: Driver sets their availability for dispatch.
   * status AVAILABLE → driver enters the dispatch pool.
   * status ONLINE    → driver is connected but not available for rides.
   */
  @SubscribeMessage('driver.presence')
  async handleDriverPresence(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { status: 'AVAILABLE' | 'ONLINE' | 'BUSY' }
  ) {
    const user = client.data.user;
    if (user?.role !== 'DRIVER') return { error: 'Not a driver' };

    const dbStatus = data.status === 'AVAILABLE' ? 'AVAILABLE'
      : data.status === 'BUSY' ? 'BUSY'
      : 'OFFLINE';

    await this.prisma.driver.updateMany({
      where: { userId: user.userId },
      data: { status: dbStatus as any },
    });

    this.logger.log(`[Gateway] Driver ${user.userId} → status: ${dbStatus}`);
    return { status: 'ok', updated: dbStatus };
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
      return { status: 'buffered' };
    }
  }

  public sendToUser(userId: string, role: string, event: string, payload: any) {
    const roomName = `${role.toLowerCase()}:${userId}`;
    this.server.to(roomName).emit(event, payload);
  }
}

