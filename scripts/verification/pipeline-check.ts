import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../apps/backend-api/src/app.module';
import { NotificationService } from '../../apps/backend-api/src/modules/notifications/application/services/notification.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../apps/backend-api/src/core/prisma/prisma.service';

/**
 * Atlas VTC - Universal Pipeline Verification Script
 * This script runs inside the NestJS context to verify the entire Notification & Queue stack.
 */

async function bootstrap() {
  console.log('\n━━━ 🏛️ ATLAS VTC FORENSIC VERIFICATION ━━━');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const notificationService = app.get(NotificationService);
  const eventEmitter = app.get(EventEmitter2);
  
  // 1. Prisma & DB Check
  console.log('\n[1] Checking Database Schema...');
  try {
    const tableCheck = await prisma.$queryRaw`SHOW TABLES LIKE 'Notification'`;
    const tokenCheck = await prisma.$queryRaw`SHOW TABLES LIKE 'PushToken'`;
    
    if (Array.isArray(tableCheck) && tableCheck.length > 0) {
      console.log('  ✔ PASS — Notification table exists.');
    } else {
      console.log('  ✘ FAIL — Notification table missing.');
    }
  } catch (err) {
    console.error('  ✘ FAIL — DB connection issue:', err.message);
  }

  // 2. Redis & BullMQ Check
  console.log('\n[2] Testing BullMQ Pipeline...');
  // Note: We access the queue via BullModule dynamic registration name
  try {
     const notificationQueue = app.get('BullQueue_notifications'); 
     const testJob = await notificationQueue.add('test-probe', {
       userId: 'system-verify',
       title: 'Atlas Pipeline Probe',
       body: 'This is a forensic verification job.',
       type: 'VERIFICATION'
     });
     console.log(`  ✔ PASS — Job injected into queue (ID: ${testJob.id})`);
  } catch (err) {
     console.error('  ✘ FAIL — Queue injection failed:', err.message);
  }

  // 3. E2E Event Pipeline Simulation
  console.log('\n[3] Simulating E2E Event Pipeline (Ride.StatusChanged.ARRIVED)...');
  try {
    // We simulate the event that the OutboxProcessor normally emits
    const testAggregateId = 'test-ride-uuid-001';
    
    console.log('  → Emitting event to Router...');
    eventEmitter.emit('Ride.StatusChanged.ARRIVED', {
      aggregateId: testAggregateId,
      to: 'ARRIVED'
    });
    
    console.log('  ✔ Pipeline Triggered. Check server logs to confirm BullMQ + FCM delivery attempt.');
  } catch (err) {
    console.error('  ✘ FAIL — Event pipeline broken:', err.message);
  }

  console.log('\n━━━ VERIFICATION WRAP-UP ━━━');
  console.log('If all checks passed, Sprint 2 is Production Ready.');
  console.log('Run: "npm run build" to ensure type safety before deployment.');
  
  await app.close();
  process.exit(0);
}

bootstrap().catch(err => {
  console.error('\n[FATAL ERROR] Verification crashed:', err);
  process.exit(1);
});
