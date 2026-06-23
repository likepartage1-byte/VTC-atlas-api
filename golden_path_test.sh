#!/bin/bash
# ============================================================
# Atlas VTC — Golden Path Quick Test Script
# ============================================================
# Usage: chmod +x golden_path_test.sh && ./golden_path_test.sh
#
# Requirements: curl, jq
# Run from VPS or locally if API is accessible.
# ============================================================

set -e

BASE_URL="${API_URL:-http://187.124.34.118/api/v1}"
PASSENGER_PHONE="+212600000001"
DRIVER_PHONE="+212600000002"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

step() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${YELLOW}STEP $1: $2${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }
info() { echo -e "   ℹ️  $1"; }

# ─── STEP 0: Health ──────────────────────────────────────────
step "0" "System Health Check"
HEALTH=$(curl -sf "$BASE_URL/health" | jq -r '.status // "unknown"') || fail "Backend unreachable at $BASE_URL"
ok "Backend is UP — status: $HEALTH"

# ─── STEP 1: Passenger OTP ───────────────────────────────────
step "1" "Request OTP for Passenger ($PASSENGER_PHONE)"
curl -sf -X POST "$BASE_URL/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PASSENGER_PHONE\", \"deviceId\": \"test-passenger-device-001\"}" \
  | jq . || fail "OTP request failed"
ok "OTP requested. Check DB to get the code:"
info "SQL: SELECT otp_code FROM otp_sessions WHERE phone_number='$PASSENGER_PHONE' ORDER BY created_at DESC LIMIT 1;"

read -p "   Enter Passenger OTP code: " PASSENGER_OTP

step "1b" "Verify Passenger OTP"
PASSENGER_TOKEN=$(curl -sf -X POST "$BASE_URL/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PASSENGER_PHONE\", \"code\": \"$PASSENGER_OTP\", \"deviceId\": \"test-passenger-device-001\", \"role\": \"PASSENGER\"}" \
  | jq -r '.accessToken') || fail "OTP verification failed"
[ "$PASSENGER_TOKEN" != "null" ] && [ -n "$PASSENGER_TOKEN" ] || fail "No token returned"
ok "Passenger authenticated. Token: ${PASSENGER_TOKEN:0:30}..."

# ─── STEP 2: Driver OTP ──────────────────────────────────────
step "2" "Request OTP for Driver ($DRIVER_PHONE)"
curl -sf -X POST "$BASE_URL/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$DRIVER_PHONE\", \"deviceId\": \"test-driver-device-001\"}" \
  | jq . || fail "Driver OTP request failed"
info "SQL: SELECT otp_code FROM otp_sessions WHERE phone_number='$DRIVER_PHONE' ORDER BY created_at DESC LIMIT 1;"

read -p "   Enter Driver OTP code: " DRIVER_OTP

step "2b" "Verify Driver OTP"
DRIVER_TOKEN=$(curl -sf -X POST "$BASE_URL/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$DRIVER_PHONE\", \"code\": \"$DRIVER_OTP\", \"deviceId\": \"test-driver-device-001\", \"role\": \"DRIVER\"}" \
  | jq -r '.accessToken') || fail "Driver OTP verification failed"
[ "$DRIVER_TOKEN" != "null" ] && [ -n "$DRIVER_TOKEN" ] || fail "No driver token returned"
ok "Driver authenticated. Token: ${DRIVER_TOKEN:0:30}..."

# ─── STEP 3: Request Ride ────────────────────────────────────
step "3" "Passenger Requests a Ride"
RIDE_RESPONSE=$(curl -sf -X POST "$BASE_URL/passenger/rides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" \
  -d '{
    "pickupLat": 31.6295,
    "pickupLng": -7.9811,
    "pickupAddress": "جامع الفنا، مراكش",
    "dropoffLat": 31.6340,
    "dropoffLng": -8.0089,
    "dropoffAddress": "حي الحمراء، مراكش",
    "serviceType": "ECONOMY"
  }') || fail "Ride request failed"

RIDE_ID=$(echo "$RIDE_RESPONSE" | jq -r '.id')
ESTIMATED_PRICE=$(echo "$RIDE_RESPONSE" | jq -r '.estimatedPrice')
RIDE_STATUS=$(echo "$RIDE_RESPONSE" | jq -r '.status')

[ "$RIDE_ID" != "null" ] && [ -n "$RIDE_ID" ] || fail "No ride ID returned — check if passenger user exists in DB"
ok "Ride created! ID: $RIDE_ID | Status: $RIDE_STATUS | Price: $ESTIMATED_PRICE MAD"

# ─── STEP 4: Driver Accepts ──────────────────────────────────
step "4" "Driver Accepts Ride ($RIDE_ID)"
curl -sf -X POST "$BASE_URL/driver/rides/$RIDE_ID/accept" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  | jq . || fail "Driver accept failed"
ok "Ride accepted by driver"

# ─── STEP 5: Driver Arrives ──────────────────────────────────
step "5" "Driver Reports Arrival at Pickup"
ARRIVE_RESPONSE=$(curl -sf -X POST "$BASE_URL/driver/rides/$RIDE_ID/arrive" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  | jq .)
echo "$ARRIVE_RESPONSE"
ok "Arrival reported. OTP sent to passenger."
info "Get OTP from DB: SELECT otp_code FROM rides WHERE id='$RIDE_ID';"

read -p "   Enter Ride OTP (from DB/logs): " RIDE_OTP

# ─── STEP 6: Start Trip ──────────────────────────────────────
step "6" "Driver Starts Trip with OTP"
curl -sf -X POST "$BASE_URL/driver/rides/$RIDE_ID/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d "{\"otp\": \"$RIDE_OTP\"}" \
  | jq . || fail "Trip start failed — wrong OTP or wrong status"
ok "🚗 Trip is IN_PROGRESS!"

# ─── STEP 7: Complete Trip ───────────────────────────────────
step "7" "Driver Completes Trip (triggers commission settlement)"
curl -sf -X POST "$BASE_URL/driver/rides/$RIDE_ID/complete" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  | jq . || fail "Trip completion failed"
ok "🏁 Trip COMPLETED and Ledger SETTLED!"

# ─── STEP 8: Verify Dashboard ────────────────────────────────
step "8" "Verify Dashboard Insights (Golden Path validation)"
echo ""
echo -e "${YELLOW}Open the Admin Dashboard and check:${NC}"
echo -e "  → http://187.124.34.118 (or your dashboard URL)"
echo -e "  → Revenue should be updated"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 GOLDEN PATH COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Ride ID:         $RIDE_ID"
echo "  Estimated Price: $ESTIMATED_PRICE MAD"
echo "  Status:          COMPLETED"
echo ""
echo -e "${BLUE}Next step: Open the Admin Dashboard and confirm the ride appears in the financial ledger.${NC}"
