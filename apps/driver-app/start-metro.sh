#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Atlas Driver – Metro Launcher
# Run this script from macOS Terminal (not from Antigravity)
# ─────────────────────────────────────────────────────────────────────────────

# Load nvm / node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
source "$HOME/.bash_profile" 2>/dev/null || source "$HOME/.zshrc" 2>/dev/null || true

# Kill any old Metro on 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 1

# ADB reverse for both devices
ADB="$HOME/Library/Android/sdk/platform-tools/adb"
echo "📱 Setting up ADB reverse..."
$ADB devices | grep -v "List" | awk '{print $1}' | while read device; do
  if [ -n "$device" ]; then
    $ADB -s "$device" reverse tcp:8081 tcp:8081
    echo "  ✅ $device → tcp:8081 forwarded"
  fi
done

# Start Metro
echo ""
echo "🚀 Starting Metro Bundler..."
cd "$(dirname "$0")"
npx react-native start --reset-cache
