#!/bin/bash
# Startscript voor dual rotary game setup
# Zet deze file als 'start.sh' in je hoofdmap en maak uitvoerbaar met: chmod +x start.sh
pkill chromium
pkill python3


# 1. Start de Node.js WebSocket bridge (serial_ws_bridge.js) in background
echo "[1/4] Starting serial_ws_bridge.js..."
node sensors/serial_ws_bridge.js &
BRIDGE_PID=$!
sleep 2


# 3. Start de webserver (npm run dev met --host)
echo "[3/4] Starting Vite webserver..."
cd bap && npm run dev -- --host &
NPM_PID=$!
cd ..
sleep 2

echo "[4/4] Alles gestart!"
echo "- Node.js WebSocket bridge PID: $BRIDGE_PID"
echo "- Vite webserver PID: $NPM_PID"
echo "Stoppen? Gebruik: kill $BRIDGE_PID $NPM_PID"

# 4. Wacht tot gebruiker afsluit
wait $BRIDGE_PID $NPM_PID