# Arduino Uno Setup Instructies

## Hardware Setup - 2x Arduino Uno

### Arduino Sketches

Upload `arduino_uno_serial.ino` naar **BEIDE** Uno's:
- **Uno #1** (met button): Zet `HAS_BUTTON` op `true` in sketch
- **Uno #2** (zonder button): Laat `HAS_BUTTON` op `false`

### Pinout per Arduino Uno
```
AS5600 Sensor:
- SDA → A4
- SCL → A5
- VCC → 5V
- GND → GND

Button (alleen Uno #1):
- Pin → D2
- GND → GND (met pull-up)
```

---

## Software Installatie

### Stap 1: Installeer Node.js dependencies

```bash
cd sensors
npm install
```

Dit installeert:
- `serialport` - Communicatie met Arduino's
- `@serialport/parser-readline` - Data parsing
- `robotjs` - Keyboard simulatie

**Als robotjs installatie faalt:**
```bash
sudo apt-get install libxtst-dev libpng++-dev
cd sensors
npm install robotjs --build-from-source
```

### Stap 2: Identificeer Arduino poorten
```bash
ls /dev/ttyUSB* /dev/ttyACM*
```

Output voorbeeld:
```
/dev/ttyUSB0  <- Uno #1 (met button)
/dev/ttyUSB1  <- Uno #2
```

### Stap 3: Configureer poorten

Open [sensors/arduino_serial_keyboard_bridge.js](sensors/arduino_serial_keyboard_bridge.js) en pas poorten aan:
```javascript
const PORT1 = '/dev/ttyUSB0';  // Uno #1 met button
const PORT2 = '/dev/ttyUSB1';  // Uno #2 zonder button
```

**Fix permissions (indien nodig):**
```bash
sudo usermod -a -G dialout $USER
sudo chmod 666 /dev/ttyUSB0 /dev/ttyUSB1
```

---

## Gebruik

### Start het systeem:
```bash
# Hele systeem starten (inclusief bridge)
./start.sh

# Of alleen bridge testen
node sensors/arduino_serial_keyboard_bridge.js
```

---

## Game Code Changes

De game gebruikt nu **KeyboardController** in plaats van WebSocket:

- [bap/src/game/scenes/KeyboardController.ts](bap/src/game/scenes/KeyboardController.ts) - Nieuwe controller
- [bap/src/game/utils/rotaryClientSingleton.ts](bap/src/game/utils/rotaryClientSingleton.ts) - Gebruikt nu KeyboardController

**Key mapping:**
- `d` → Rotary 1 actief (ballon naar rechts)
- `a` → Rotary 2 actief (ballon naar links)
- `spatiebalk` → Button

---

## Testing

### Test 1: Arduino Serial Monitor

1. Open Arduino IDE
2. Tools → Serial Monitor
3. Baud rate: 115200
4. Draai aan sensor - verwacht output:
   ```
   245.32,5.12,0
   250.44,5.12,0
   ```

### Test 2: Node.js Bridge
```bash
node sensors/arduino_serial_keyboard_bridge.js
```

Verwachte output:
```
[BRIDGE] Connecting to /dev/ttyUSB0...
[BRIDGE] /dev/ttyUSB0 verbonden (Rotary 1 - Rechts)
[BRIDGE] Connecting to /dev/ttyUSB1...
[BRIDGE] /dev/ttyUSB1 verbonden (Rotary 2 - Links)
[BRIDGE] Serial to Keyboard bridge active!
[ROTARY1] Rechts (d)  <- Verschijnt bij draaien
[ROTARY2] Links (a)
```

---

## Troubleshooting

### Error: "Cannot find module 'serialport'"
```bash
cd sensors
npm install
```

### Error: "Permission denied" /dev/ttyUSB*
```bash
sudo usermod -a -G dialout $USER
# Log uit en weer in, of:
sudo chmod 666 /dev/ttyUSB0 /dev/ttyUSB1
```

### Error: "robotjs" installatie faalt
```bash
sudo apt-get install libxtst-dev libpng++-dev build-essential
cd sensors
rm -rf node_modules
npm install
```

### Bridge verbindt niet met Arduino's
```bash
# Check welke poorten beschikbaar zijn
ls -la /dev/ttyUSB* /dev/ttyACM*

# Test individuele Arduino
screen /dev/ttyUSB0 115200
# Draai sensor, zie je data? CTRL+A, K om te sluiten
```

### Arduino uploaden faalt
```bash
# Installeer Arduino IDE
sudo apt-get update
sudo apt-get install arduino

# Geef gebruiker rechten
sudo usermod -a -G dialout $USER
```

### Game reageert niet op input
1. Check of bridge draait: `ps aux | grep arduino_serial`
2. Open browser console (F12) - zie je KeyboardController logs?
3. Test keyboard handmatig: open teksteditor en draai sensor
4. Check focus op browser window

---

## Terugschakelen naar Raspberry Pi WebSocket

Open [bap/src/game/utils/rotaryClientSingleton.ts](bap/src/game/utils/rotaryClientSingleton.ts):

```typescript
// Uncomment deze regels:
import { DualRotaryWSClient } from '../scenes/DualRotaryWSClient';

// In getRotaryClient():
rotaryClient = new DualRotaryWSClient('ws://localhost:8765');
```

Update [start.sh](start.sh) om Python script te starten.
