export interface IDomainEvent<T = any> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  version: number;
  payload: T;
}

export abstract class BaseDomainEvent<T = any> implements IDomainEvent<T> {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly version: number,
    public readonly payload: T,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}
