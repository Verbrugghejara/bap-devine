
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { getRotaryClient } from "../utils/rotaryClientSingleton";

export class Tutorial extends Scene {
        private inactiveShakeTimer: number = 0;
        private inactiveShakeDirection: number = 1;
        private lastAngle2: number | undefined = undefined;
    private _changeSceneHandler?: (sceneKey: string) => void;
    balloon: Phaser.GameObjects.Image;
    propellorBlauw: Phaser.GameObjects.Sprite;
    propellorRood: Phaser.GameObjects.Sprite | null;
    windRood: Phaser.GameObjects.Sprite | null;
    propellorOffsetX: number = -38; // pas aan voor horizontale positie
    propellorOffsetY: number = 165; // pas aan voor verticale positie
    rotary: any;
    lastAngle1: number | null = null;
    title: Phaser.GameObjects.Text;
    description: Phaser.GameObjects.Text;
    progressBar: Phaser.GameObjects.Graphics | null = null;
    progress: number = 0;
    startAngle1: number | null = null;
    totalDelta: number = 0;
    activePropellor: Phaser.GameObjects.Image;
    inactivePropellor: Phaser.GameObjects.Image;
    arrows: Phaser.GameObjects.Image;

    constructor() {
        super('TutorialRed');
        this.rotary = getRotaryClient(); // Rotary client direct initialiseren
        // Progress bar wordt pas in create() aangemaakt
    }
        // ...existing code...
        // ...existing code...
    drawProgressBar() {
        if (!this.progressBar) return;
        // Draw a horizontal bar at the bottom of the screen
        const barWidth = 600;
        const barHeight = 32;
        const barX = this.scale.width / 2 - barWidth / 2;
        const barY = 1050;
        this.progressBar.clear();
        // Background
        this.progressBar.fillStyle(0xffffff, 0.25);
        // console.log(this.progress)
        this.progressBar.fillRoundedRect(barX, barY, barWidth, barHeight, 16);
        // Fill (altijd binnen de lijnen, radius alleen rechts bij voldoende breedte)
        let fillWidth = (barWidth - 30) * this.progress;
        // console.log('fillWidth:', fillWidth)
        if (this.progress > 0) {
            const radius = 16;
            this.progressBar.fillStyle(0xF25C54, 1);
            // fill van rechts naar links
            const fillX = barX + barWidth - (fillWidth + 30);
            this.progressBar.fillRoundedRect(fillX, barY, fillWidth + 30, barHeight, { tl: radius, tr: radius, bl: radius, br: radius });
        }
        if (this.progress >= 1){
                // EventBus.emit('change-scene', 'Game');
                // Game-scene wordt gestart, App.vue vangt dit op en toont countdown
                this.scene.start('Game');
        }
        // geen fillWidth >= check meer nodig
        // Border
        // this.progressBar.lineStyle(4, 0xF25C54, 1);
        this.progressBar.strokeRoundedRect(barX, barY, barWidth, barHeight, 16);
    }

