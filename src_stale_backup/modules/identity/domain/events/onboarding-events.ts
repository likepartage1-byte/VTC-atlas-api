import { BaseDomainEvent } from '../../../../core/events/domain-event.interface';

export class PassengerCreatedEvent extends BaseDomainEvent<{ userId: string; passengerId: string }> {
  constructor(userId: string, passengerId: string) {
    super('Identity.PassengerCreated', passengerId, 1, { userId, passengerId });
  }
}

export class DriverOnboardingStartedEvent extends BaseDomainEvent<{ userId: string; driverId: string }> {
  constructor(userId: string, driverId: string) {
    super('Identity.DriverOnboardingStarted', driverId, 1, { userId, driverId });
  }
}

export class DriverApprovedEvent extends BaseDomainEvent<{ userId: string; driverId: string; cityId: string }> {
  constructor(userId: string, driverId: string, cityId: string) {
    super('Identity.DriverApproved', driverId, 1, { userId, driverId, cityId });
  }
}
