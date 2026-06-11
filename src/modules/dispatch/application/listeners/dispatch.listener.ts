import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RideStatusChangedEvent } from '../../../rides/domain/events/ride-status-changed.event';

@Injectable()
export class DispatchListener {
  private readonly logger = new Logger(DispatchListener.name);

  @OnEvent('Ride.StatusChanged.REQUESTED')
  async handleRideRequested(event: RideStatusChangedEvent) {
    this.logger.log(`Dispatch responding to Ride.Requested event for ride: ${event.aggregateId}`);
    
    // Logic:
    // 1. Calculate search parameters (City radius)
    // 2. Query Redis GEO for nearby Drivers
    // 3. Emit Dispatch.CandidateFound if any
    
    // For now, this is the reactive skeleton
  }

  @OnEvent('Ride.StatusChanged.DRIVER_ACCEPTED')
  async handleStopSearch(event: RideStatusChangedEvent) {
    this.logger.log(`Stop search command received for ride: ${event.aggregateId}`);
    // Clear Redis locks or timers for this ride
  }
}
