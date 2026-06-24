#!/usr/bin/env bash
# =============================================================================
# Atlas VTC — lib.sh
# Shared helpers sourced by golden_path_test.sh and other test scripts
# Usage: source "$(dirname "$0")/lib.sh"
# =============================================================================

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

TOTAL_PASS=0; TOTAL_FAIL=0; TOTAL_SKIP=0
RESPONSE_BODY=""; RESPONSE_CODE=""

log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"; }
pass()    { echo -e "${GREEN}  ✔ PASS${RESET} — $*"; ((TOTAL_PASS++)); }
fail()    { echo -e "${RED}  ✘ FAIL${RESET} — $*"; ((TOTAL_FAIL++)); }
skip()    { echo -e "${YELLOW}  ⊘ SKIP${RESET} — $*"; ((TOTAL_SKIP++)); }
section() { echo -e "\n${BOLD}${BLUE}━━━ $* ━━━${RESET}"; }
die()     { echo -e "${RED}${BOLD}FATAL:${RESET} $*"; exit 1; }

# ─── HTTP helpers ─────────────────────────────────────────────────────────────
_curl() {
  local method="$1" path="$2" body="${3:-}" token="${4:-}"
  local tmp; tmp=$(mktemp)
  RESPONSE_CODE=$(curl -s -o "${tmp}" -w "%{http_code}" \
    -X "${method}" "${BASE_URL}${API_PREFIX}${path}" \
    -H "Content-Type: application/json" \
    ${token:+-H "Authorization: Bearer ${token}"} \
    ${body:+-d "${body}"} \
    --max-time 15 2>/dev/null || echo "000")
  RESPONSE_BODY=$(cat "${tmp}"); rm -f "${tmp}"
  log "${method} ${path} → HTTP ${RESPONSE_CODE}"
}

http_post()  { _curl POST  "$1" "$2" "${3:-}"; }
http_get()   { _curl GET   "$1" ""   "${2:-}"; }
http_patch() { _curl PATCH "$1" "$2" "${3:-}"; }

# ─── JSON extraction (jq or fallback) ────────────────────────────────────────
extract_json() {
  local json="$1" field="$2"
  if command -v jq &>/dev/null; then
    echo "${json}" | jq -r ".${field} // empty" 2>/dev/null || true
  else
    echo "${json}" | grep -o "\"${field}\":\"[^\"]*\"" \
      | sed "s/\"${field}\":\"//;s/\"//" | head -1 || true
  fi
}

# ─── Assertions ───────────────────────────────────────────────────────────────
assert_http() {
  local expected="$1" label="$2"
  if [[ "${RESPONSE_CODE}" == "${expected}" ]]; then
    pass "${label} (HTTP ${RESPONSE_CODE})"; return 0
  else
    fail "${label} — expected HTTP ${expected}, got ${RESPONSE_CODE}"
    log "  Body: ${RESPONSE_BODY:0:300}"; return 1
  fi
}

assert_field() {
  local value="$1" label="$2"
  if [[ -n "${value}" && "${value}" != "null" ]]; then
    pass "${label} = ${value}"; return 0
  else
    fail "${label} — field empty or null"; return 1
  fi
}
