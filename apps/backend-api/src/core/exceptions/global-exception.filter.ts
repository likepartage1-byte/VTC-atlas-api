import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ObservabilityService } from '../monitoring/observability.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly observability: ObservabilityService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    // Observability: Capture exception in Sentry
    this.observability.captureException(exception, {
      path: request.url,
      method: request.method,
      status,
    });
    
    this.logger.error(`[${request.method}] ${request.url} - Status: ${status} - Error: ${message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
