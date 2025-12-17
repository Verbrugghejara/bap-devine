const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9000 });

wss.on('connection', function connection(ws, req) {
  const ip = req.socket.remoteAddress;
  console.log('Client connected from', ip);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send(message); // echo terug
  });
  ws.on('close', () => {
    console.log('Client disconnected:', ip);
  });
});
console.log('WebSocket echo server running on ws://0.0.0.0:9000');