    create() {
        // ...
        // this.balloon = this.add.image(280, 820, 'balloon').setDepth(1000).setScale(0.5);
        // Voeg de actieve propellor toe als image (PNG)
        const propellorX = this.scale.width / 2;
        const propellorY = this.scale.height / 2 + 350;
        this.inactivePropellor = this.add.image(
            propellorX-150,
            propellorY,
            'inactive'
        ).setDepth(1001).setScale(0.60);
        this.activePropellor = this.add.image(
            propellorX+150,
            propellorY,
            'active-rood'
        ).setDepth(1003).setScale(0.60);
        // Zet arrows exact gecentreerd op de activePropellor
        this.arrows = this.add.image(
            this.activePropellor.x,
            this.activePropellor.y,
            'arrows'
        ).setDepth(1004).setScale(0.60);
        // Progress bar initialisatie
        this.progressBar = this.add.graphics();
        this.progressBar.setDepth(20);
        this.progress = 0;
        this.startAngle1 = null;
        this.totalDelta = 0;
        this.drawProgressBar();

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
        this.balloon = this.add.image(this.scale.width - 280, 820, 'balloon').setDepth(1000).setScale(0.5);
        // Plaats de blauwe propellor onder de ballon (relatief, met offset)
        this.propellorBlauw = this.add.sprite(
            this.balloon.x + this.propellorOffsetX,
            this.balloon.y + this.propellorOffsetY,
            'propellor-blauw'
        ).setDepth(1002).setScale(0.5);
        this.propellorBlauw.play('propellor-blauw');

        // Plaats de rode propellor onder de ballon (andere offset)
        this.propellorRood = this.add.sprite(
            this.balloon.x + this.propellorOffsetX + 150,
            this.balloon.y + this.propellorOffsetY,
            'propellor-rood'
        ).setDepth(1002).setScale(0.5);
        this.propellorRood.play('propellor-rood');
        if (this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
            this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
        }
        this.windRood = null;
        // Eerst de tekstobject aanmaken (zonder achtergrond)
        
        // Graphics achtergrond met border radius tekenen
        const paddingX = 32;
        const paddingY = 24;
        const borderRadius = 16;
        // Eerst de tekstgrootte bepalen zodat de graphics correct gepositioneerd zijn
        const titleY = 380; // Lager zetten (verhoog deze waarde voor lager)
        const tempTitle = this.add.text(0, 0, 'Hoe werkt het?', {
            fontFamily: 'Bungee',
            fontSize: 40,
            color: '#fff',
            padding: { x: 20, y: 10 },
            align: 'center',
        }).setOrigin(0.5).setDepth(11);
        const titleWidth = tempTitle.width + paddingX * 2;
        const titleHeight = tempTitle.height + paddingY * 2;
        const shadowOffset = 8;
        const titleBg = this.add.graphics();
        // Schaduw tekenen (eerst, zodat de kleur er bovenop komt)
        titleBg.fillStyle(0xA83C37, 1);
        titleBg.fillRoundedRect(
            this.scale.width / 2 - titleWidth / 2,
            titleY - titleHeight / 2 + shadowOffset,
            titleWidth,
            titleHeight,
            borderRadius
        );
        // Hoofdvlak tekenen
        titleBg.fillStyle(0xF25C54, 1);
        titleBg.fillRoundedRect(
            this.scale.width / 2 - titleWidth / 2,
            titleY - titleHeight / 2,
            titleWidth,
            titleHeight,
            borderRadius
        );
        titleBg.setDepth(10);
        // Nu de echte titeltekst bovenop de graphics plaatsen
        this.title = this.add.text(
            this.scale.width / 2,
            titleY,
            'Hoe werkt het?',
            {
                fontFamily: 'Bungee',
                fontSize: 40,
                color: '#fff',
                padding: { x: 20, y: 10 },
                align: 'center',
            }
        ).setOrigin(0.5).setDepth(10);
        tempTitle.destroy();

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.25);
        const rectWidth = 800;
        const rectHeight = 1100;
        const rectRadius = 20;
        // Center the rectangle
        const rectX = (this.scale.width - rectWidth) / 2;
        const rectY = (this.scale.height - rectHeight) / 2;
        // Draw filled rounded rect
        bg.fillRoundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius);
        // Draw border (stroke) around the rect
        bg.lineStyle(6, 0xF25C54, 1); // 4px white border
        bg.strokeRoundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius);
        bg.setDepth(1);

        // Maak "Draai aan " en "blauw" als losse tekstobjecten, samen gecentreerd
        const descFontSize = 32;
        const descY = this.scale.height / 2 - 450;
        const text1 = this.add.text(0, 0, 'Draai aan ', {
            fontFamily: 'Space Grotesk',
            fontSize: descFontSize,
            color: '#ffffff',
            fontStyle: 'normal',
        }).setOrigin(0, 0.5).setDepth(10);
        const text2 = this.add.text(0, 0, 'rood', {
            fontFamily: 'Space Grotesk',
            fontSize: descFontSize,
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(10);
        // Bepaal totale breedte en centreer
        const totalWidth = text1.width + text2.width;
        const startX = this.scale.width / 2 - totalWidth / 2;
        text1.x = startX;
        text2.x = startX + text1.width;
        text1.y = descY;
        text2.y = descY;
    }
    update() {
                        // Shake inactivePropellor als angle2 draait
                        let angle2Delta = 0;
                        if (this.rotary && this.rotary.lastAngles && this.rotary.lastAngles.length > 1) {
                            const angle2 = this.rotary.lastAngles[0];
                            if (typeof angle2 === 'number' && this.lastAngle2 !== undefined) {
                                angle2Delta = angle2 - this.lastAngle2;
                                if (Math.abs(angle2Delta) >= 2) {
                                    this.inactiveShakeTimer = 10; // aantal frames schudden
                                    this.inactiveShakeDirection = Math.sign(angle2Delta) || 1;
                                }
                            }
                            this.lastAngle2 = angle2;
                        }

                        // Shake animatie uitvoeren
                        if (this.inactivePropellor) {
                            if (this.inactiveShakeTimer > 0) {
                                // Shake: roteer snel heen en weer
                                this.inactivePropellor.rotation = Math.sin(this.inactiveShakeTimer * 0.7) * 0.25 * this.inactiveShakeDirection;
                                this.inactiveShakeTimer--;
                            } else {
                                this.inactivePropellor.rotation = 0;
                            }
                        }
                // Laat de arrows constant naar links roteren
                if (this.arrows) {
                    this.arrows.rotation -= 0.05;
                }

                // Active propellor draait alleen als de sensor beweegt, in beide richtingen, met een stap van minimaal 2 graden
                if (this.activePropellor) {
                    if (this.rotary && this.rotary.lastAngles && Array.isArray(this.rotary.lastAngles)) {
                        const angle1 = this.rotary.lastAngles[1];
                        if (typeof angle1 === 'number' && this.lastAngle1 !== null && angle1 !== this.lastAngle1) {
                            const deltaStep = angle1 - this.lastAngle1;
                            if (Math.abs(deltaStep) >= 2) {
                                // Draai naar links of rechts afhankelijk van deltaStep
                                this.activePropellor.rotation += Math.sign(deltaStep) * 0.15;
                            }
                        }
                    }
                }
        // Rotary sensor uitlezen en ballon bewegen + progress
        let propellorShouldSpin = false;
        if (this.rotary && this.rotary.lastAngles && Array.isArray(this.rotary.lastAngles)) {
            const angle1 = this.rotary.lastAngles[1];
            if (typeof angle1 === 'number') {
                if (this.startAngle1 === null) {
                    this.startAngle1 = angle1;
                    this.lastAngle1 = angle1;
                } else if (this.lastAngle1 !== null) {
                    if (angle1 !== this.lastAngle1) {
                        const deltaStep = angle1 - this.lastAngle1;
                        if (Math.abs(deltaStep) >= 2 && Math.abs(deltaStep) < 50) {
                            propellorShouldSpin = true;
                            this.totalDelta += Math.abs(deltaStep);
                            // Progress: 0..1 over 2000 rotary delta
                            this.progress = Math.min(1, this.totalDelta / 2000);
                            // Balloon moves left as progress increases
                            const balloonStartX = this.scale.width - 280;
                            const balloonEndX = 280;
                            this.balloon.x = balloonStartX + (balloonEndX - balloonStartX) * this.progress;
                            this.drawProgressBar();
                        }
                    }
                    this.lastAngle1 = angle1;
                }
            }
        }
        // Propellor animatie aan/uit (blauw: alleen bij beweging, rood: altijd draaien)
        // PropellorRood: speel altijd 1x af bij nieuwe draai (en alleen dan)
        if (propellorShouldSpin) {
            if (this.propellorRood && !this.propellorRood.anims.isPlaying) {
                this.propellorRood.play({ key: 'propellor-rood', repeat: 0 });
                this.propellorRood.once('animationcomplete', () => {
                    if (this.propellorRood && this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
                        this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
                    }
                });
            }
        } else {
            if (this.propellorRood && !this.propellorRood.anims.isPlaying && this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
                this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
            }
        }

        // WindRood: speel altijd 1x af bij nieuwe draai (en alleen dan)
        if (propellorShouldSpin) {
            if (!this.windRood) {
                if (this.balloon) {
                    this.windRood = this.add.sprite(
                        this.balloon.x + this.propellorOffsetX + 130,
                        this.balloon.y + this.propellorOffsetY,
                        'wind-rood'
                    ).setDepth(1002).setScale(0.4);
                    this.windRood.play({ key: 'wind-rood', repeat: 0 });
                    this.windRood.once('animationcomplete', () => {
                        if (this.windRood) {
                            this.windRood.destroy();
                            this.windRood = null;
                        }
                    });
                }
            } else if (this.windRood.anims && this.windRood.anims.isPlaying) {
                // Already animating, do nothing
            }
        } else {
            if (this.windRood && !this.windRood.anims.isPlaying) {
                this.windRood.destroy();
                this.windRood = null;
            }
        }
        if (this.propellorBlauw) {
            if (this.propellorBlauw.anims.currentAnim && this.propellorBlauw.anims.currentAnim.frames.length > 0) {
                this.propellorBlauw.anims.pause(this.propellorBlauw.anims.currentAnim.frames[0]);
            }
        }
        // Zorg dat de propellor en wind altijd onder de ballon blijven hangen
        if (this.balloon && this.propellorBlauw && this.propellorRood) {
            this.propellorBlauw.x = this.balloon.x + this.propellorOffsetX;
            this.propellorBlauw.y = this.balloon.y + this.propellorOffsetY;
            // Gebruik dezelfde offset als in create()
            this.propellorRood.x = this.balloon.x + this.propellorOffsetX + 77;
            this.propellorRood.y = this.balloon.y + this.propellorOffsetY;
        }
        // WindRood positie updaten als hij bestaat
        if (this.windRood) {
            this.windRood.x = this.balloon.x + this.propellorOffsetX + 130;
            this.windRood.y = this.balloon.y + this.propellorOffsetY;
        }
    }

    shutdown() {
        if (this._changeSceneHandler) {
            EventBus.off('change-scene', this._changeSceneHandler);
        }
    }

}