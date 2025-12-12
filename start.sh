#!/bin/bash
# Startscript voor dual rotary game setup met Arduino's
# Zet deze file als 'start.sh' in je hoofdmap en maak uitvoerbaar met: chmod +x start.sh

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

pkill chromium
pkill -f "arduino_serial_keyboard_bridge.js"
pkill -f "ws_echo_server.js"
pkill -f "http.server"
pkill -f "vite"

# Stop VS Code Server om geheugen vrij te maken
echo "Stopping VS Code Server to free memory..."
# pkill -f ".vscode-server"

# 1. Start de Arduino Serial → Keyboard bridge (in background)
echo "[1/4] Starting Arduino Serial to Keyboard bridge..."
cd sensors && node arduino_serial_keyboard_bridge.js 2>&1 | sed 's/^/[ARDUINO] /' &
ARDUINO_PID=$!
cd ..
sleep 2

# 2. Start de WebSocket echo server (in background)
echo "[2/4] Starting ws_echo_server.js..."
node ws_echo_server.js 2>&1 | sed 's/^/[WSECHO] /' &
WS_PID=$!
sleep 2

# 3. Start Vite development server
echo "[3/4] Starting Vite dev server..."
cd bap && npm run dev -- --host &
VITE_PID=$!
cd ..
sleep 5

# 4. Start Chromium in kiosk mode
echo "[4/4] Starting Chromium in kiosk mode..."
# DISPLAY=:0 chromium --start-fullscreen --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble --password-store=basic --disable-features=PasswordManager --disable-gpu http://localhost:5173 &
CHROMIUM_PID=$!

echo "Alles gestart!"
echo "- Arduino Serial bridge PID: $ARDUINO_PID"
echo "- WebSocket echo server PID: $WS_PID"
echo "- Vite dev server PID: $VITE_PID"
echo "- Chromium PID: $CHROMIUM_PID"
echo "Stoppen? Gebruik: pkill chromium; pkill -f arduino_serial_keyboard_bridge.js; pkill -f ws_echo_server.js; pkill -f vite"

# Wacht tot gebruiker afsluit
wait $PY_PID $WS_PID $VITE_PID $CHROMIUM_PID
