
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { getRotaryClient } from "../utils/rotaryClientSingleton";

export class Tutorial extends Scene {
    private _changeSceneHandler?: (sceneKey: string) => void;
    balloon: Phaser.GameObjects.Image;
    propellorBlauw: Phaser.GameObjects.Sprite;
    propellorOffsetX: number = -38; // pas aan voor horizontale positie
    propellorOffsetY: number = 165; // pas aan voor verticale positie
    rotary: any;
    lastAngle1: number | null = null;

    constructor() {
        super('Tutorial');
        // this.rotary = getRotaryClient();
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
        // this.balloon = this.add.image(250, 300, 'balloon').setDepth(1000).setScale(0.5);
        // // Plaats de propellor onder de ballon (relatief, met offset)
        // this.propellorBlauw = this.add.sprite(
        //     this.balloon.x + this.propellorOffsetX,
        //     this.balloon.y + this.propellorOffsetY,
        //     'propellor-blauw'
        // ).setDepth(1002).setScale(0.5);
        // this.propellorBlauw.play('propellor-blauw');
    }
    update() {
        // Rotary sensor uitlezen en ballon bewegen
        // if (this.rotary && this.rotary.lastAngles && Array.isArray(this.rotary.lastAngles)) {
        //     const angle1 = this.rotary.lastAngles[0];
        //     if (typeof angle1 === 'number') {
        //         if (!this.lastAngle1) this.lastAngle1 = angle1;
        //         const diff = angle1 - this.lastAngle1;
        //         if (Math.abs(diff) > 2) {
        //             // Ballon naar rechts bij draaien sensor 1
        //             this.balloon.x += 4;
        //         }
        //         this.lastAngle1 = angle1;
        //     }
        // }
        // Zorg dat de propellor altijd onder de ballon blijft hangen
        // if (this.balloon && this.propellorBlauw) {
        //     this.propellorBlauw.x = this.balloon.x + this.propellorOffsetX;
        //     this.propellorBlauw.y = this.balloon.y + this.propellorOffsetY;
        // }
    }

    shutdown() {
        if (this._changeSceneHandler) {
            EventBus.off('change-scene', this._changeSceneHandler);
        }
    }

}