// Test script om button events naar de game te sturen
// Gebruik: node test_button_sender.js

const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:8765');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

ws.on('open', () => {
  console.log('Connected to ws://localhost:8765');
  console.log('Druk op SPATIE om button press te simuleren');
  console.log('Druk op Q om te stoppen\n');
  
  // Enable raw mode to capture single keypresses
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  
  process.stdin.on('data', (key) => {
    const char = key.toString();
    
    if (char === ' ') {
      // Stuur button press
      const data = JSON.stringify({
        angle1: 180,
        angle2: 180,
        button: true
      });
      ws.send(data);
      console.log('→ Button PRESSED (true)');
      
      // Na 100ms stuur button release
      setTimeout(() => {
        const releaseData = JSON.stringify({
          angle1: 180,
          angle2: 180,
          button: false
        });
        ws.send(releaseData);
        console.log('→ Button RELEASED (false)');
      }, 100);
    } else if (char === 'q' || char === '\u0003') { // q or Ctrl+C
      console.log('\nStopping...');
      ws.close();
      process.exit(0);
    }
  });
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
  console.log('\nZorg dat de dual_rotary_ws.py server draait!');
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});

// Keep alive - stuur periodiek updates
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({
      angle1: 180,
      angle2: 180,
      button: false
    });
    ws.send(data);
  }
}, 50); // 20Hz
