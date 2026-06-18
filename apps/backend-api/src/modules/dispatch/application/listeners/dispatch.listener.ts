import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RideCreatedEvent } from '../../../rides/domain/events/ride-created.event';
import { DispatchEngine } from '../dispatch.engine';

@Injectable()
export class DispatchListener {
  private readonly logger = new Logger(DispatchListener.name);

  constructor(private readonly dispatchEngine: DispatchEngine) {}

  @OnEvent('Ride.Requested')
  async handleRideRequested(event: RideCreatedEvent) {
    this.logger.log(`Dispatch responding to Ride.Requested event for ride: ${event.aggregateId}`);
    
    const { pickup } = event.payload;
    
    // Start the dispatch sequence
    await this.dispatchEngine.dispatchRide(
      event.aggregateId, 
      pickup.lat, 
      pickup.lng
    );
  }

  @OnEvent('Ride.StatusChanged.DRIVER_ACCEPTED')
  async handleStopSearch(event: any) {
    this.logger.log(`Stop search command received for ride: ${event.aggregateId}`);
  }
}
