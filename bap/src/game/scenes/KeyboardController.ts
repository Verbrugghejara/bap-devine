/**
 * Keyboard Controller - Vervangt DualRotaryWSClient
 * Gebruikt keyboard events (a/d keys) in plaats van WebSocket
 */

export class KeyboardController {
    private keysPressed = new Set<string>();
    lastAngles: [number | null, number | null] = [null, null];
    prevAngles: [number | null, number | null] = [null, null];
    buttonPressed: boolean = false;
    
    private simulatedAngle1: number = 0;
    private simulatedAngle2: number = 0;
    private readonly ANGLE_INCREMENT = 10; // Graden per keypress

    constructor() {
        this.setupKeyboardListeners();
        console.log('[KeyboardController] Keyboard input active (a=links, d=rechts, space=button)');
    }

    private setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.keysPressed.has(e.key)) return; // Prevent repeat
            
            this.keysPressed.add(e.key);
            
            // Update simulated angles voor compatibiliteit met bestaande game code
            this.prevAngles = [...this.lastAngles];
            
            if (e.key === 'd') {
                // Rotary 1 actief → rechts
                this.simulatedAngle1 = (this.simulatedAngle1 + this.ANGLE_INCREMENT) % 360;
                this.lastAngles[0] = this.simulatedAngle1;
                console.log('[KeyboardController] Rotary1 (rechts) - angle:', this.simulatedAngle1);
            } else if (e.key === 'a') {
                // Rotary 2 actief → links
                this.simulatedAngle2 = (this.simulatedAngle2 + this.ANGLE_INCREMENT) % 360;
                this.lastAngles[1] = this.simulatedAngle2;
                console.log('[KeyboardController] Rotary2 (links) - angle:', this.simulatedAngle2);
            } else if (e.key === ' ') {
                this.buttonPressed = true;
                console.log('[KeyboardController] Button pressed');
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.key);
            
            if (e.key === ' ') {
                this.buttonPressed = false;
            }
        });
    }

    /**
     * Check of een specifieke key momenteel ingedrukt is
     */
    isKeyPressed(key: string): boolean {
        return this.keysPressed.has(key);
    }

    /**
     * Cleanup (compatibiliteit met oude WebSocket interface)
     */
    close() {
        this.keysPressed.clear();
        console.log('[KeyboardController] Closed');
    }
}
