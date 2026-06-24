#!/bin/bash
# Atlas VTC - Golden Path Lifecycle Test
# Phases: Discovery -> Auth -> Lifecycle -> Validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# Configuration
BASE_URL="http://localhost:3000"
API_PREFIX="/api/v1"
FULL_URL="${BASE_URL}${API_PREFIX}"

log_info "PHASE 0: Discovery & Health Check"
HEALTH=$(curl -s "${BASE_URL}/v1/health" | extract_json "status")
if [ "$HEALTH" != "ok" ]; then
    log_error "Server is not healthy or unreachable at ${BASE_URL}/v1/health"
fi
log_success "Server is healthy."

log_info "PHASE 1: Authentication & Identity"
# We'll use the bootstrap admin token logic if available, or predefined test accounts
# For this test, we assume we need to obtain tokens
# 1. Get Admin Token (using existing logic or env)
ADMIN_TOKEN=$(node -e "try { console.log(require('fs').readFileSync('.admin_token', 'utf8').trim()); } catch(e) { console.log(''); }")
if [ -z "$ADMIN_TOKEN" ]; then
    log_warn "Admin token not found in .admin_token, please run bootstrap script first."
    # Fallback to a mock or prompt if needed, but for automation we fail
    exit 1
fi
log_success "Admin authenticated."

log_info "PHASE 2: Ride Lifecycle"

# 1. Passenger requests a ride
log_info "1. Passenger requesting ride..."
# Normally we'd login as passenger, but we'll use administrative override or test token
RIDE_REQ_DATA='{"pickupLocation":{"lat":33.5731,"lng":-7.5898,"address":"Casablanca"},"destinationLocation":{"lat":33.5889,"lng":-7.6114,"address":"Anfa"},"serviceType":"STANDARD"}'
# Note: In real test, use Passenger Token
# RIDE_RESP=$(api_call "POST" "${FULL_URL}/passenger/rides" "$RIDE_REQ_DATA" "$PASSENGER_TOKEN")
# TRIP_ID=$(echo "$RIDE_RESP" | extract_json "id")

log_warn "Lifecycle steps require Passenger/Driver tokens. Ensure test accounts are created."
log_info "Check Dashboard Insights for real-time updates during manual test..."

log_info "PHASE 3: Operational Validation"
INSIGHT_DATA=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${FULL_URL}/admin/dashboard/insights")
DRIVERS_COUNT=$(echo "$INSIGHT_DATA" | extract_json "totalDriversCount")
log_info "Current Active Drivers: $DRIVERS_COUNT"

log_success "Phase 1 Testing Environment Ready."
log_info "To run full automated lifecycle, ensure 'scripts/testing/setup_test_accounts.sh' is run first."
