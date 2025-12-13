// serial_ws_bridge.js
// Leest seriële data van 2 Arduino's en stuurt deze via WebSocket naar clients
// Gebruik: node serial_ws_bridge.js

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

// Pas deze poorten aan naar jouw Arduino's

// Poort instellen via argument, env of default
const PORT1 = '/dev/cu.usbmodem11401'; // Eerste Arduino
const PORT2 = '/dev/cu.usbmodem11101'; // Tweede Arduino

if (!PORT1) {
  console.error('[serial_ws_bridge] Geen seriële poort opgegeven! Geef een poort als argument of via ARDUINO_PORT.');
  process.exit(1);
}

console.log(`[serial_ws_bridge] Verbinden met ${PORT1}...`);
const serial1 = new SerialPort({ path: PORT1, baudRate: 115200, autoOpen: true });
const parser1 = serial1.pipe(new ReadlineParser({ delimiter: '\n' }));
let serial2 = null, parser2 = null;
if (PORT2) {
  serial2 = new SerialPort({ path: PORT2, baudRate: 115200, autoOpen: true });
  parser2 = serial2.pipe(new ReadlineParser({ delimiter: '\n' }));
}

let latest1 = null;
let latest2 = null;
let latestButton = false;

parser1.on('data', line => {
  try {
    console.log('[serial_ws_bridge] Serial1:', line);
    let data;
    if (line.trim().startsWith('{')) {
      data = JSON.parse(line);
      latest1 = data.angle;
      if (typeof data.button !== 'undefined') latestButton = data.button;
    } else {
      // CSV-ondersteuning: angle,angle2,button
      const parts = line.trim().split(',');
      if (parts.length >= 2) {
        latest1 = parseFloat(parts[0]);
        if (parts.length >= 3) latestButton = parseInt(parts[2]);
      }
    }
  } catch (e) {
    console.warn('[serial_ws_bridge] Parse error serial1:', e.message);
  }
});

if (parser2) {
  parser2.on('data', line => {
    try {
      console.log('[serial_ws_bridge] Serial2:', line);
      let data;
      if (line.trim().startsWith('{')) {
        data = JSON.parse(line);
        latest2 = data.angle;
        if (typeof data.button !== 'undefined') latestButton = data.button;
      } else {
        // CSV-ondersteuning: angle,angle2,button
        const parts = line.trim().split(',');
        if (parts.length >= 2) {
          latest2 = parseFloat(parts[0]);
          if (parts.length >= 3) latestButton = parseInt(parts[2]);
        }
      }
    } catch (e) {
      console.warn('[serial_ws_bridge] Parse error serial2:', e.message);
    }
  });
}

const wss = new WebSocket.Server({ port: 8765 });
console.log('[serial_ws_bridge] WebSocket server running on ws://localhost:8765');

wss.on('connection', ws => {
  console.log('[serial_ws_bridge] Client connected');
  const sendLoop = setInterval(() => {
    const payload = { angle1: latest1, angle2: latest2, button: latestButton };
    ws.send(JSON.stringify(payload));
    // Debug: toon wat er naar de client wordt gestuurd
    console.log('[serial_ws_bridge] Send WS:', payload);
    // Extra: toon verschil met vorige waarde
    if (typeof globalThis._lastAngle1 !== 'undefined' && globalThis._lastAngle1 !== payload.angle1) {
      console.log(`[serial_ws_bridge] angle1 changed: ${globalThis._lastAngle1} -> ${payload.angle1}`);
    }
    globalThis._lastAngle1 = payload.angle1;
  }, 20); // 50 Hz
  ws.on('close', () => clearInterval(sendLoop));
});
