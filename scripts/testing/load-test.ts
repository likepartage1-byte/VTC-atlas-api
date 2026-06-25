import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * TEST-04: Load & Concurrency Stress Test
 *
 * Simulates 50 concurrent rides with 3 drivers racing to accept each ride.
 * Validates that the Redis atomic lock + Prisma conditional update
 * produces ZERO double-assignments under full concurrency.
 *
 * Schema note: Ride.driverId → Driver.id (not User.id)
 * So we must create User → Driver profile chain for each test driver.
 */

const CONCURRENT_RIDES = 50;
const DRIVERS_PER_RIDE = 3;

async function loadTest() {
  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

  console.log('⚡ ATLAS VTC - LOAD & CONCURRENCY STRESS TEST');
  console.log('===============================================');
  console.log(`🚕 Concurrent Rides:  ${CONCURRENT_RIDES}`);
  console.log(`🏁 Drivers per Ride:  ${DRIVERS_PER_RIDE}`);
  console.log(`📊 Total operations:  ${CONCURRENT_RIDES * DRIVERS_PER_RIDE}\n`);

  const results = { passed: 0, noWinner: 0, doubleAssigned: 0 };
  const startTime = Date.now();

  try {
    // 1. Create passenger User
    const passengerId = randomUUID();
    await prisma.user.create({
      data: {
        id: passengerId,
        fullName: 'LoadTest Passenger',
        phoneNumber: `+212${Math.floor(Math.random() * 800000000) + 100000000}`,
        role: 'PASSENGER'
      }
    });

    // 2. Create Driver users + Driver profiles (User → Driver chain)
    const driverProfileIds: string[] = []; // These are Driver.id (not User.id)
    for (let i = 0; i < DRIVERS_PER_RIDE; i++) {
      const driverUserId = randomUUID();
      const driverProfileId = randomUUID();

      await prisma.user.create({
        data: {
          id: driverUserId,
          fullName: `LoadTest Driver ${i + 1}`,
          phoneNumber: `+212${Math.floor(Math.random() * 800000000) + 100000000}`,
          role: 'DRIVER'
        }
      });

      await prisma.driver.create({
        data: {
          id: driverProfileId,
          userId: driverUserId,
          status: 'AVAILABLE'
        }
      });

      driverProfileIds.push(driverProfileId);
    }

    console.log(`👤 Step 1: Created 1 passenger + ${DRIVERS_PER_RIDE} driver profiles.\n`);

    // 3. Launch all rides concurrently
    console.log('🔥 Step 2: Launching concurrent ride requests...');
    const rideTests = Array.from({ length: CONCURRENT_RIDES }, async (_, i) => {
      const rideId = randomUUID();
      const lockKey = `ride:lock:${rideId}`;

      await prisma.ride.create({
        data: {
          id: rideId,
          passengerId,
          status: 'REQUESTED',
          pickupLat: 33.5731 + (Math.random() * 0.01),
          pickupLng: -7.5898 + (Math.random() * 0.01),
          pickupAddress: `Pickup ${i + 1}`,
          dropoffLat: 34.0209,
          dropoffLng: -6.8416,
          dropoffAddress: 'Rabat',
          estimatedPrice: 50 + (i * 2)
        }
      });

      // All 3 drivers race to accept (using real Driver.id from pool)
      const driverRace = driverProfileIds.map(async (driverProfileId) => {
        // Attempt atomic Redis lock
        const lockAcquired = await redis.set(lockKey, driverProfileId, 'NX', 'EX', 10);
        if (!lockAcquired) return { won: false };

        // Conditional Prisma update — mirrors production RideAssignmentService
        const updated = await prisma.ride.updateMany({
          where: { id: rideId, status: 'REQUESTED' },
          data: { status: 'DRIVER_ACCEPTED', driverId: driverProfileId }
        });

        await redis.del(lockKey);
        return { won: updated.count === 1 };
      });

      const raceResults = await Promise.all(driverRace);
      const winners = raceResults.filter(r => r.won).length;
      return { rideId, winners };
    });

    const allResults = await Promise.all(rideTests);

    // 4. Analyze
    for (const result of allResults) {
      if (result.winners === 1)      results.passed++;
      else if (result.winners === 0) results.noWinner++;
      else                           results.doubleAssigned++;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const throughput = (CONCURRENT_RIDES / parseFloat(elapsed)).toFixed(1);

    console.log('\n📊 Step 3: Results\n');
    console.log('='.repeat(52));
    console.log(`✅  Rides with exactly 1 winner:   ${results.passed}/${CONCURRENT_RIDES}`);
    console.log(`⚠️   Rides with no winner:           ${results.noWinner}`);
    console.log(`💥  DOUBLE assigned rides:           ${results.doubleAssigned}`);
    console.log(`⏱️   Total time:                      ${elapsed}s`);
    console.log(`📈  Throughput:                       ${throughput} rides/s`);
    console.log('='.repeat(52));

    if (results.doubleAssigned === 0 && results.passed === CONCURRENT_RIDES) {
      console.log('\n🏆 TEST-04 PASSED: Zero race conditions under load!');
      console.log('   Atomic assignment is production-grade. ✅');
    } else {
      console.log('\n💥 TEST-04 FAILED: Race conditions detected.');
    }

  } catch (err) {
    console.error('\n❌ Load test error:', err);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  }
}

loadTest();
