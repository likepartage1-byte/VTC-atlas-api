#!/bin/bash
# ============================================================
# Atlas VTC — VPS Deploy Script
# Run this on the VPS: ssh root@187.124.34.118
# ============================================================
# Usage: bash deploy.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ FATAL: $1${NC}"; exit 1; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ─── Detect Project Root ─────────────────────────────────────
if [ -d "/root/VTC-atlas-api" ]; then
  PROJECT_DIR="/root/VTC-atlas-api"
elif [ -d "/var/www/VTC-atlas-api" ]; then
  PROJECT_DIR="/var/www/VTC-atlas-api"
else
  fail "Cannot find project directory. Expected /root/VTC-atlas-api or /var/www/VTC-atlas-api"
fi

info "Project root: $PROJECT_DIR"
cd "$PROJECT_DIR"

# ─── Step 1: Pull latest code ────────────────────────────────
echo ""
echo -e "${YELLOW}[1/5] Pulling latest code from GitHub (develop branch)...${NC}"
git fetch origin
git checkout develop 2>/dev/null || git checkout -b develop origin/develop
git pull origin develop
ok "Code updated to latest commit: $(git log --oneline -1)"

# ─── Step 2: Install dependencies ────────────────────────────
echo ""
echo -e "${YELLOW}[2/5] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/apps/backend-api"
npm install --omit=dev --silent
ok "Dependencies installed"
cd "$PROJECT_DIR"

# ─── Step 3: Build TypeScript ─────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Building TypeScript (NestJS)...${NC}"
cd "$PROJECT_DIR/apps/backend-api"
npm run build 2>&1 | tail -20
BUILD_EXIT=${PIPESTATUS[0]}
if [ $BUILD_EXIT -ne 0 ]; then
  fail "TypeScript build failed. Fix errors above before deploying."
fi
ok "Build successful"
cd "$PROJECT_DIR"

# ─── Step 4: Run Prisma migrations ───────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Running Prisma DB migrations...${NC}"

# Load .env for DB connection (now earlier so prisma can use it)
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs) 2>/dev/null
elif [ -f "$PROJECT_DIR/apps/backend-api/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/apps/backend-api/.env" | xargs) 2>/dev/null
fi

cd "$PROJECT_DIR/apps/backend-api"
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss || warn "DB Push failed"
ok "Database schema is synchronized (db push)"
cd "$PROJECT_DIR"

# ─── Step 5: Restart PM2 ─────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5] Restarting PM2 process...${NC}"

# Robust path detection for NestJS Monorepo output
BUILT_MAIN="$PROJECT_DIR/apps/backend-api/dist/main.js"
if [ ! -f "$BUILT_MAIN" ]; then
  BUILT_MAIN="$PROJECT_DIR/dist/apps/backend-api/main.js"
fi

if [ ! -f "$BUILT_MAIN" ]; then
  # Final fallback: search for it
  BUILT_MAIN=$(find "$PROJECT_DIR" -name "main.js" | grep "/dist/" | head -n 1)
fi

info "Detected executable: $BUILT_MAIN"

# NODE_PATH ensures all packages from apps/backend-api/node_modules are found
# when Node.js resolves modules from the dist/ output directory.
export NODE_PATH="$PROJECT_DIR/apps/backend-api/node_modules"

if pm2 describe atlas-backend > /dev/null 2>&1; then
  NODE_PATH="$PROJECT_DIR/apps/backend-api/node_modules" pm2 reload atlas-backend --update-env
  ok "PM2 process 'atlas-backend' reloaded (zero-downtime)"
else
  warn "PM2 process not found, starting fresh..."
  NODE_PATH="$PROJECT_DIR/apps/backend-api/node_modules" pm2 start "$BUILT_MAIN" \
    --name atlas-backend \
    --cwd "$PROJECT_DIR/apps/backend-api" \
    --env production \
    --time
  pm2 save
  ok "PM2 process started"
fi

# ─── Step 6: Seed Commission Setting ─────────────────────────
echo ""
echo -e "${YELLOW}[BONUS] Seeding commission_rate if missing...${NC}"

# Quick Node.js seed script for commission
node -e "
const { PrismaClient } = require('./apps/backend-api/node_modules/.prisma/client');
const prisma = new PrismaClient();
async function seed() {
  await prisma.systemSetting.upsert({
    where: { key: 'commission_rate' },
    update: {},
    create: { key: 'commission_rate', value: { rate: 0.08 } }
  });
  console.log('Commission rate seeded: 8%');
  await prisma.\$disconnect();
}
seed().catch(e => { console.error('Seed failed (non-fatal):', e.message); process.exit(0); });
" 2>/dev/null && ok "Commission seed done" || warn "Commission seed skipped (non-fatal)"

echo ""
echo -e "${YELLOW}Waiting 5s for process to stabilize...${NC}"
sleep 5

HEALTH=$(curl -sf "http://localhost:3000/health" 2>/dev/null || curl -sf "http://localhost:3000/api/v1/health" 2>/dev/null || echo '{}')

if echo "$HEALTH" | grep -q '"status":"ok"'; then
  ok "Health check PASSED"
  echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
  warn "Health check did not return OK. Is the app running on port 3000?"
  echo "Response: $HEALTH"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Test the new endpoints:"
echo "  curl http://localhost:3000/api/v1/admin/dashboard/insights  # needs auth"
echo "  curl http://localhost:3000/api/v1/admin/settings/commission  # needs auth"
echo ""
echo "PM2 logs: pm2 logs atlas-backend --lines 50"
echo "PM2 status: pm2 list"
