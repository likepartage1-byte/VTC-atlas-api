import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Check if correlation ID already exists in incoming header
    const correlationId = (req.headers['x-correlation-id'] as string) || 
                          (req.headers['x-request-id'] as string) || 
                          crypto.randomUUID();

    // 2. Attach to request for internal traceability
    req['correlationId'] = correlationId;

    // 3. Attach to response header for external traceability
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
