import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WSAuthMiddleware } from '../../../realtime/infrastructure/guards/ws-auth.middleware';
import { SessionService } from '../../../identity/application/services/session.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@WebSocketGateway({
  namespace: 'rides',
  cors: { origin: '*' },
})
export class RideGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RideGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    server.use(WSAuthMiddleware(this.jwtService, this.sessionService, this.logger));
    this.logger.log('RideGateway initialized with secure handshake.');
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;
    this.logger.log(
      `[RidesGateway Connect] SocketId: ${client.id} | User: ${user?.userId} | Role: ${user?.role}`
    );
    if (!user) return;

    const userRoom = `${user.role.toLowerCase()}:${user.userId}`;
    client.join(userRoom);

    if (user.role === 'DRIVER') {
      const driver = await this.prisma.driver.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (driver) {
        client.join(`driver:${driver.id}`);
        this.logger.log(
          `[RidesGateway RoomJoin] Driver ${user.userId} joined rooms: [${userRoom}, driver:${driver.id}]`
        );
      }
    }
  }

  @SubscribeMessage('joinRide')
  async handleJoinRide(client: Socket, rideId: string) {
    const user = client.data.user;
    if (!user || !user.userId) {
      this.logger.warn(`[JoinRide Rejected] No authenticated user on socket ${client.id}`);
      return;
    }

    if (!rideId || typeof rideId !== 'string') {
      return;
    }

    try {
      const ride = await this.prisma.ride.findUnique({
        where: { id: rideId },
        select: {
          passengerId: true,
          driver: { select: { userId: true } },
        },
      });

      if (!ride) {
        this.logger.warn(`[JoinRide Rejected] Ride ${rideId} not found (user: ${user.userId})`);
        return;
      }

      const isPassenger = ride.passengerId === user.userId;
      const isDriver = ride.driver?.userId === user.userId;

      if (isPassenger || isDriver) {
        client.join(`ride:${rideId}`);
        this.logger.log(
          `[JoinRide Allowed] Socket ${client.id} (user: ${user.userId}, role: ${user.role}) joined room ride:${rideId}`
        );
      } else {
        this.logger.warn(
          `[JoinRide Denied] Socket ${client.id} (user: ${user.userId}) attempted unauthorized join to room ride:${rideId}`
        );
      }
    } catch (err: any) {
      this.logger.error(`[JoinRide Error] Failed to authorize join for ride ${rideId}: ${err.message}`);
    }
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
  @OnEvent('Ride.StatusChanged.*')
  @OnEvent('ride.status.changed')
  handleRideStatusChanged(event: any) {
    const rideId = event?.aggregateId || event?.rideId || event?.payload?.rideId;
    const status = event?.payload?.to || event?.payload?.status || event?.status;
    const payload = {
      rideId,
      status,
      from: event?.payload?.from,
      timestamp: event?.occurredOn || event?.payload?.timestamp || new Date().toISOString(),
    };
    this.logger.log(`Broadcasting statusChanged for ride ${rideId} -> ${status} to room ride:${rideId}`);
    this.server.to(`ride:${rideId}`).emit('statusChanged', payload);
  }
}

