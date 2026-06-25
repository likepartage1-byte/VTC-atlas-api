import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../apps/backend-api/src/app.module';
import { NotificationService } from '../../apps/backend-api/src/modules/notifications/application/services/notification.service';

async function bootstrap() {
  console.log('🚀 Starting Notification Integration Test...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(NotificationService);

  const testUser = '9b30db61-2297-44fe-bb40-0edb0a7e8e8d'; // From dump
  
  console.log(`Sending test job for user [${testUser}]...`);
  
  await service.dispatch(testUser, {
    title: 'Test Notification',
    body: 'This is a background job test from BullMQ.',
    type: 'SYSTEM_TEST',
    data: { test: true }
  });

  console.log('✅ Job PUSHED to BullMQ notifications queue.');
  
  // Wait a bit to see logs from the processor (if we were tailing logs)
  console.log('Wait 5s for processing...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await app.close();
  console.log('Integration test script finished.');
}

bootstrap().catch(err => {
  console.error('❌ Integration test FAILED:', err);
  process.exit(1);
});
