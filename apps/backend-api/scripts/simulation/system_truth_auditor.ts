import Redis from 'ioredis';

const redis = new Redis('redis://localhost:6379');

async function audit() {
  console.log('--- 🛡️ Redis Truth Audit ---');
  
  // 1. فحص عدد السائقين "المتاحين" في Redis
  const presenceKeys = await redis.keys('presence:driver:*');
  let availableCount = 0;
  for (const key of presenceKeys) {
    const status = await redis.get(key);
    if (status === 'AVAILABLE') availableCount++;
  }
  
  // 2. فحص عدد السائقين في الفهرس الجغرافي
  const geoCount = await redis.zcard('geo:drivers:available');
  
  console.log(`📡 Total Presence Keys: ${presenceKeys.length}`);
  console.log(`✅ Drivers AVAILABLE: ${availableCount}`);
  console.log(`📍 Drivers in GEO Index: ${geoCount}`);
  
  if (availableCount !== geoCount) {
    console.warn('⚠️ MISMATCH DETECTED: Presence and GEO index are out of sync!');
  } else {
    console.log('🟢 System Integrity: OK');
  }
}

setInterval(audit, 5000);
audit();
