import { IDomainEvent } from '../events/domain-event.interface';

export abstract class BaseAggregate {
  private readonly _events: IDomainEvent[] = [];

  get events(): IDomainEvent[] {
    return this._events;
  }

  protected addEvent(event: IDomainEvent): void {
    this._events.push(event);
  }

  public clearEvents(): void {
    this._events.length = 0;
  }
}
