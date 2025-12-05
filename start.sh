#!/bin/bash
# Startscript voor dual rotary game setup
# Zet deze file als 'start.sh' in je hoofdmap en maak uitvoerbaar met: chmod +x start.sh
pkill chromium
pkill python3
# 1. Activeer Python virtual environment (pas pad aan indien nodig)
echo "[1/4] Activating Python venv..."
source sensors/venv/bin/activate || { echo "Kon venv niet activeren"; exit 1; }

# 2. Start de Python WebSocket-server (in background)
echo "[2/4] Starting dual_rotary_ws.py..."
python3 sensors/dual_rotary_ws.py &
PY_PID=$!
sleep 2


# 3. Start de webserver (npm run dev met --host)
echo "[3/4] Starting Vite webserver..."
cd bap && npm run dev -- --host &
NPM_PID=$!
cd ..
sleep 2

echo "[4/4] Alles gestart!"
echo "- Python WebSocket-server PID: $PY_PID"
echo "- Vite webserver PID: $NPM_PID"
echo "Stoppen? Gebruik: kill $PY_PID $NPM_PID"

# 4. Wacht tot gebruiker afsluit
wait $PY_PID $NPM_PID
