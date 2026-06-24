#!/bin/bash

# Shared Library for Atlas VTC Testing
RED='\033[0m\033[31m'
GREEN='\033[0m\033[32m'
YELLOW='\033[0m\033[33m'
BLUE='\033[0m\033[34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Helper to make API calls
api_call() {
    local method=$1
    local url=$2
    local data=$3
    local token=$4
    
    local headers=(-H "Content-Type: application/json")
    if [ ! -z "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi
    
    if [ "$method" == "GET" ] || [ "$method" == "DELETE" ]; then
        curl -s -X "$method" "${headers[@]}" "$url"
    else
        curl -s -X "$method" "${headers[@]}" -d "$data" "$url"
    fi
}

# Extract values from JSON using python (available on most VPS)
extract_json() {
    local key=$1
    python3 -c "import sys, json; print(json.load(sys.stdin).get('$key', ''))"
}
