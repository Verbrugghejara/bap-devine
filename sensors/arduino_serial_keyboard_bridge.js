/**
 * Node.js Serial to Keyboard Bridge voor Arduino Uno's
 * Leest data van 2 Arduino Uno's via Serial en simuleert keypresses
 * 
 * Vereisten:
 * - npm install serialport @serialport/parser-readline robotjs
 * - Beide Arduino's moeten arduino_uno_serial.ino draaien
 * 
 * Gebruik: node arduino_serial_keyboard_bridge.js
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const robot = require('robotjs');

// Configuratie
const THRESHOLD = 3.0;  // Graden beweging voor keypress
const PORT1 = '/dev/ttyUSB0';  // Pas aan naar jouw poorten
const PORT2 = '/dev/ttyUSB1';
const BAUD_RATE = 115200;

// State tracking
let lastKeyTime = { a: 0, d: 0, space: 0 };
const KEY_DELAY = 50;  // ms tussen keypresses

function handleRotary1Data(line) {
    try {
        const [angle, diff, button] = line.split(',').map(parseFloat);
        
        if (isNaN(diff)) return;
        
        // Rotary 1 → 'd' (rechts)
        if (Math.abs(diff) > THRESHOLD) {
            const now = Date.now();
            if (now - lastKeyTime.d > KEY_DELAY) {
                robot.keyTap('d');
                lastKeyTime.d = now;
                console.log('[ROTARY1] Rechts (d)');
            }
        }
        
        // Button → spatiebalk
        if (button === 1) {
            const now = Date.now();
            if (now - lastKeyTime.space > 200) {
                robot.keyTap('space');
                lastKeyTime.space = now;
                console.log('[BUTTON] Spatiebalk');
            }
        }
    } catch (err) {
        // console.error('[ROTARY1] Parse error:', err.message);
    }
}

function handleRotary2Data(line) {
    try {
        const [angle, diff] = line.split(',').map(parseFloat);
        
        if (isNaN(diff)) return;
        
        // Rotary 2 → 'a' (links)
        if (Math.abs(diff) > THRESHOLD) {
            const now = Date.now();
            if (now - lastKeyTime.a > KEY_DELAY) {
                robot.keyTap('a');
                lastKeyTime.a = now;
                console.log('[ROTARY2] Links (a)');
            }
        }
    } catch (err) {
        // console.error('[ROTARY2] Parse error:', err.message);
    }
}

// Setup Serial Port 1 (Rotary 1 - Rechts)
console.log(`[BRIDGE] Connecting to ${PORT1}...`);
const port1 = new SerialPort({ 
    path: PORT1, 
    baudRate: BAUD_RATE,
    autoOpen: false 
});
const parser1 = port1.pipe(new ReadlineParser({ delimiter: '\n' }));

port1.open((err) => {
    if (err) {
        console.error(`[ERROR] Kon ${PORT1} niet openen:`, err.message);
        console.log('[TIP] Controleer of Arduino aangesloten is en poort correct is');
        process.exit(1);
    }
    console.log(`[BRIDGE] ${PORT1} verbonden (Rotary 1 - Rechts)`);
});

parser1.on('data', handleRotary1Data);

// Setup Serial Port 2 (Rotary 2 - Links)
console.log(`[BRIDGE] Connecting to ${PORT2}...`);
const port2 = new SerialPort({ 
    path: PORT2, 
    baudRate: BAUD_RATE,
    autoOpen: false 
});
const parser2 = port2.pipe(new ReadlineParser({ delimiter: '\n' }));

port2.open((err) => {
    if (err) {
        console.error(`[ERROR] Kon ${PORT2} niet openen:`, err.message);
        console.log('[TIP] Controleer of beide Arduino\'s aangesloten zijn');
        process.exit(1);
    }
    console.log(`[BRIDGE] ${PORT2} verbonden (Rotary 2 - Links)`);
});

parser2.on('data', handleRotary2Data);

// Error handling
port1.on('error', (err) => console.error('[PORT1] Error:', err.message));
port2.on('error', (err) => console.error('[PORT2] Error:', err.message));

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[BRIDGE] Shutting down...');
    port1.close();
    port2.close();
    process.exit(0);
});

console.log('[BRIDGE] Serial to Keyboard bridge active!');
console.log('[BRIDGE] Rotary 1 → d (rechts), Rotary 2 → a (links)');
