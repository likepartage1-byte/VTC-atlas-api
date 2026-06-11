import { DomainEventBus } from '../events/domain-event-bus';

export abstract class BaseApplicationService {
  constructor(protected readonly eventBus: DomainEventBus) {}
}
