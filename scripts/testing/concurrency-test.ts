import { Test } from '@nestjs/testing';
import { RidesModule } from '../../apps/backend-api/src/modules/rides/rides.module';
import { RideAssignmentService } from '../../apps/backend-api/src/modules/rides/application/services/ride-assignment.service';
import { PrismaService } from '../../apps/backend-api/src/core/prisma/prisma.service';
import { RideStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

async function runTest() {
  console.log('🧪 Bootstrapping Isolated Test Context...');
  
  // تحميل مديول الرحلات فقط مع الـ Core التابع له
  const moduleRef = await Test.createTestingModule({
    imports: [RidesModule],
  }).compile();

  const service = moduleRef.get(RideAssignmentService);
  const prisma = moduleRef.get(PrismaService);

  const rideId = randomUUID();
  const passengerId = randomUUID();

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
  let winners = 0;
  results.forEach((res, index) => {
    const driver = drivers[index];
    if (res.status === 'fulfilled') {
      console.log(`🏆 ${driver}: SUCCESS - Ride Secured!`);
      winners++;
    } else {
      console.log(`❌ ${driver}: CONFLICT - ${res.reason.message}`);
    }
  });

  // 4. التحقق النهائي
  const finalState = await prisma.ride.findUnique({ where: { id: rideId } });
  console.log('\n--- FINAL VERDICT ---');
  console.log(`Winners Count: ${winners}`);
  console.log(`Final Status: ${finalState?.status}`);
  console.log(`Final Global Winner: ${finalState?.driverId}`);

  if (winners === 1 && finalState?.status === RideStatus.DRIVER_ACCEPTED) {
    console.log('\n✨ TEST PASSED: Atomic Integrity Confirmed! ✨');
  } else {
    console.log('\n🚨 TEST FAILED: Race Condition Detected! 🚨');
  }

  await moduleRef.close();
  process.exit(0);
}

runTest().catch(err => {
  console.error('💥 Test Execution Error:', err);
  process.exit(1);
});
