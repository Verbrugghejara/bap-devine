
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";

export class Tutorial extends Scene {
    private _changeSceneHandler?: (sceneKey: string) => void;

    constructor() {
        super('ControllerChecks');
    }

    create() {
        this.cameras.main.setBackgroundColor('#' + SFEER_LABELS[0].colors.a.toString(16).padStart(6, '0').toUpperCase());
        // Notify Vue that the Tutorial scene is active
        EventBus.emit('current-scene-ready', this);

        // Luister naar change-scene event vanuit Vue
        this._changeSceneHandler = (sceneKey: string) => {
            if (sceneKey === 'Game') {
                // Clean up listener vóór scene-wissel
                EventBus.off('change-scene', this._changeSceneHandler!);
                // Alleen scene starten als deze nog actief is
                if (this.scene && this.scene.isActive && this.scene.isActive('Tutorial')) {
                    this.scene.start('Game');
                }
            }
        };
        EventBus.on('change-scene', this._changeSceneHandler);

        // Zorg dat cleanup gebeurt bij scene shutdown
        this.events.on('shutdown', this.shutdown, this);
    }


    shutdown() {
        if (this._changeSceneHandler) {
            EventBus.off('change-scene', this._changeSceneHandler);
        }
    }

    destroy() {
        this.shutdown();
        // super.destroy(); // Scene in Phaser heeft geen destroy()
    }
}