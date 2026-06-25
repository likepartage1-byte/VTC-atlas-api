#!/bin/bash

# ==============================================================================
# Atlas VTC - Forensic Readiness Report
# This script performs deep infrastructure validation on the production VPS.
# ==============================================================================

set -e

PROJECT_ROOT="/root/VTC-atlas-api"
BACKEND_DIR="$PROJECT_ROOT/apps/backend-api"
LOG_FILE="/tmp/atlas_forensic.log"

echo "🔍 Starting Forensic Readiness Report..." | tee $LOG_FILE

# 1. Environment Check
echo "--- [1/5] Environment Check ---" | tee -a $LOG_FILE
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "✅ .env file exists." | tee -a $LOG_FILE
else
    echo "❌ .env file MISSING!" | tee -a $LOG_FILE
    exit 1
fi

# 2. Database Connectivity (Real Prisma Query)
echo "--- [2/5] Database Deep Dive ---" | tee -a $LOG_FILE
cd $PROJECT_ROOT
export $(grep -v '^#' .env | xargs) 2>/dev/null

# Create a small JS script to test Prisma connection
cat <<EOF > $BACKEND_DIR/test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing DB connection...');
  const userCount = await prisma.user.count();
  console.log('✅ Connection Successful! User count in DB:', userCount);
  const systemSettings = await prisma.systemSetting.findMany();
  console.log('✅ System Settings found:', systemSettings.length);
}

main()
  .catch((e) => {
    console.error('❌ DB Connection Failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\$disconnect();
  });
EOF

NODE_PATH="$BACKEND_DIR/node_modules" node $BACKEND_DIR/test-db.js | tee -a $LOG_FILE
rm $BACKEND_DIR/test-db.js

# 3. Redis & BullMQ Health
echo "--- [3/5] Redis & Queue Health ---" | tee -a $LOG_FILE
# Simple ioredis check
cat <<EOF > $BACKEND_DIR/test-redis.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function main() {
  console.log('Testing Redis connection...');
  const ping = await redis.ping();
  console.log('✅ Redis PING:', ping);
  
  console.log('Testing BullMQ structure...');
  const keys = await redis.keys('*notifications*');
  console.log('✅ Notification queue keys found:', keys.length);
}

main()
  .catch((e) => {
    console.error('❌ Redis Connection Failed:', e.message);
    process.exit(1);
  })
  .finally(() => {
    redis.disconnect();
  });
EOF

NODE_PATH="$BACKEND_DIR/node_modules" node $BACKEND_DIR/test-redis.js | tee -a $LOG_FILE
rm $BACKEND_DIR/test-redis.js

# 4. Process Status (PM2)
echo "--- [4/5] PM2 Process Stability ---" | tee -a $LOG_FILE
UPTIME=$(pm2 show atlas-backend | grep uptime | awk '{print $4}')
RESTARTS=$(pm2 show atlas-backend | grep restarts | awk '{print $4}')
STATUS=$(pm2 show atlas-backend | grep status | awk '{print $4}')

echo "App Status: $STATUS" | tee -a $LOG_FILE
echo "App Uptime: $UPTIME" | tee -a $LOG_FILE
echo "Total Restarts: $RESTARTS" | tee -a $LOG_FILE

if [ "$STATUS" == "online" ]; then
    echo "✅ Process is RUNNING." | tee -a $LOG_FILE
else
    echo "❌ Process is DOWN!" | tee -a $LOG_FILE
fi

# 5. API Accessibility
echo "--- [5/5] API Endpoint Test ---" | tee -a $LOG_FILE
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/v1/health)

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Health API is RESPONDING (200)." | tee -a $LOG_FILE
else
    echo "❌ Health API responded with: $HTTP_STATUS" | tee -a $LOG_FILE
fi

echo "====================================================" | tee -a $LOG_FILE
echo "🚀 FORENSIC REPORT COMPLETE." | tee -a $LOG_FILE
echo "====================================================" | tee -a $LOG_FILE
