#!/usr/bin/env node
// ============================================================
// Atlas VTC — Admin Bootstrap Token Generator v2
// ============================================================
// Usage: node bootstrap_admin_token.js
// Run from project root: /root/VTC-atlas-api
// ============================================================

const path = require('path');
const fs   = require('fs');

// ─── Auto-detect project root ─────────────────────────────
const PROJECT_ROOT = __dirname;

// ─── Load .env (try multiple locations) ──────────────────
const envFiles = [
  path.join(PROJECT_ROOT, 'apps/backend-api/.env'),
  path.join(PROJECT_ROOT, '.env'),
  '/root/VTC-atlas-api/apps/backend-api/.env',
  '/root/VTC-atlas-api/.env',
];
for (const f of envFiles) {
  if (fs.existsSync(f)) {
    require('dotenv').config({ path: f });
    console.log(`📄 Loaded env from: ${f}`);
    break;
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
const REDIS_URL  = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not found. Check your .env file.');
  process.exit(1);
}

// ─── Auto-detect node_modules locations ──────────────────
function resolve(moduleName) {
  const candidates = [
    path.join(PROJECT_ROOT, 'node_modules', moduleName),
    path.join(PROJECT_ROOT, 'apps/backend-api/node_modules', moduleName),
    path.join('/root/VTC-atlas-api/node_modules', moduleName),
    path.join('/root/VTC-atlas-api/apps/backend-api/node_modules', moduleName),
    moduleName, // global / already in PATH
  ];
  for (const p of candidates) {
    try {
      return require(p);
    } catch (_) {}
  }
  throw new Error(`Cannot find module '${moduleName}' in any known location.`);
}

// ─── Load dependencies ────────────────────────────────────
let jwt, Redis, PrismaClient;

try {
  jwt = resolve('jsonwebtoken');
  console.log('✅ jsonwebtoken found');
} catch (e) {
  console.error('❌ jsonwebtoken not found. Run: npm install jsonwebtoken');
  process.exit(1);
}

try {
  Redis = resolve('ioredis');
  console.log('✅ ioredis found');
} catch (e) {
  console.error('❌ ioredis not found. Run: npm install ioredis');
  process.exit(1);
}

try {
  // Try .prisma/client first (generated), then @prisma/client
  const prismaLocations = [
    path.join(PROJECT_ROOT, 'apps/backend-api/node_modules/.prisma/client'),
    path.join(PROJECT_ROOT, 'apps/backend-api/node_modules/@prisma/client'),
    path.join(PROJECT_ROOT, 'node_modules/.prisma/client'),
    path.join(PROJECT_ROOT, 'node_modules/@prisma/client'),
  ];
  for (const p of prismaLocations) {
    if (fs.existsSync(p)) {
      PrismaClient = require(p).PrismaClient;
      console.log(`✅ PrismaClient found at: ${p}`);
      break;
    }
  }
  if (!PrismaClient) throw new Error('not found');
} catch (e) {
  console.error('❌ PrismaClient not found. Run: cd apps/backend-api && npx prisma generate');
  process.exit(1);
}

// ─── Constants ────────────────────────────────────────────
const ADMIN_PHONE = '+212600000001';
const DEVICE_ID   = 'bootstrap-admin-device';

// ─── Main ─────────────────────────────────────────────────
async function main() {
  const prisma = new PrismaClient();
  const redis  = new Redis(REDIS_URL, { lazyConnect: true });

  try {
    await redis.connect();
    console.log('\n🚀 Atlas Admin Bootstrap\n' + '─'.repeat(44));

    // 1. Upsert Admin User
    console.log('\n[1/3] Creating/updating admin user in DB...');
    const admin = await prisma.user.upsert({
      where:  { phoneNumber: ADMIN_PHONE },
      update: { role: 'ADMIN', fullName: 'Admin Atlas' },
      create: {
        fullName:    'Admin Atlas',
        phoneNumber: ADMIN_PHONE,
        role:        'ADMIN',
      },
    });
    console.log(`      ID:    ${admin.id}`);
    console.log(`      Phone: ${admin.phoneNumber}`);
    console.log(`      Role:  ${admin.role}`);

    // 2. Sign JWT
    console.log('\n[2/3] Signing JWT token (24h)...');
    const sid     = `bootstrap-${Date.now()}`;
    const payload = { userId: admin.id, role: admin.role, deviceId: DEVICE_ID, sid };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    console.log('      ✅ Done');

    // 3. Create Redis session (matches SessionService key pattern)
    console.log('\n[3/3] Creating Redis session...');
    const sessionKey = `session:${admin.id}:${DEVICE_ID}`;
    await redis.set(sessionKey, JSON.stringify({
      phoneNumber: ADMIN_PHONE,
      issuedAt:    new Date().toISOString(),
    }), 'EX', 86400);
    console.log(`      Key: ${sessionKey}`);

    // ─── Output ──────────────────────────────────────────
    const bar = '═'.repeat(64);
    console.log(`\n${bar}`);
    console.log('✅  ADMIN TOKEN READY');
    console.log(bar);
    console.log(`\nAdmin User ID:\n  ${admin.id}\n`);
    console.log(`Access Token (valid 24h):\n  ${token}\n`);
    console.log(`${bar}`);
    console.log('\nTest immediately:');
    console.log(`\n  curl -s http://localhost:3000/api/v1/admin/dashboard/insights \\`);
    console.log(`       -H "Authorization: Bearer ${token}" | python3 -m json.tool\n`);
    console.log(`  curl -s http://localhost:3000/api/v1/admin/settings/commission \\`);
    console.log(`       -H "Authorization: Bearer ${token}"\n`);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message?.includes('connect ECONNREFUSED')) {
      console.error('   Redis is not reachable at:', REDIS_URL);
      console.error('   Check: redis-cli ping');
    }
    if (err.code === 'P1001') {
      console.error('   DB connection failed. Check DATABASE_URL in .env');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
    await redis.quit().catch(() => {});
  }
}

main();
