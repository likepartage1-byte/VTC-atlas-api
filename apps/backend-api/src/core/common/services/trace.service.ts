import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TraceService {
  private readonly als = new AsyncLocalStorage<{ correlationId: string }>();

  /**
   * RUN: Wrap an execution with a correlation context.
   */
  run(correlationId: string, fn: () => void) {
    this.als.run({ correlationId }, fn);
  }

  getCorrelationId(): string | undefined {
    return this.als.getStore()?.correlationId;
  }
}
