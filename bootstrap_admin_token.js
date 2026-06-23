#!/usr/bin/env node
// ============================================================
// Atlas VTC — Admin Bootstrap Token Generator
// ============================================================
// Usage (run on VPS from project root):
//   node bootstrap_admin_token.js
//
// What it does:
//   1. Creates admin user in DB (if not exists)
//   2. Creates Redis session
//   3. Signs a valid JWT token
//   4. Outputs the token ready to use in Postman/Dashboard
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/backend-api/.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') }); // fallback

const jwt  = require(path.join(__dirname, 'apps/backend-api/node_modules/jsonwebtoken'));
const Redis = require(path.join(__dirname, 'apps/backend-api/node_modules/ioredis'));

// ─── Config ──────────────────────────────────────────────────
const JWT_SECRET  = process.env.JWT_SECRET;
const REDIS_URL   = process.env.REDIS_URL || 'redis://localhost:6379';
const ADMIN_PHONE = '+212600000001';
const DEVICE_ID   = 'bootstrap-admin-device';

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in .env');
  process.exit(1);
}

// ─── Prisma ───────────────────────────────────────────────────
let PrismaClient;
try {
  PrismaClient = require(path.join(__dirname, 'apps/backend-api/node_modules/.prisma/client')).PrismaClient;
} catch (e) {
  try {
    PrismaClient = require(path.join(__dirname, 'apps/backend-api/node_modules/@prisma/client')).PrismaClient;
  } catch (e2) {
    console.error('❌ Cannot find PrismaClient. Run: cd apps/backend-api && npx prisma generate');
    process.exit(1);
  }
}

async function main() {
  const prisma = new PrismaClient();
  const redis  = new Redis(REDIS_URL);

  try {
    console.log('\n🚀 Atlas Admin Bootstrap\n' + '─'.repeat(40));

    // ─── 1. Upsert Admin User ──────────────────────────────
    console.log('1. Ensuring admin user exists in DB...');
    const admin = await prisma.user.upsert({
      where:  { phoneNumber: ADMIN_PHONE },
      update: { role: 'ADMIN', fullName: 'Admin Atlas' },
      create: {
        fullName:    'Admin Atlas',
        phoneNumber: ADMIN_PHONE,
        role:        'ADMIN',
      },
    });

    console.log(`   ✅ Admin user: ${admin.id} | ${admin.phoneNumber} | ${admin.role}`);

    // ─── 2. Build JWT Payload ─────────────────────────────
    const sid     = `bootstrap-${Date.now()}`;
    const payload = {
      userId:   admin.id,
      role:     admin.role,
      deviceId: DEVICE_ID,
      sid,
    };

    // ─── 3. Sign Token (24h) ──────────────────────────────
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    console.log('2. JWT signed (24h validity)');

    // ─── 4. Create Redis Session ──────────────────────────
    const sessionKey = `session:${admin.id}:${DEVICE_ID}`;
    await redis.set(sessionKey, JSON.stringify({
      phoneNumber: ADMIN_PHONE,
      issuedAt:    new Date().toISOString(),
    }), 'EX', 86400); // 24h to match token

    console.log(`3. Redis session created: ${sessionKey}`);

    // ─── 5. Output ────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('✅ ADMIN TOKEN READY');
    console.log('═'.repeat(60));
    console.log('\nAdmin ID:');
    console.log('  ' + admin.id);
    console.log('\nAccess Token (copy this):');
    console.log('  ' + accessToken);
    console.log('\nTest it now:');
    console.log(`  curl -s http://localhost:3000/api/v1/admin/dashboard/insights \\`);
    console.log(`       -H "Authorization: Bearer ${accessToken}" | python3 -m json.tool`);
    console.log('\n' + '═'.repeat(60));
    console.log('📋 For Postman: set variable adminToken =', accessToken.substring(0, 50) + '...');
    console.log('');

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.code === 'P2002') {
      console.error('   Hint: User with this phone already exists (different role?)');
      console.error('   Fix: UPDATE User SET role="ADMIN" WHERE phoneNumber="+212600000001";');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
  }
}

main();
