import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { FCMService } from './fcm.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcm: FCMService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  /**
   * Pushes a notification to the background queue for asynchronous delivery.
   */
  async dispatch(userId: string, payload: { title: string; body: string; type: string; data?: any }) {
    this.logger.log(`Queueing notification for user ${userId} | Type: ${payload.type}`);
    return this.notificationQueue.add('send', {
      userId,
      ...payload
    });
  }

  /**
   * Register or update a device token for a user
   */
  async registerToken(userId: string, token: string, platform: string, deviceId?: string) {
    this.logger.log(`Registering push token for user ${userId} on ${platform}`);
    return this.prisma.pushToken.upsert({
      where: { token },
      update: { 
        userId, 
        platform: platform.toLowerCase(), 
        deviceId, 
        isActive: true,
        updatedAt: new Date()
      },
      create: { 
        userId, 
        token, 
        platform: platform.toLowerCase(), 
        deviceId 
      },
    });
  }

  /**
   * Deactivate a token (e.g. on logout)
   */
  async deactivateToken(token: string) {
    return this.prisma.pushToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  /**
   * Send notification to all active tokens of a user
   */
  async sendToUser(userId: string, payload: { title: string; body: string; type: string; data?: any }) {
    // 1. Get user tokens
    const tokens = await this.prisma.pushToken.findMany({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      this.logger.warn(`No active push tokens for user ${userId}. Logging skip.`);
      return this.logToDb(userId, payload, 'FAILED');
    }

    // 2. Send via FCM to all devices
    const sendPromises = tokens.map(t => 
      this.fcm.sendToToken(t.token, payload.title, payload.body, payload.data)
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r === true).length;
    
    const finalStatus = successCount > 0 ? 'SENT' : 'FAILED';
    
    // 3. Persist to notification history
    return this.logToDb(userId, payload, finalStatus);
  }

  private async logToDb(userId: string, payload: { title: string; body: string; type: string; data?: any }, status: string) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          status,
          data: payload.data || {},
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log notification to DB: ${error.message}`);
    }
  }
}
