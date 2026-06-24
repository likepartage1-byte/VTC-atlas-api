#!/usr/bin/env bash
# Atlas VTC - Forensic Verification Report Generator
# Run this on the VPS to provide proof of Production Readiness.

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m';
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

section "1. PRISMA MIGRATION STATUS"
cd apps/backend-api && npx prisma migrate status --schema=prisma/schema.prisma

section "2. BUILD VERIFICATION"
npm run build && echo -e "${GREEN}BUILD SUCCESS (Exit 0)${NC}" || echo -e "${RED}BUILD FAILED${NC}"

section "3. REDIS CONNECTIVITY"
node -e "
const Redis=require('ioredis');
const r=new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
r.ping()
  .then(res => console.log('Redis PING:', res === 'PONG' ? '✅ PONG' : '✘ FAILED'))
  .catch(err => console.error('Redis Error:', err.message))
  .finally(() => r.disconnect());
"

section "4. BULLMQ QUEUE CHECK"
# Checks if the 'notifications' queue is registered in Redis
node -e "
const Redis=require('ioredis');
const r=new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
async function check() {
  const keys = await r.keys('*bull:notifications*');
  console.log('BullMQ Queue Registration:', keys.length > 0 ? '✅ FOUND' : '✘ NOT FOUND');
}
check().finally(() => r.disconnect());
"

section "5. RECENT NOTIFICATION LOGS (DB)"
# Shows the last 3 notifications to prove they are being recorded
node -e "
const { PrismaClient } = require('./node_modules/.prisma/client');
const prisma = new PrismaClient();
async function logs() {
  const latest = await prisma.notification.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
  console.log('Latest Notification Records:', latest.length > 0 ? latest : 'No records found.');
}
logs().finally(() => prisma.\$disconnect());
"
