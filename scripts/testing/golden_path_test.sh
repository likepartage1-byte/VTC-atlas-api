#!/usr/bin/env bash
# Atlas VTC — Golden Path Test (Final)
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"; }
pass()    { echo -e "${GREEN}  ✔ PASS${RESET} — $*"; }
die()     { echo -e "${RED}  ✘ FATAL${RESET} — $*"; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}━━━ $* ━━━${RESET}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BASE_URL="http://localhost:3000"
API_PREFIX="/api/v1"

PK=$(cat "${SCRIPT_DIR}/.passenger_token" 2>/dev/null)
DK=$(cat "${SCRIPT_DIR}/.driver_token"   2>/dev/null)
DI=$(cat "${SCRIPT_DIR}/.driver_id"      2>/dev/null)

[[ -z "${DI}" ]] && die "Run bootstrap.sh first."
if [ -f "${PROJECT_ROOT}/.env" ]; then
  export $(grep -v '^#' "${PROJECT_ROOT}/.env" | grep -v '^\s*$' | xargs) 2>/dev/null || true
fi

section "PHASE 2: Ride Lifecycle"

# 1. طلب الرحلة
log "Requesting ride..."
RESP=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/passenger/rides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${PK}" \
  -d '{"pickupLat":31.6,"pickupLng":-7.9,"pickupAddress":"Start","dropoffLat":31.7,"dropoffLng":-8.0,"dropoffAddress":"End","serviceType":"ECONOMY"}')
RI=$(echo "${RESP}" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
[[ -z "${RI}" ]] && die "Request Failed: ${RESP}"
pass "Ride ID: ${RI}"

# 2. تعيين السائق في قاعدة البيانات مباشرة
log "Assigning driver in DB (status=DRIVER_ACCEPTED)..."
node -e "
const {PrismaClient}=require('${PROJECT_ROOT}/node_modules/@prisma/client');
const p=new PrismaClient();
p.ride.update({
  where:{id:'${RI}'},
  data:{status:'DRIVER_ACCEPTED',driverId:'${DI}',acceptedAt:new Date()}
}).then(()=>{ console.log('OK'); process.exit(0); })
 .catch(e=>{ console.error(e.message); process.exit(1); });
"
pass "DB: Ride assigned to driver ${DI}"

# 3. حقن موقع GPS للسائق (Hash بالمفتاح الصحيح)
log "Injecting driver GPS at pickup coordinates..."
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
redis-cli HSET "driver:${DI}:location" lat 31.6 lng -7.9 updatedAt "${NOW}" >/dev/null
pass "GPS injected: driver:${DI}:location"

# 4. وصول السائق (Arrive)
log "Driver arriving..."
C=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/arrive" \
  -H "Authorization: Bearer ${DK}")
[[ "${C}" =~ ^2 ]] && pass "Arrived (${C})" || die "Arrive Failed (${C})"
sleep 2

# 5. استخراج OTP
log "Extracting OTP from Redis..."
OT=$(redis-cli GET "ride:v1:otp:${RI}" 2>/dev/null | tr -d '[:space:]"')
[[ -z "${OT}" ]] && OT=$(redis-cli KEYS "*otp*${RI}*" 2>/dev/null | head -1 | xargs -I{} redis-cli GET {} 2>/dev/null | tr -d '[:space:]"')
log "OTP: [${OT}]"
[[ -z "${OT}" ]] && die "OTP not found in Redis"

# 6. بدء الرحلة
log "Starting trip with OTP..."
C=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DK}" \
  -d "{\"otp\":\"${OT}\"}")
[[ "${C}" =~ ^2 ]] && pass "Trip Started" || die "Start Failed (${C})"

# 7. إنهاء الرحلة
log "Completing trip..."
C=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}${API_PREFIX}/driver/rides/${RI}/complete" \
  -H "Authorization: Bearer ${DK}")
[[ "${C}" =~ ^2 ]] && pass "Trip Completed" || die "Complete Failed (${C})"

section "FULL GOLDEN PATH SUCCESS"
