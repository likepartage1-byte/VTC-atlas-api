import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FCMService implements OnModuleInit {
  private readonly logger = new Logger(FCMService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
    
    if (serviceAccountPath) {
      try {
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath)),
          });
          this.logger.log('FCM Initialized with service account file.');
        } 
        this.firebaseApp = admin.app();
      } catch (error: any) {
        this.logger.error(`FCM Initialization failed: ${error.message}`);
      }
    } else {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not found. FCM operations will be skipped.');
    }
  }

  async sendToToken(token: string, title: string, body: string, data?: any): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.error('Cannot send notification: Firebase App not initialized.');
      return false;
    }

    try {
      const message = {
        token,
        notification: { title, body },
        data: data ? this.sanitizeData(data) : {},
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'rides',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      await admin.messaging().send(message);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send FCM message to token ${token.slice(0, 10)}...: ${error.message}`);
      return false;
    }
  }

  private sanitizeData(data: any): { [key: string]: string } {
    const sanitized: { [key: string]: string } = {};
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        sanitized[key] = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
      }
    }
    return sanitized;
  }
}
