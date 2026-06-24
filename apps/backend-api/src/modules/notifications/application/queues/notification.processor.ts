import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from '../services/notification.service';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  /**
   * Processes the notification job from the queue.
   * This ensures non-blocking delivery and handles retries automatically.
   */
  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, title, body, type, data } = job.data;
    
    this.logger.log(`Processing background notification | Job: ${job.id} | User: ${userId} | Type: ${type}`);
    
    try {
      await this.notificationService.sendToUser(userId, { 
        title, 
        body, 
        type, 
        data 
      });
      
      return { status: 'COMPLETED', userId };
    } catch (error) {
      this.logger.error(`Background job failed for notification: ${error.message}`);
      // Re-throwing will allow BullMQ to use the retry strategy defined in the module
      throw error; 
    }
  }
}
