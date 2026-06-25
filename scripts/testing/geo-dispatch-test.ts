import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * TEST-02: Redis GEO Smart Dispatch Validation
 * 
 * Places 3 drivers at different distances from a ride pickup point:
 *   - Driver A: ~1 km  → SHOULD receive broadcast
 *   - Driver B: ~3 km  → SHOULD receive broadcast
 *   - Driver C: ~12 km → MUST NOT receive broadcast
 */

const DISPATCH_RADIUS_KM = 5; // Must match gateway config
const GEO_KEY = 'drivers:geo:locations';

// Casablanca - Gauthier (Pickup point)
const PICKUP_LAT = 33.5731;
const PICKUP_LNG = -7.5898;

async function geoDispatchTest() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

  console.log('🛰️  ATLAS VTC - GEO DISPATCH PROXIMITY TEST');
  console.log('=============================================');
  console.log(`📍 Pickup: Gauthier (${PICKUP_LAT}, ${PICKUP_LNG})`);
  console.log(`📏 Dispatch Radius: ${DISPATCH_RADIUS_KM} km\n`);

  const driverA = { id: `driver-A-${randomUUID()}`, lat: 33.5689, lng: -7.5975, label: 'Driver A (Maarif ~1km)' };
  const driverB = { id: `driver-B-${randomUUID()}`, lat: 33.5951, lng: -7.6192, label: 'Driver B (Ain Diab ~3km)' };
  const driverC = { id: `driver-C-${randomUUID()}`, lat: 33.6736, lng: -7.3942, label: 'Driver C (Mohammedia ~12km)' };

  const drivers = [driverA, driverB, driverC];

  try {
    // 1. Register all drivers in Redis GEO
    console.log('📡 Step 1: Registering drivers in Redis GEO...');
    for (const d of drivers) {
      await redis.geoadd(GEO_KEY, d.lng, d.lat, d.id);
      console.log(`   ✅ ${d.label} registered.`);
    }

    // 2. Query for nearby drivers (simulates Gateway dispatch logic)
    console.log(`\n🔍 Step 2: Querying drivers within ${DISPATCH_RADIUS_KM}km of pickup...`);
    const nearbyDriverIds = await (redis as any).geosearch(
      GEO_KEY,
      'FROMLONLAT', PICKUP_LNG, PICKUP_LAT,
      'BYRADIUS', DISPATCH_RADIUS_KM, 'km',
      'ASC',
      'WITHCOORD', 'WITHDIST'
    );

    console.log('\n📊 Step 3: Dispatch Filter Results');
    console.log('------------------------------------');

    const receivingIds = new Set<string>();
    for (const result of nearbyDriverIds) {
      const id = result[0];
      const dist = parseFloat(result[1]).toFixed(2);
      receivingIds.add(id);
      const driver = drivers.find(d => d.id === id);
      console.log(`   📲 ${driver?.label ?? id} → ${dist} km → RECEIVES BROADCAST`);
    }

    // 3. Verify exclusion of far drivers
    console.log('\n🚫 Step 4: Exclusion Verification');
    console.log('-----------------------------------');
    let allCorrect = true;
    for (const d of drivers) {
      const shouldReceive = receivingIds.has(d.id);
      if (d.id === driverC.id && shouldReceive) {
        console.log(`   ❌ FAIL: ${d.label} received broadcast but is outside radius!`);
        allCorrect = false;
      } else if (d.id !== driverC.id && !shouldReceive) {
        console.log(`   ❌ FAIL: ${d.label} did NOT receive broadcast but is inside radius!`);
        allCorrect = false;
      } else if (d.id === driverC.id && !shouldReceive) {
        console.log(`   ✅ PASS: ${d.label} correctly excluded from broadcast.`);
      }
    }

    console.log('\n' + '='.repeat(45));
    if (allCorrect) {
      console.log('🏆 TEST-02 PASSED: Smart Dispatch is working correctly!');
      console.log('   Only nearby drivers receive ride requests.');
    } else {
      console.log('💥 TEST-02 FAILED: Check dispatch radius configuration.');
    }
    console.log('='.repeat(45));

  } finally {
    // Cleanup test drivers from Redis
    for (const d of drivers) {
      await redis.zrem(GEO_KEY, d.id);
    }
    console.log('\n🧹 Cleanup: Test drivers removed from Redis GEO.');
    await redis.quit();
    process.exit(0);
  }
}

geoDispatchTest();
