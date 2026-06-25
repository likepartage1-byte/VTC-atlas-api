import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

// هذا السكريبت يحاكي منطق الـ RideAssignmentService تماماً ولكن بشكل مباشر
async function runTest() {
  const prisma = new PrismaClient();
  // نفترض أن Redis يعمل على localhost:6379 (كما هو في معظم الـ VPS)
  const redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
  });

  const rideId = randomUUID();
  const passengerId = randomUUID();

  console.log(`🚀 RAW CONCURRENCY TEST (No NestJS overhead)`);
  console.log(`Ride ID: ${rideId}`);

  try {
    // 1. إعداد البيانات
    await prisma.ride.create({
      data: {
        id: rideId,
        passengerId: passengerId,
        status: 'REQUESTED',
        pickupLat: 33.5731,
        pickupLng: -7.5898,
        pickupAddress: 'Casablanca',
        dropoffLat: 33.5889,
        dropoffLng: -7.6114,
        dropoffAddress: 'Maarif',
        estimatedPrice: 35.00
      }
    });

    console.log('✅ Ride Created in DB. Testing 5 drivers race...');

    // محاكاة منطق الخدمة
    const assignRideLogic = async (driverId: string) => {
      const lockKey = `lock:ride_assignment:${rideId}`;
      
      // الخطوة 1: Redis Lock
      const acquired = await redis.set(lockKey, driverId, 'EX', 5, 'NX');
      if (acquired !== 'OK') {
        throw new Error('Désolé, cette course est en cours de traitement.');
      }

      try {
        // الخطوة 2: Conditional Update
        const result = await prisma.ride.updateMany({
          where: { id: rideId, status: 'REQUESTED' },
          data: {
            driverId: driverId,
            status: 'DRIVER_ACCEPTED',
            acceptedAt: new Date()
          }
        });

        if (result.count === 0) {
          throw new Error('La course n’est plus disponible.');
        }
        return true;
      } finally {
        await redis.del(lockKey);
      }
    };

    // 2. إطلاق السباق
    const drivers = ['driver-A', 'driver-B', 'driver-C', 'driver-D', 'driver-E'];
    const results = await Promise.allSettled(drivers.map(id => assignRideLogic(id)));

    // 3. تحليل النتائج
    let successCount = 0;
    results.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        console.log(`🏆 ${drivers[i]}: SUCCESS!`);
        successCount++;
      } else {
        console.log(`❌ ${drivers[i]}: FAILED - ${res.reason.message}`);
      }
    });

    // 4. التحقق النهائي من قاعدة البيانات
    const finalRide = await prisma.ride.findUnique({ where: { id: rideId } });
    console.log('\n--- FINAL VERDICT ---');
    console.log(`Success Count: ${successCount}`);
    console.log(`Winner in DB: ${finalRide?.driverId}`);
    
    if (successCount === 1) {
      console.log('\n✨ TEST PASSED: Atomic Logic Verified! ✨');
    } else {
      console.log('\n🚨 TEST FAILED: Race Condition Detected! 🚨');
    }

  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  }
}

runTest();
