import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
  });

  const rideId = randomUUID();
  const passengerId = randomUUID();
  const drivers = ['driver-A', 'driver-B', 'driver-C', 'driver-D', 'driver-E'];
  const driverUuids: string[] = [];

  console.log(`🚀 FINAL CONCURRENCY TEST ENVIRONMENT`);

  try {
    // 1. إنشاء راكب تجريبي
    await prisma.user.create({
        data: {
            id: passengerId,
            fullName: 'Test Passenger',
            phoneNumber: `+212${Math.floor(100000000 + Math.random() * 900000000)}`,
            role: 'PASSENGER'
        }
    });

    // 2. إنشاء السائقين الخمسة كبيانات حقيقية
    console.log('👷 Creating 5 real Driver profiles...');
    for (const dName of drivers) {
        const uId = randomUUID();
        const dId = randomUUID(); // هذا الـ ID الذي سنستخدمه في الـ Ride
        driverUuids.push(dId);

        await prisma.user.create({
            data: {
                id: uId,
                fullName: `Driver ${dName}`,
                phoneNumber: `+212${Math.floor(100000000 + Math.random() * 900000000)}`,
                role: 'DRIVER',
                driverProfile: {
                    create: {
                        id: dId,
                        status: 'OFFLINE'
                    }
                }
            }
        });
    }

    // 3. إنشاء رحلة متاحة
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

    console.log('✅ Environment Ready. Racing between 5 drivers...');

    const assignRideLogic = async (driverId: string, index: number) => {
      const lockKey = `lock:ride_assignment:${rideId}`;
      const acquired = await redis.set(lockKey, driverId, 'EX', 5, 'NX');
      if (acquired !== 'OK') throw new Error('Lock denied.');

      try {
        const result = await prisma.ride.updateMany({
          where: { id: rideId, status: 'REQUESTED' },
          data: {
            driverId: driverId,
            status: 'DRIVER_ACCEPTED',
            acceptedAt: new Date()
          }
        });

        if (result.count === 0) throw new Error('Already accepted.');
        return true;
      } finally {
        await redis.del(lockKey);
      }
    };

    // إطلاق السباق باستخدام الـ IDs الحقيقية للسائقين
    const results = await Promise.allSettled(driverUuids.map((id, i) => assignRideLogic(id, i)));

    let successCount = 0;
    results.forEach((res, i) => {
      const dName = drivers[i];
      if (res.status === 'fulfilled') {
        console.log(`🏆 ${dName}: SUCCESS!`);
        successCount++;
      } else {
        console.log(`❌ ${dName}: DENIED - ${res.reason.message}`);
      }
    });

    const finalRide = await prisma.ride.findUnique({ where: { id: rideId } });
    console.log('\n--- FINAL VERDICT ---');
    console.log(`Success Count: ${successCount}`);
    console.log(`Final Winner ID: ${finalRide?.driverId}`);
    
    if (successCount === 1) console.log('\n✨ TEST PASSED: Atomic Integrity ✨');
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
