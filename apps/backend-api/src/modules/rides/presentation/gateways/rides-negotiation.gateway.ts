import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { RideAssignmentService } from '../../application/services/ride-assignment.service';
import { GoogleMapsService } from '../../../../core/google-maps/google-maps.service';
import { DriverLocationRepository } from '../../../location/infrastructure/repositories/driver-location.repository';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'rides',
})
export class RidesNegotiationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly rideAssignmentService: RideAssignmentService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly driverLocationRepository: DriverLocationRepository,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`presence_${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
     const userId = client.handshake.query.userId as string;
     if (userId) {
       client.leave(`presence_${userId}`);
     }
  }

  /**
   * Broadcasts a new ride only to nearby drivers (P3) with real ETA/Distance (P2)
   */
  async broadcastNewRide(ride: any) {
    // 1. Get real physics from Google Maps (P2)
    const estimates = await this.googleMapsService.getEstimates(
      { lat: ride.pickupLat, lng: ride.pickupLng },
      { lat: ride.dropoffLat, lng: ride.dropoffLng }
    );

    // 2. Find nearby drivers within 5km (P3)
    const nearbyDriverIds = await this.driverLocationRepository.findNearby(
      ride.pickupLng,
      ride.pickupLat,
      5 // 5 KM radius
    );

    const payload = {
      ...ride,
      tripDistance: estimates?.distanceText || 'N/A',
      tripDuration: estimates?.durationText || 'N/A',
      polyline: estimates?.polyline || '',
    };

    // 3. Surgical Broadcast
    nearbyDriverIds.forEach(driverId => {
      this.server.to(`presence_${driverId}`).emit('new_ride_request', payload);
    });

    console.log(`[Dispatch] Broadcasted ride ${ride.id} to ${nearbyDriverIds.length} nearby drivers.`);
  }

  @SubscribeMessage('submit_bid')
  async handleBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; driverId: string; amount: number }
  ) {
    const { rideId, amount } = data;
    
    this.server.to(`presence_passenger_${rideId}`).emit('bid_received', {
      driverId: data.driverId,
      amount: Math.ceil(amount),
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('accept_bid')
  async handleAcceptBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; driverId: string }
  ) {
    try {
      await this.rideAssignmentService.assignRide(data.rideId, data.driverId);
      
      this.server.to(`presence_${data.driverId}`).emit('assignment_success', { rideId: data.rideId });
      this.server.emit('ride_request_assigned', { rideId: data.rideId });
      
    } catch (error) {
      client.emit('assignment_failed', { 
        message: 'Désolé, cette course a déjà été acceptée par یک سائق آخر.',
        code: 'RACE_CONDITION_LOST'
      });
    }
  }
}
