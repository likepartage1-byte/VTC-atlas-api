import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface TraceStep {
  step: string;
  source: string;
  data?: any;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  error?: string;
}

@Injectable()
export class WorkflowTraceService {
  private readonly logger = new Logger(WorkflowTraceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Captures a precise execution step in the ride workflow.
   * In production, this can push to a dedicated Trace DB or Elastic.
   */
  async capture(rideId: string, trace: TraceStep): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Log to standard STDOUT for immediate visibility
    const logMsg = `[WorkflowTrace] [Ride:${rideId}] [${trace.step}] [${trace.status}] - Source: ${trace.source}`;
    if (trace.status === 'FAILED') {
      this.logger.error(`${logMsg} - Error: ${trace.error}`);
    } else {
      this.logger.log(logMsg);
    }

    // Persist to DB if the table exists (Architectural Hook)
    try {
      // Logic for persisting trace to a ride_workflow_logs table
      // For now, we use the logger as the primary sink, 
      // but the hook is ready for a persistent Control Plane.
    } catch (err) {
      this.logger.warn(`Failed to persist trace for ride ${rideId}`);
    }
  }
}
