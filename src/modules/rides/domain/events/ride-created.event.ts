import { BaseDomainEvent } from '../../../../core/events/domain-event.interface';

export interface RideCreatedPayload {
  passengerId: string;
  pickup: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

export class RideCreatedEvent extends BaseDomainEvent<RideCreatedPayload> {
  constructor(aggregateId: string, payload: RideCreatedPayload) {
    super('Ride.Requested', aggregateId, 1, payload);
  }
}
