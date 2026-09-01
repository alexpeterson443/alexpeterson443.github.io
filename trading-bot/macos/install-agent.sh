#!/bin/bash
# Install the launchd agent that runs one trading cycle each weekday afternoon.
#
#   ./macos/install-agent.sh
#
# Re-running it replaces the existing agent. To remove it entirely:
#   launchctl unload ~/Library/LaunchAgents/com.tradingbot.daily.plist
#   rm ~/Library/LaunchAgents/com.tradingbot.daily.plist

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.tradingbot.daily"
TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ ! -f "$PROJECT_DIR/config.json" ]; then
    echo "No config.json found. Create one first:"
    echo "    cd $PROJECT_DIR && python3 run.py init-config"
    exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents" "$PROJECT_DIR/logs"

# Replace the placeholder with the real path.
sed "s|PROJECT_DIR|$PROJECT_DIR|g" "$PROJECT_DIR/macos/$LABEL.plist" > "$TARGET"

# Unload any previous version, ignoring the error when there is none.
launchctl unload "$TARGET" 2>/dev/null || true
launchctl load "$TARGET"

echo "Installed $TARGET"
echo
echo "  status:  launchctl list | grep tradingbot"
echo "  logs:    tail -f $PROJECT_DIR/logs/launchd.out"
echo "  remove:  launchctl unload $TARGET && rm $TARGET"
echo
echo "The schedule is in LOCAL time. Edit the plist if you are not in US Central."
