// serial_ws_bridge.js
// Leest seriele data van 2 Arduino's en stuurt deze via WebSocket naar clients
// Gebruik: node serial_ws_bridge.js

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

const PORT1 = '/dev/cu.usbmodemF09E9E740F042'; // Eerste Arduino
const PORT2 = '/dev/cu.usbmodem3CDC75F1646C2'; // Tweede Arduino
// const PORT1 = null;
// const PORT2 = '/dev/cu.usbmodem3CDC75F1646C2';

const BAUD_RATE = 115200;

let latest1 = null;
let latest2 = null;
let latestButton1 = false;
let latestButton2 = false;

function parseArduinoLine(line) {
  const clean = line.trim();

  if (!clean || clean === 'ERROR') return null;

  if (clean.startsWith('{')) {
    const data = JSON.parse(clean);
    return {
      angle: Number(data.angle),
      diff: Number(data.diff ?? 0),
      button: data.button === true || data.button === 1 || data.button === '1'
    };
  }

  // Verwacht CSV: angle,diff,button
  const parts = clean.split(',');
  if (parts.length < 3) return null;

  const angle = parseFloat(parts[0]);
  const diff = parseFloat(parts[1]);
  const button = parseInt(parts[2], 10) === 1;

  if (Number.isNaN(angle)) return null;

  return { angle, diff, button };
}

console.log(`[serial_ws_bridge] Verbinden met Serial1: ${PORT1}`);
const serial1 = new SerialPort({ path: PORT1, baudRate: BAUD_RATE, autoOpen: true });
const parser1 = serial1.pipe(new ReadlineParser({ delimiter: '\n' }));

serial1.on('open', () => {
  console.log(`[serial_ws_bridge] Serial1 open: ${PORT1}`);
});

serial1.on('error', err => {
  console.error('[serial_ws_bridge] Serial1 error:', err.message);
});

parser1.on('data', line => {
  try {
    console.log('[serial_ws_bridge] Serial1:', line);

    const data = parseArduinoLine(line);
    if (!data) return;

    latest1 = data.angle;
    latestButton1 = data.button;
  } catch (e) {
    console.warn('[serial_ws_bridge] Parse error serial1:', e.message);
  }
});

let serial2 = null;
let parser2 = null;

if (PORT2) {
  console.log(`[serial_ws_bridge] Verbinden met Serial2: ${PORT2}`);

  serial2 = new SerialPort({ path: PORT2, baudRate: BAUD_RATE, autoOpen: true });
  parser2 = serial2.pipe(new ReadlineParser({ delimiter: '\n' }));

  serial2.on('open', () => {
    console.log(`[serial_ws_bridge] Serial2 open: ${PORT2}`);
  });

  serial2.on('error', err => {
    console.error('[serial_ws_bridge] Serial2 error:', err.message);
  });

  parser2.on('data', line => {
    try {
      console.log('[serial_ws_bridge] Serial2:', line);

      const data = parseArduinoLine(line);
      if (!data) return;

      latest2 = data.angle;
      latestButton2 = data.button;
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
    const payload = {
      angle1: latest1,
      angle2: latest2,
      button1: latestButton1,
      button2: latestButton2,

      // handig als je frontend nog oude "button" verwacht
      button: latestButton1 || latestButton2
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }

    console.log('[serial_ws_bridge] Send WS:', payload);
  }, 20); // 50 Hz

  ws.on('close', () => {
    console.log('[serial_ws_bridge] Client disconnected');
    clearInterval(sendLoop);
  });
});