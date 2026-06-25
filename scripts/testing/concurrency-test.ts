import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../apps/backend-api/src/app.module';
import { RideAssignmentService } from '../../apps/backend-api/src/modules/rides/application/services/ride-assignment.service';
import { PrismaService } from '../../apps/backend-api/src/core/prisma/prisma.service';
import { RideStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

async function runTest() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(RideAssignmentService);
  const prisma = app.get(PrismaService);

  const rideId = uuid();
  const passengerId = uuid(); // وهمي

  console.log(`🚀 Starting Concurrency Test for Ride: ${rideId}`);

  // 1. إنشاء رحلة متاحة
  await prisma.ride.create({
    data: {
      id: rideId,
      passengerId: passengerId,
      status: RideStatus.REQUESTED,
      pickupLat: 33.5731,
      pickupLng: -7.5898,
      pickupAddress: 'Casablanca',
      dropoffLat: 33.5889,
      dropoffLng: -7.6114,
      dropoffAddress: 'Maarif',
      estimatedPrice: 35.00
    }
  });

  console.log('✅ Ride Created. Launching 5 simultaneous drivers...');

  // 2. إطلاق 5 سائقين متزامنين
  const drivers = ['driver-A', 'driver-B', 'driver-C', 'driver-D', 'driver-E'];
  
  const results = await Promise.allSettled(
    drivers.map(id => service.assignRide(rideId, id))
  );

  // 3. تحليل النتائج
  results.forEach((res, index) => {
    const driver = drivers[index];
    if (res.status === 'fulfilled') {
      console.log(`🏆 ${driver}: SUCCESS - Ride Secured!`);
    } else {
      console.log(`❌ ${driver}: CONFLICT - ${res.reason.message}`);
    }
  });

  // 4. التحقق النهائي من قاعدة البيانات
  const finalState = await prisma.ride.findUnique({ where: { id: rideId } });
  console.log('\n--- FINAL VERDICT ---');
  console.log(`Status: ${finalState?.status}`);
  console.log(`Winner: ${finalState?.driverId}`);

  await app.close();
  process.exit(0);
}

runTest();
