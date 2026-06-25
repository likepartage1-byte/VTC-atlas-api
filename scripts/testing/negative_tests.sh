#!/usr/bin/env bash
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; RESET='\033[0m'
log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"; }
pass()    { echo -e "${GREEN}  ✔ EXPECTED SUCCESS${RESET} — $*"; }
fail()    { echo -e "${RED}  ✘ UNEXPECTED BEHAVIOR${RESET} — $*"; exit 1; }
section() { echo -e "\n\033[1m\033[34m━━━ $* ━━━\033[0m"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BASE_URL="http://localhost:3000"; API_PREFIX="/api/v1"

# تحميل البيئة عالمياً للسكريبت
if [ -f "${PROJECT_ROOT}/.env" ]; then
  export $(grep -v '^#' "${PROJECT_ROOT}/.env" | xargs) 2>/dev/null
fi

PK=$(cat "${SCRIPT_DIR}/.passenger_token" 2>/dev/null)
DK=$(cat "${SCRIPT_DIR}/.driver_token" 2>/dev/null)
DI=$(cat "${SCRIPT_DIR}/.driver_id" 2>/dev/null)

create_ready_ride() {
  local RESP=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/passenger/rides" -H "Content-Type: application/json" -H "Authorization: Bearer ${PK}" -d '{"pickupLat": 31.6, "pickupLng": -7.9, "pickupAddress": "Start", "dropoffLat": 31.7, "dropoffLng": -8.0, "dropoffAddress": "End", "serviceType": "ECONOMY"}')
  local R_ID=$(echo "${RESP}" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
  
  if [[ -z "${R_ID}" ]]; then return 1; fi
  
  node -e "const {PrismaClient}=require('${PROJECT_ROOT}/node_modules/@prisma/client');const p=new PrismaClient();p.ride.update({where:{id:'${R_ID}'},data:{status:'DRIVER_ACCEPTED',driverId:'${DI}',acceptedAt:new Date()}}).then(()=>process.exit(0))" >/dev/null 2>&1
  echo "${R_ID}"
}

section "NEGATIVE TEST 1: COMPLETE BEFORE START"
RI=$(create_ready_ride)
RESP_ERR=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/complete" -H "Authorization: Bearer ${DK}")
echo "${RESP_ERR}" | grep -qE "Must be IN_PROGRESS|transition" && pass "Rejected early completion" || fail "Case 1 failed: ${RESP_ERR}"

section "NEGATIVE TEST 2: DOUBLE START"
# إيصال الرحلة لحالة البداية
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
redis-cli HSET "driver:${DI}:location" lat 31.6 lng -7.9 updatedAt "${NOW}" >/dev/null
curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/arrive" -H "Authorization: Bearer ${DK}" >/dev/null
OT=$(redis-cli GET "ride:v1:otp:${RI}" 2>/dev/null | tr -d '[:space:]"')
curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/start" -H "Content-Type: application/json" -H "Authorization: Bearer ${DK}" -d "{\"otp\":\"${OT}\"}" >/dev/null

log "Attempting DOUBLE START..."
RESP_ERR=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/start" -H "Content-Type: application/json" -H "Authorization: Bearer ${DK}" -d "{\"otp\":\"${OT}\"}")
echo "${RESP_ERR}" | grep -qE "expired|invalid|transition" && pass "Rejected double start" || fail "Case 2 failed: ${RESP_ERR}"

section "NEGATIVE TEST 3: DOUBLE COMPLETE"
curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/complete" -H "Authorization: Bearer ${DK}" >/dev/null
RESP_ERR=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/complete" -H "Authorization: Bearer ${DK}")
echo "${RESP_ERR}" | grep -qE "completed|result" && pass "Handled double complete (Idempotent)" || fail "Case 3 failed: ${RESP_ERR}"

section "NEGATIVE TEST 4: UNAUTHORIZED ROLE (PASSENGER)"
RI=$(create_ready_ride)
RESP_ERR=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/arrive" -H "Authorization: Bearer ${PK}")
echo "${RESP_ERR}" | grep -qE "Access denied|Forbidden|Unauthorized|assigned" && pass "Rejected unauthorized access (RBAC)" || fail "Case 4 failed: ${RESP_ERR}"

section "ALL NEGATIVE TESTS PASSED"
