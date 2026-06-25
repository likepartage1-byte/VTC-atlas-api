import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// تحميل متغيرات البيئة يدوياً
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
  const prisma = new PrismaClient();
  
  const redis = new Redis(process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
  });

  const rideId = randomUUID();
  const passengerId = randomUUID();

  console.log(`🚀 RAW CONCURRENCY TEST`);
  console.log(`DB URL: ${process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND'}`);

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

    console.log('✅ Ride Created. Testing 5 drivers race...');

    const assignRideLogic = async (driverId: string) => {
      const lockKey = `lock:ride_assignment:${rideId}`;
      const acquired = await redis.set(lockKey, driverId, 'EX', 5, 'NX');
      if (acquired !== 'OK') throw new Error('Désolé, cette course est en cours de traitement.');

      try {
        const result = await prisma.ride.updateMany({
          where: { id: rideId, status: 'REQUESTED' },
          data: {
            driverId: driverId,
            status: 'DRIVER_ACCEPTED',
            acceptedAt: new Date()
          }
        });

        if (result.count === 0) throw new Error('La course n’est plus disponible.');
        return true;
      } finally {
        await redis.del(lockKey);
      }
    };

    const drivers = ['driver-A', 'driver-B', 'driver-C', 'driver-D', 'driver-E'];
    const results = await Promise.allSettled(drivers.map(id => assignRideLogic(id)));

    let successCount = 0;
    results.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        console.log(`🏆 ${drivers[i]}: SUCCESS!`);
        successCount++;
      } else {
        console.log(`❌ ${drivers[i]}: FAILED - ${res.reason.message}`);
      }
    });

    const finalRide = await prisma.ride.findUnique({ where: { id: rideId } });
    console.log('\n--- FINAL VERDICT ---');
    console.log(`Success Count: ${successCount}`);
    console.log(`Winner in DB: ${finalRide?.driverId}`);
    
    if (successCount === 1) console.log('\n✨ TEST PASSED ✨');
    else console.log('\n🚨 TEST FAILED 🚨');

  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  }
}

runTest();
