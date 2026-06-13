import { BaseDomainEvent } from '../../../../core/events/domain-event.interface';

export class OtpRequestedEvent extends BaseDomainEvent<{ phone: string }> {
  constructor(phone: string) {
    super('Identity.OTPRequested', phone, 1, { phone });
  }
}

export class OtpVerifiedEvent extends BaseDomainEvent<{ userId: string; phone: string }> {
  constructor(userId: string, phone: string) {
    super('Identity.OTPVerified', userId, 1, { userId, phone });
  }
}

export class SessionCreatedEvent extends BaseDomainEvent<{ userId: string; deviceId: string }> {
  constructor(userId: string, deviceId: string) {
    super('Identity.SessionCreated', userId, 1, { userId, deviceId });
  }
}
