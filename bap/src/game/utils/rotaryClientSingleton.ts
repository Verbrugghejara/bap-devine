// rotaryClientSingleton.ts
import { KeyboardController } from '../scenes/KeyboardController';

// Schakel tussen KeyboardController (Arduino) en DualRotaryWSClient (Raspberry Pi)
// import { DualRotaryWSClient } from '../scenes/DualRotaryWSClient';

let rotaryClient: KeyboardController | null = null;

export function getRotaryClient(): KeyboardController {
  if (!rotaryClient) {
    rotaryClient = new KeyboardController();
    // Voor Raspberry Pi WebSocket:
    // rotaryClient = new DualRotaryWSClient('ws://localhost:8765');
  }
  return rotaryClient;
}

export function closeRotaryClient() {
  if (rotaryClient) {
    if ('close' in rotaryClient && typeof rotaryClient.close === 'function') {
      rotaryClient.close();
    }
    rotaryClient = null;
  }
}
