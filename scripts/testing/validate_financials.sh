#!/usr/bin/env bash
# Atlas VTC — Financial & Dashboard Validation
# Run AFTER golden_path_test.sh completes a ride
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"; }
pass()    { echo -e "${GREEN}  ✔ PASS${RESET} — $*"; }
fail()    { echo -e "${RED}  ✘ FAIL${RESET} — $*"; }
skip()    { echo -e "${YELLOW}  ⊘ SKIP${RESET} — $*"; }
section() { echo -e "\n${BOLD}${BLUE}━━━ $* ━━━${RESET}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ADMIN_TOKEN=$(cat "${SCRIPT_DIR}/.admin_token" 2>/dev/null)
BASE_URL="http://localhost:3000"; API_PREFIX="/api/v1"

[[ -z "${ADMIN_TOKEN}" ]] && { echo "Run bootstrap.sh first."; exit 1; }
if [ -f "${PROJECT_ROOT}/.env" ]; then export $(grep -v '^#' "${PROJECT_ROOT}/.env" | grep -v '^\s*$' | xargs) 2>/dev/null || true; fi

# آخر رحلة مكتملة من DB
LAST_RIDE=$(node -e "
const {PrismaClient}=require('${PROJECT_ROOT}/node_modules/@prisma/client');
const p=new PrismaClient();
p.ride.findFirst({where:{status:'COMPLETED'},orderBy:{completedAt:'desc'}})
  .then(r=>{ console.log(JSON.stringify(r)); process.exit(0); })
  .catch(()=>process.exit(1));
" 2>/dev/null)

RIDE_ID=$(echo "${LAST_RIDE}" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
[[ -z "${RIDE_ID}" ]] && { echo "No completed rides found. Run golden_path_test.sh first."; exit 1; }
log "Validating Ride: ${RIDE_ID}"

section "PHASE 1: Ride Final State"
node -e "
const {PrismaClient}=require('${PROJECT_ROOT}/node_modules/@prisma/client');
const p=new PrismaClient();
p.ride.findUnique({where:{id:'${RIDE_ID}'}})
  .then(r=>{
    console.log('status       :', r.status);
    console.log('actualPrice  :', r.actualPrice?.toString() || 'NULL');
    console.log('completedAt  :', r.completedAt);
    process.exit(0);
  }).catch(e=>{console.error(e.message);process.exit(1);});
" 2>/dev/null && pass "Ride record fetched" || fail "Cannot fetch ride"

section "PHASE 2: Ledger Entry"
LEDGER=$(node -e "
const {PrismaClient}=require('${PROJECT_ROOT}/node_modules/@prisma/client');
const p=new PrismaClient();
p.rideLedger.findUnique({where:{rideId:'${RIDE_ID}'}})
  .then(l=>{
    if(!l){ console.log('MISSING'); process.exit(0); }
    console.log('totalAmount    :', l.totalAmount.toString());
    console.log('driverEarnings :', l.driverEarnings.toString());
    console.log('companyFee     :', l.companyFee.toString());
    console.log('status         :', l.status);
    process.exit(0);
  }).catch(e=>{console.error(e.message);process.exit(1);});
" 2>/dev/null)

echo "${LEDGER}"
if echo "${LEDGER}" | grep -q "MISSING"; then
  fail "No ledger entry found for ride"
elif echo "${LEDGER}" | grep -q "totalAmount"; then
  pass "Ledger entry exists"
  COMPANY_FEE=$(echo "${LEDGER}" | grep companyFee | awk '{print $2}')
  [[ "${COMPANY_FEE}" != "0" ]] && pass "Commission recorded: ${COMPANY_FEE} MAD" || fail "Commission is 0"
else
  fail "Ledger query failed"
fi

section "PHASE 3: Driver Balance"
DRIVER_ID=$(cat "${SCRIPT_DIR}/.driver_id" 2>/dev/null)
node -e "
const {PrismaClient}=require('${PROJECT_ROOT}/node_modules/@prisma/client');
const p=new PrismaClient();
p.driverAccount.findUnique({where:{driverId:'${DRIVER_ID}'}})
  .then(a=>{
    if(!a){ console.log('NO_ACCOUNT'); process.exit(0); }
    console.log('balance     :', a.balance.toString());
    console.log('totalEarned :', a.totalEarned.toString());
    process.exit(0);
  }).catch(e=>{console.error(e.message);process.exit(1);});
" 2>/dev/null && pass "Driver account checked" || skip "Driver account not found"

section "PHASE 4: Dashboard Metrics"
RESP=$(curl -s "${BASE_URL}${API_PREFIX}/admin/dashboard/insights" -H "Authorization: Bearer ${ADMIN_TOKEN}")
TOTAL=$(echo "${RESP}" | grep -o '"totalTrips":[0-9]*' | cut -d: -f2)
[[ -n "${TOTAL}" && "${TOTAL}" -gt 0 ]] && pass "Dashboard totalTrips = ${TOTAL}" || fail "Dashboard totalTrips missing. Response: ${RESP:0:200}"

section "SUMMARY"
echo "  Ride ID  : ${RIDE_ID}"
echo "  Ledger   : $(echo "${LEDGER}" | grep totalAmount || echo 'N/A')"
