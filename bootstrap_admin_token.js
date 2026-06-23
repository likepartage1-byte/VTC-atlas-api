#!/usr/bin/env node
// ============================================================
// Atlas VTC — Admin Bootstrap Token Generator v3
// ============================================================
// NO Prisma dependency — takes userId from MySQL directly
//
// Usage:
//   # Step 1: Get admin user ID from MySQL
//   mysql -u root atlas_db -e "SELECT id FROM User WHERE phoneNumber='+212600000001';"
//
//   # Step 2: Pass the ID to this script
//   node bootstrap_admin_token.js <USER_ID>
//
//   # Example:
//   node bootstrap_admin_token.js "abc123-def456-..."
// ============================================================

const path = require('path');
const fs   = require('fs');

// ─── Get userId from CLI argument ─────────────────────────
const userId = process.argv[2];
if (!userId || userId.length < 10) {
  console.log('\n❌ Usage: node bootstrap_admin_token.js <ADMIN_USER_ID>\n');
  console.log('Get the ID from MySQL first:');
  console.log('  mysql -u root atlas_db -e "SELECT id, phoneNumber, role FROM User WHERE role=\'ADMIN\';"');
  console.log('\nThen run:');
  console.log('  node bootstrap_admin_token.js "paste-the-id-here"\n');
  process.exit(1);
}

// ─── Load .env ────────────────────────────────────────────
const envFiles = [
  path.join(__dirname, 'apps/backend-api/.env'),
  path.join(__dirname, '.env'),
];
for (const f of envFiles) {
  if (fs.existsSync(f)) {
    require('dotenv').config({ path: f });
    console.log(`📄 Loaded env: ${f}`);
    break;
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
const REDIS_URL  = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

if (!JWT_SECRET) {
  console.error('\n❌ JWT_SECRET not found in .env');
  process.exit(1);
}
console.log(`🔑 JWT_SECRET loaded (length: ${JWT_SECRET.length})`);

// ─── Resolve module — try multiple paths ──────────────────
function resolveModule(name) {
  const candidates = [
    path.join(__dirname, 'node_modules', name),
    path.join(__dirname, 'apps/backend-api/node_modules', name),
    name, // already in PATH or globally installed
  ];
  for (const p of candidates) {
    try { return require(p); } catch (_) {}
  }
  throw new Error(`Cannot find '${name}'. Run: npm install ${name}`);
}

// ─── Load jwt & ioredis only (no Prisma!) ─────────────────
let jwt, Redis;
try {
  jwt = resolveModule('jsonwebtoken');
  console.log('✅ jsonwebtoken found');
} catch (e) {
  console.error(`❌ ${e.message}`);
  console.error('   Fix: npm install jsonwebtoken');
  process.exit(1);
}

try {
  Redis = resolveModule('ioredis');
  console.log('✅ ioredis found');
} catch (e) {
  console.error(`❌ ${e.message}`);
  console.error('   Fix: npm install ioredis');
  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────
const DEVICE_ID = 'bootstrap-admin-device';

async function main() {
  console.log('\n🚀 Generating admin token\n' + '─'.repeat(44));
  console.log(`   User ID: ${userId}`);
  console.log(`   Role:    ADMIN`);

  // 1. Sign JWT (matches auth.service.ts generateTokens format exactly)
  const sid = `bootstrap-${Date.now()}`;
  const payload = {
    userId:   userId,
    role:     'ADMIN',
    deviceId: DEVICE_ID,
    sid,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  console.log('\n[1/2] JWT signed ✅');

  // 2. Create Redis session (matches session.service.ts key pattern)
  const redis = new Redis(REDIS_URL, { lazyConnect: true });

  try {
    await redis.connect();
    console.log('[2/2] Redis connected ✅');

    const sessionKey = `session:${userId}:${DEVICE_ID}`;
    await redis.set(sessionKey, JSON.stringify({
      phoneNumber: '+212600000001',
      issuedAt:    new Date().toISOString(),
    }), 'EX', 86400); // 24h

    console.log(`      Session key: ${sessionKey}`);

  } catch (err) {
    console.warn(`\n⚠️  Redis session NOT created: ${err.message}`);
    console.warn('   Token signed but AuthGuard may reject it (session check).');
    console.warn('   Fix: ensure Redis is running — redis-cli ping');
  } finally {
    await redis.quit().catch(() => {});
  }

  // ─── Output ─────────────────────────────────────────────
  const bar = '═'.repeat(64);
  console.log(`\n${bar}`);
  console.log('✅  ADMIN TOKEN READY');
  console.log(bar);
  console.log(`\nUser ID:\n  ${userId}\n`);
  console.log(`Access Token (24h):\n  ${accessToken}\n`);
  console.log(bar);
  console.log('\n📋 Test commands:\n');
  console.log(`  curl -s "http://localhost:3000/api/v1/admin/dashboard/insights" \\`);
  console.log(`    -H "Authorization: Bearer ${accessToken}" | python3 -m json.tool\n`);
  console.log(`  curl -s "http://localhost:3000/api/v1/admin/settings/commission" \\`);
  console.log(`    -H "Authorization: Bearer ${accessToken}"\n`);
  console.log(`  curl -s "http://localhost:3000/api/v1/admin/integrity/events" \\`);
  console.log(`    -H "Authorization: Bearer ${accessToken}"\n`);
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
