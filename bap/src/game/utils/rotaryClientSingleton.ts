// rotaryClientSingleton.ts
import { DualRotaryWSClient } from '../scenes/DualRotaryWSClient';


let rotaryClient: DualRotaryWSClient | null = null;


export function getRotaryClient(): DualRotaryWSClient {
  if (!rotaryClient) {
    rotaryClient = new DualRotaryWSClient('ws://localhost:8765');
  }
  return rotaryClient;
}

export function closeRotaryClient() {
  if (rotaryClient && rotaryClient.ws) {
    rotaryClient.ws.close();
    rotaryClient = null;
  }
}
