import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { TraceService } from '../services/trace.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(private readonly trace: TraceService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || 
                          (req.headers['x-request-id'] as string) || 
                          crypto.randomUUID();

    req['correlationId'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    // 🧠 WRAP: Put the entire request execution into the Trace context
    this.trace.run(correlationId, () => next());
  }
}
