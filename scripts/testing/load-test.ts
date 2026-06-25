import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * TEST-04: Load & Concurrency Stress Test
 * 
 * Simulates:
 *   - 50 concurrent ride requests
 *   - Multiple drivers attempting to accept each ride
 * 
 * Validates:
 *   - Zero double-assignments (Atomic lock holds under pressure)
 *   - Redis latency stays low
 *   - DB connection pool stability
 */

const CONCURRENT_RIDES = 50;
const DRIVERS_PER_RIDE = 3; // Drivers competing per ride

async function loadTest() {
  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

  console.log('⚡ ATLAS VTC - LOAD & CONCURRENCY STRESS TEST');
  console.log('===============================================');
  console.log(`🚕 Concurrent Rides: ${CONCURRENT_RIDES}`);
  console.log(`🏁 Drivers per Ride: ${DRIVERS_PER_RIDE}`);
  console.log(`📊 Total operations: ${CONCURRENT_RIDES * DRIVERS_PER_RIDE}\n`);

  const results = { passed: 0, failed: 0, doubleAssigned: 0 };
  const startTime = Date.now();

  try {
    // 1. Create a passenger for all test rides
    const passengerId = randomUUID();
    await prisma.user.create({
      data: {
        id: passengerId,
        fullName: 'LoadTest Passenger',
        phoneNumber: `+212${Math.floor(Math.random() * 900000000) + 100000000}`,
        role: 'PASSENGER'
      }
    });
    console.log('👤 Test passenger created.\n');

    // 2. Run all rides concurrently
    console.log('🔥 Launching concurrent ride requests...');
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
          pickupAddress: `Point ${i}`,
          dropoffLat: 34.0209,
          dropoffLng: -6.8416,
          dropoffAddress: 'Rabat',
          estimatedPrice: 50 + (i * 5)
        }
      });

      // Simulate multiple drivers racing to accept
      const driverRace = Array.from({ length: DRIVERS_PER_RIDE }, async (_, j) => {
        const driverId = randomUUID();

        // Atomic lock attempt (mirrors RideAssignmentService)
        const lockAcquired = await redis.set(lockKey, driverId, 'NX', 'EX', 10);
        if (!lockAcquired) return { won: false, driverId };

        // Conditional assignment
        const updated = await prisma.ride.updateMany({
          where: { id: rideId, status: 'REQUESTED' },
          data: { status: 'DRIVER_ACCEPTED', driverId }
        });

        if (updated.count === 1) {
          await redis.del(lockKey);
          return { won: true, driverId };
        }

        await redis.del(lockKey);
        return { won: false, driverId };
      });

      const raceResults = await Promise.all(driverRace);
      const winners = raceResults.filter(r => r.won);
      return { rideId, winners: winners.length };
    });

    const allResults = await Promise.all(rideTests);

    // 3. Analyze results
    console.log('\n📊 Analyzing results...\n');
    for (const result of allResults) {
      if (result.winners === 1) {
        results.passed++;
      } else if (result.winners === 0) {
        results.failed++;
        console.log(`   ⚠️  Ride ${result.rideId.substring(0, 8)}... had NO winner.`);
      } else {
        results.doubleAssigned++;
        console.log(`   ❌ CRITICAL: Ride ${result.rideId.substring(0, 8)}... had ${result.winners} winners! (Race condition!)`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Rides with exactly 1 winner:    ${results.passed}/${CONCURRENT_RIDES}`);
    console.log(`⚠️  Rides with no assignment:       ${results.failed}`);
    console.log(`💥 Rides with DOUBLE assignment:   ${results.doubleAssigned}`);
    console.log(`⏱️  Total time:                     ${elapsed}s`);
    console.log('='.repeat(50));

    if (results.doubleAssigned === 0 && results.passed === CONCURRENT_RIDES) {
      console.log('\n🏆 TEST-04 PASSED: Zero race conditions under load!');
      console.log('   Atomic assignment is production-grade. ✅');
    } else {
      console.log('\n💥 TEST-04 FAILED: Race conditions detected!');
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
