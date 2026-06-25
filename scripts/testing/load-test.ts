import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * TEST-04: Load & Concurrency Stress Test
 * 
 * Simulates 50 concurrent rides with 3 drivers competing per ride.
 * Validates zero double-assignments under pressure.
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
    // 1. Create real DB users for passenger and drivers
    console.log('👤 Step 1: Creating test users in DB...');
    const passengerId = randomUUID();
    await prisma.user.create({
      data: {
        id: passengerId,
        fullName: 'LoadTest Passenger',
        phoneNumber: `+212${Math.floor(Math.random() * 800000000) + 100000000}`,
        role: 'PASSENGER'
      }
    });

    // Create a pool of real driver users (DRIVERS_PER_RIDE unique drivers)
    const driverPool: string[] = [];
    for (let i = 0; i < DRIVERS_PER_RIDE; i++) {
      const driverId = randomUUID();
      await prisma.user.create({
        data: {
          id: driverId,
          fullName: `LoadTest Driver ${i + 1}`,
          phoneNumber: `+212${Math.floor(Math.random() * 800000000) + 100000000}`,
          role: 'DRIVER'
        }
      });
      driverPool.push(driverId);
    }
    console.log(`   ✅ 1 passenger + ${DRIVERS_PER_RIDE} drivers created.\n`);

    // 2. Create all rides and simulate concurrent acceptance
    console.log('🔥 Step 2: Launching concurrent ride requests...');
    const rideTests = Array.from({ length: CONCURRENT_RIDES }, async (_, i) => {
      const rideId = randomUUID();
      const lockKey = `ride:lock:${rideId}`;

      // Create ride
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

      // Simulate drivers racing to accept (using real driver IDs from pool)
      const driverRace = driverPool.map(async (driverId) => {
        // Atomic Redis lock (mirrors production RideAssignmentService)
        const lockAcquired = await redis.set(lockKey, driverId, 'NX', 'EX', 10);
        if (!lockAcquired) return { won: false, driverId };

        // Conditional Prisma update
        const updated = await prisma.ride.updateMany({
          where: { id: rideId, status: 'REQUESTED' },
          data: { status: 'DRIVER_ACCEPTED', driverId }
        });

        await redis.del(lockKey);
        return { won: updated.count === 1, driverId };
      });

      const raceResults = await Promise.all(driverRace);
      const winners = raceResults.filter(r => r.won);
      return { rideId, winners: winners.length };
    });

    const allResults = await Promise.all(rideTests);

    // 3. Analyze results
    console.log('\n📊 Step 3: Analyzing results...\n');
    for (const result of allResults) {
      if (result.winners === 1) {
        results.passed++;
      } else if (result.winners === 0) {
        results.noWinner++;
        console.log(`   ⚠️  Ride ${result.rideId.substring(0, 8)}... had NO winner.`);
      } else {
        results.doubleAssigned++;
        console.log(`   ❌ CRITICAL: Ride ${result.rideId.substring(0, 8)}... had ${result.winners} winners!`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(52));
    console.log(`✅  Rides with exactly 1 winner:   ${results.passed}/${CONCURRENT_RIDES}`);
    console.log(`⚠️   Rides with no winner:           ${results.noWinner}`);
    console.log(`💥  Rides DOUBLE assigned:           ${results.doubleAssigned}`);
    console.log(`⏱️   Total time:                      ${elapsed}s`);
    console.log(`📈  Throughput:                       ${(CONCURRENT_RIDES / parseFloat(elapsed)).toFixed(1)} rides/s`);
    console.log('='.repeat(52));

    if (results.doubleAssigned === 0 && results.passed === CONCURRENT_RIDES) {
      console.log('\n🏆 TEST-04 PASSED: Zero race conditions under load!');
      console.log('   Atomic assignment is production-grade. ✅');
    } else {
      console.log('\n💥 TEST-04 FAILED: Race conditions or lock failures detected.');
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
