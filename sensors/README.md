# Arduino Uno Sensor Setup

Deze folder bevat de Arduino code en Node.js bridge voor 2x Arduino Uno met AS5600 magnetische encoders.

## Bestanden

### Voor Arduino Uno (upload naar beide):
- **arduino_uno_serial.ino** - Sketch voor beide Uno's
  - Uno #1: Zet `HAS_BUTTON = true`
  - Uno #2: Laat `HAS_BUTTON = false`

### Node.js Bridge:
- **arduino_serial_keyboard_bridge.js** - Serial → Keyboard converter
- **package.json** - Dependencies configuratie

### Legacy (NIET voor Uno):
- `arduino_rotary1_rechts.ino` - Alleen voor Leonardo/Pro Micro
- `arduino_rotary2_links.ino` - Alleen voor Leonardo/Pro Micro
- `dual_rotary_ws.py` - Oude Raspberry Pi setup
- `AS5600.py` - Oude Raspberry Pi setup

## Quick Start

### 1. Upload Arduino Sketch
```bash
# Open arduino_uno_serial.ino in Arduino IDE
# Zet HAS_BUTTON op true voor Uno #1
# Upload naar beide Uno's
```

### 2. Installeer Dependencies
```bash
npm install
```

### 3. Configureer Poorten
Pas in `arduino_serial_keyboard_bridge.js` aan:
```javascript
const PORT1 = '/dev/ttyUSB0';  // Jouw Uno #1 poort
const PORT2 = '/dev/ttyUSB1';  // Jouw Uno #2 poort
```

Check poorten met:
```bash
ls /dev/ttyUSB* /dev/ttyACM*
```

### 4. Test
```bash
npm start
```

Draai aan sensoren - je zou moeten zien:
```
[ROTARY1] Rechts (d)
[ROTARY2] Links (a)
```

## Hardware Pinout

**AS5600 → Arduino Uno:**
```
SDA → A4
SCL → A5
VCC → 5V
GND → GND
```

**Button → Arduino Uno #1:**
```
Pin → D2
GND → GND (met pull-up resistor)
```

## Troubleshooting

Zie [../ARDUINO_SETUP.md](../ARDUINO_SETUP.md) voor complete instructies.
