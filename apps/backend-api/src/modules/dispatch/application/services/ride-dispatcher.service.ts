import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LocationDiscoveryService } from '../../../location/application/location-discovery.service';
import { DispatchSessionManager } from './dispatch-session.manager';
import { SocketGateway } from '../../../realtime/presentation/gateways/socket.gateway';

@Injectable()
export class RideDispatcher {
  private readonly logger = new Logger(RideDispatcher.name);

  constructor(
    private readonly discovery: LocationDiscoveryService,
    private readonly sessionManager: DispatchSessionManager,
    private readonly socketGateway: SocketGateway,
  ) {}

  /**
   * REACTION: Hear the cry of a new ride request and start the machinery.
   */
  @OnEvent('ride.requested')
  async handleRideRequested(payload: { rideId: string; pickup: { lat: number; lng: number } }) {
    this.logger.log(`[Dispatcher] 🚀 Processing ride request: ${payload.rideId}`);

    const candidates = await this.discovery.findNearbyDrivers(payload.pickup.lat, payload.pickup.lng);
    
    if (candidates.length === 0) {
      this.logger.warn(`[Dispatcher] No drivers found for ride: ${payload.rideId}`);
      return;
    }

    const sessionStarted = await this.sessionManager.startSession(
      payload.rideId, 
      candidates.map(c => c.driverId)
    );

    if (!sessionStarted) return;

    this.logger.log(`[Dispatcher] Offering ride ${payload.rideId} to ${candidates.length} drivers.`);
    
    for (const candidate of candidates) {
      this.socketGateway.sendToUser(candidate.driverId, 'DRIVER', 'ride.offer', {
        rideId: payload.rideId,
        pickup: payload.pickup,
        estimatedDistance: candidate.distance,
      });
    }
  }
}
