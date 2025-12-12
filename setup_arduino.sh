#!/bin/bash
# Quick setup script voor Arduino Uno installatie

echo "╔════════════════════════════════════════╗"
echo "║  Arduino Uno Setup - Dependency Check ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js niet gevonden"
    echo "   Installeer met: sudo apt-get install nodejs npm"
    exit 1
fi
echo "✓ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm niet gevonden"
    exit 1
fi
echo "✓ npm: $(npm --version)"

# Installeer dependencies
echo ""
echo "📦 Installeren van Node.js dependencies..."
cd sensors

if [ ! -f "package.json" ]; then
    echo "❌ package.json niet gevonden in sensors/"
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Installatie gefaald. Probeer:"
    echo "   sudo apt-get install libxtst-dev libpng++-dev build-essential"
    echo "   cd sensors && npm install robotjs --build-from-source"
    exit 1
fi

echo ""
echo "✓ Dependencies geïnstalleerd"

# Check Arduino poorten
echo ""
echo "🔌 Beschikbare Arduino poorten:"
ls -la /dev/ttyUSB* /dev/ttyACM* 2>/dev/null || echo "   Geen Arduino's gevonden"

# Check permissions
echo ""
echo "🔑 Controleren van permissions..."
if groups | grep -q dialout; then
    echo "✓ Gebruiker heeft dialout permissions"
else
    echo "⚠️  Voeg gebruiker toe aan dialout groep:"
    echo "   sudo usermod -a -G dialout $USER"
    echo "   (log daarna uit en weer in)"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         Setup Compleet!                ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Volgende stappen:"
echo "1. Upload arduino_uno_serial.ino naar beide Uno's"
echo "   - Uno #1: Zet HAS_BUTTON = true"
echo "   - Uno #2: Laat HAS_BUTTON = false"
echo ""
echo "2. Pas poorten aan in sensors/arduino_serial_keyboard_bridge.js"
echo ""
echo "3. Test de bridge:"
echo "   node sensors/arduino_serial_keyboard_bridge.js"
echo ""
echo "4. Start het hele systeem:"
echo "   ./start.sh"
