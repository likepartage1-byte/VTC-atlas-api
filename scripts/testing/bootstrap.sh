#!/usr/bin/env bash
# =============================================================================
# Atlas VTC — bootstrap.sh
# Preparation for Golden Path Test (Login & Token Generation)
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# 1. Configuration & .env loading
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
    log "Loading environment from root .env..."
    # Export variables from .env, ignoring comments and handles spaces
    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ ! "$line" =~ ^# ]] && [[ "$line" =~ = ]]; then
            export "$line"
        fi
    done < "$ROOT_DIR/.env"
fi

# Fallbacks
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@atlas.com}"
ADMIN_PASS="${ADMIN_PASSWORD:-${ADMIN_PASS:-admin123}}"
API_PORT="${PORT:-3000}"
BASE_URL="http://localhost:${API_PORT}"
API_PREFIX="/api/v1"

section "PHASE 1: Administrative Login"

login_admin() {
    local email="$1"
    local pass="$2"
    local endpoints=("/admin/auth/login" "/auth/login")
    
    for ep in "${endpoints[@]}"; do
        log "Trying $ep..."
        http_post "$ep" "{\"email\":\"$email\",\"password\":\"$pass\"}"
        if [[ "$RESPONSE_CODE" == "200" || "$RESPONSE_CODE" == "201" ]]; then
            local token=$(extract_json "$RESPONSE_BODY" "token")
            if [[ -n "$token" && "$token" != "null" ]]; then
                echo -n "$token" > "$SCRIPT_DIR/.admin_token"
                echo -n "$token" > "$ROOT_DIR/.admin_token"
                pass "Admin logged in successfully. Token saved to .admin_token and root."
                return 0
            fi
        fi
    done
    return 1
}

if ! login_admin "$ADMIN_EMAIL" "$ADMIN_PASS"; then
    log "Automatic login failed for $ADMIN_EMAIL"
    echo -e "${YELLOW}Please provide Admin credentials manually:${RESET}"
    read -p "Email: " ADMIN_EMAIL
    read -sp "Password: " ADMIN_PASS
    echo ""
    if ! login_admin "$ADMIN_EMAIL" "$ADMIN_PASS"; then
        die "Could not authenticate admin. Bootstrap failed."
    fi
fi

section "PHASE 2: Actor Setup (Passenger & Driver)"

try_login_actor() {
    local type="$1" # passenger | driver
    local email="$2"
    local pass="$3"
    
    log "Attempting $type login ($email)..."
    http_post "/auth/login" "{\"email\":\"$email\",\"password\":\"$pass\"}"
    if [[ "$RESPONSE_CODE" == "200" || "$RESPONSE_CODE" == "201" ]]; then
        local token=$(extract_json "$RESPONSE_BODY" "token")
        local id=$(extract_json "$RESPONSE_BODY" "user.id")
        if [[ -z "$id" || "$id" == "null" ]]; then
             id=$(extract_json "$RESPONSE_BODY" "id")
        fi
        
        if [[ -n "$token" && "$token" != "null" ]]; then
            echo -n "$token" > "$SCRIPT_DIR/.${type}_token"
            echo -n "$id" > "$SCRIPT_DIR/.${type}_id"
            pass "$type authenticated ($id)."
            return 1 # Stop trying if success
        fi
    fi
    return 0
}

# Attempt to find or setup tokens for passenger/driver
# If they don't exist, we create dummy ones so the golden_path script can at least run
if [[ ! -f "$SCRIPT_DIR/.passenger_token" ]]; then
    try_login_actor "passenger" "passenger@test.com" "password123"
    if [[ ! -f "$SCRIPT_DIR/.passenger_token" ]]; then
        log "Using placeholder passenger token."
        echo -n "placeholder_passenger_token" > "$SCRIPT_DIR/.passenger_token"
        echo -n "placeholder_passenger_id" > "$SCRIPT_DIR/.passenger_id"
        echo -n "placeholder_passenger_token" > "$ROOT_DIR/.passenger_token"
        echo -n "placeholder_passenger_id" > "$ROOT_DIR/.passenger_id"
    else
        cat "$SCRIPT_DIR/.passenger_token" > "$ROOT_DIR/.passenger_token"
        cat "$SCRIPT_DIR/.passenger_id" > "$ROOT_DIR/.passenger_id"
    fi
fi

if [[ ! -f "$SCRIPT_DIR/.driver_token" ]]; then
    try_login_actor "driver" "driver@test.com" "password123"
    if [[ ! -f "$SCRIPT_DIR/.driver_token" ]]; then
        log "Using placeholder driver token."
        echo -n "placeholder_driver_token" > "$SCRIPT_DIR/.driver_token"
        echo -n "placeholder_driver_id" > "$SCRIPT_DIR/.driver_id"
        echo -n "placeholder_driver_token" > "$ROOT_DIR/.driver_token"
        echo -n "placeholder_driver_id" > "$ROOT_DIR/.driver_id"
    else
        cat "$SCRIPT_DIR/.driver_token" > "$ROOT_DIR/.driver_token"
        cat "$SCRIPT_DIR/.driver_id" > "$ROOT_DIR/.driver_id"
    fi
fi

section "BOOTSTRAP COMPLETE"
log "Files created in $SCRIPT_DIR:"
ls -la "$SCRIPT_DIR"/.*_token "$SCRIPT_DIR"/.*_id 2>/dev/null
