import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

// Dynamic require to bypass monorepo module resolution in the compiled dist output.
// firebase-admin is installed in apps/backend-api/node_modules, but PM2 runs from
// the dist folder where sub-path exports (firebase-admin/app) cannot be resolved.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const firebaseAdmin = (() => {
  try {
    // Try local node_modules first (production monorepo path)
    return require(path.resolve(
      __dirname,
      '../../../../../../../apps/backend-api/node_modules/firebase-admin',
    ));
  } catch {
    // Fallback: standard resolution (works in local dev)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('firebase-admin');
  }
})();

@Injectable()
export class FCMService implements OnModuleInit {
  private readonly logger = new Logger(FCMService.name);
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

    if (!serviceAccountPath) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not set. FCM notifications will be skipped.');
      return;
    }

    try {
      if (firebaseAdmin.apps.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require(serviceAccountPath);
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccount),
        });
        this.logger.log('FCM Initialized successfully.');
      }
      this.initialized = true;
    } catch (error: any) {
      // Non-fatal: log and continue. The platform runs without push notifications.
      this.logger.error(`FCM Initialization failed: ${error.message}`);
    }
  }

  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.initialized) {
      this.logger.warn('FCM not initialized. Skipping notification.');
      return false;
    }

    try {
      const message = {
        token,
        notification: { title, body },
        data: data ?? {},
        android: {
          priority: 'high' as const,
          notification: { sound: 'default', channelId: 'rides' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      };

      await firebaseAdmin.messaging().send(message);
      this.logger.log(`Notification sent to token: ${token.slice(0, 10)}...`);
      return true;
    } catch (error: any) {
      this.logger.error(`FCM send failed: ${error.message}`);
      return false;
    }
  }
}
