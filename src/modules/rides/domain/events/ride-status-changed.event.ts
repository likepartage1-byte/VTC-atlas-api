import { BaseDomainEvent } from '../../../../core/events/domain-event.interface';
import { RideStatus } from '../state-machine/ride-transitions';

export interface RideStatusChangedPayload {
  from: RideStatus | null;
  to: RideStatus;
  timestamp: Date;
  reason?: string;
}

export class RideStatusChangedEvent extends BaseDomainEvent<RideStatusChangedPayload> {
  constructor(aggregateId: string, payload: RideStatusChangedPayload) {
    super(`Ride.StatusChanged.${payload.to}`, aggregateId, 1, payload);
  }
}
