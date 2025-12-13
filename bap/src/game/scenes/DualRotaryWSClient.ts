export class DualRotaryWSClient {
    ws: WebSocket | null = null;
    lastAngles: [number | null, number | null] = [null, null];
    prevAngles: [number | null, number | null] = [null, null];
    buttonPressed: boolean = false;

    constructor(url?: string) {
        const wsUrl = url || "ws://localhost:8765";
        console.log(`[DualRotaryWSClient] Connecting to WebSocket: ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('[DualRotaryWSClient] WebSocket connection opened');
        };

        this.ws.onerror = (event) => {
            console.error('[DualRotaryWSClient] WebSocket error:', event);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // console.log('[DualRotaryWSClient] Received data:', data);

                if (typeof data.angle1 === "number") {
                    this.prevAngles[0] = this.lastAngles[0];
                    this.lastAngles[0] = data.angle1;
                }

                if (typeof data.angle2 === "number") {
                    this.prevAngles[1] = this.lastAngles[1];
                    this.lastAngles[1] = data.angle2;
                }

                if (typeof data.button === "boolean" || typeof data.button === "number") {
                    this.buttonPressed = !!data.button;
                }

                // console.log('[DualRotaryWSClient] lastAngles:', this.lastAngles, 'prevAngles:', this.prevAngles);
            } catch (e) {
                console.error('[DualRotaryWSClient] Error parsing message:', e);
            }
        };

        this.ws.onclose = (event) => {
            console.warn('[DualRotaryWSClient] WebSocket connection closed:', event);
            setTimeout(() => {
                console.log('[DualRotaryWSClient] Reconnecting WebSocket...');
                const wsUrl = url || "ws://localhost:8765";
                this.ws = new WebSocket(wsUrl);
            }, 1000);
        };
    }
}
