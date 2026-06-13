import { BaseDomainEvent } from '../../../../core/events/domain-event.interface';

export class DispatchCandidateFoundEvent extends BaseDomainEvent<{ rideId: string; driverId: string }> {
  constructor(rideId: string, driverId: string) {
    super('Dispatch.CandidateFound', rideId, 1, { rideId, driverId });
  }
}
