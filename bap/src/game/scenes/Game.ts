// Helper voor hoekverschil
function angleDiff(a: number, b: number): number {
    let diff = a - b;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}


import { getRotaryClient, closeRotaryClient } from '../utils/rotaryClientSingleton';
import { SFEER_LABELS } from '../utils/sfeerLabels';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
        private smoothScrollSpeed: number = 5;
    private _lastLeftDown: boolean = false;
    private _lastRightDown: boolean = false;
    private _lastRotaryDiffs: [number, number] = [0, 0];

    private inactivityTimeout: any = null;
    huidigeSfeerIndex: number = 0;
    sfeerRects: Phaser.GameObjects.Rectangle[] = [];
    private sfeerBaseY: number[] = [];
    sfeerHoogtes: number[] = [];
    ballon: Phaser.GameObjects.Sprite | null = null;
    ballonContainer: Phaser.GameObjects.Container | null = null;
    ballonHealth: number = 3;
    ballonInvulnerable: boolean = false;
    birds: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    birdSpawnTimer: Phaser.Time.TimerEvent | null = null;
    rotary: any = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private sfeerOffsetY: number = 0;
    private _lastDiffs: [number, number] = [0, 0];
    propellorRood: Phaser.GameObjects.Sprite | null;
    propellorBlauw: Phaser.GameObjects.Sprite | null;
    windBlauw: Phaser.GameObjects.Sprite | null = null;
    windRood: Phaser.GameObjects.Sprite | null = null;
    propellorOffsetXBlauw: number = -39;
    propellorOffsetXRood: number = 39;
    propellorOffsetY: number = 160;
    bgTroposfeer: Phaser.GameObjects.Image | null = null;
    bgStratosfeer: Phaser.GameObjects.Image | null = null;
    bgMesosfeer: Phaser.GameObjects.Image | null = null;
    bgThermosfeer: Phaser.GameObjects.Image | null = null;
    bgExosfeer: Phaser.GameObjects.Image | null = null;

    private enterKey: Phaser.Input.Keyboard.Key | null = null;
    private wasEnterDown: boolean = false;
    private isGamePaused: boolean = false;
    private isGameActive: boolean = true;
    private pauseStartTime: number | null = null;

    constructor() {
        super('Game');
        // Start countdown overlay zodra Game scene wordt aangemaakt
        EventBus.emit('show-countdown');
        // Luister naar pause/resume events vanuit EventBus
        EventBus.on('pause-game-scene', this.handlePauseGameScene, this);
        // EventBus.on('resume-game-scene', this.handleResumeGameScene, this);
    }

    handlePauseGameScene() {
        if (this.scene.isActive() && !this.scene.isPaused()) {
            this.scene.pause();
        }
    }



    // Checkt overlap tussen twee game objects
    checkOverlap(a: any, b: any): boolean {
        if (!a || !b) return false;
        const ab = (a.getBounds) ? a.getBounds() : a.body.getBounds();
        const bb = (b.getBounds) ? b.getBounds() : b.body.getBounds();
        const marginA = 20, marginB = 20;
        const abRect = new Phaser.Geom.Rectangle(ab.x + marginA, ab.y + marginA, ab.width - 2 * marginA, ab.height - 2 * marginA);
        const bbRect = new Phaser.Geom.Rectangle(bb.x + marginB, bb.y + marginB, bb.width - 2 * marginB, bb.height - 2 * marginB);
        return Phaser.Geom.Intersects.RectangleToRectangle(abRect, bbRect);
    }


    damageBallon() {
        this.ballonHealth--;
        this.ballonInvulnerable = true;
        EventBus.emit('update-health', this.ballonHealth);
        if (this.ballon) {
            this.tweens.add({
                targets: this.ballon,
                alpha: 0.3,
                yoyo: true,
                repeat: 5,
                duration: 80,
                onComplete: () => {
                    if (this.ballon) this.ballon.alpha = 1;
                    this.ballonInvulnerable = false;
                }
            });
        }
        if (this.ballonHealth <= 2) {
            this.time.delayedCall(1000, () => {
                EventBus.emit('hide-gameui'); // Laat GameUI verdwijnen
                // this.scene.pause();
                this.scene.start('GameOver');
            });
        }
    }


    create() {
 
        // Reset alle relevante game state bij elke start van de Game scene
        this.ballonHealth = 3;
        this.sfeerOffsetY = 0;
        this.huidigeSfeerIndex = 0;
        this.isGamePaused = false;
        this.pauseStartTime = null;
        // Toon countdown overlay bij elke nieuwe game
        EventBus.emit('show-countdown');
        this.rotary = getRotaryClient();
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        // Zet de achtergrondkleur van de scene op transparant
        this.cameras.main.setBackgroundColor(0x00000000);
        // Troposfeer = eerste sfeer, 3x zo hoog, met achtergrond
        const standaardHoogte = this.scale.height;
        // Troposfeer: 3 schermen hoog, Stratosfeer: 4 schermen hoog, Mesosfeer: 5 schermen hoog, Thermosfeer: 6 schermen hoog, Exosfeer: 7 schermen hoog
        this.sfeerHoogtes = [
            standaardHoogte * 3, // troposfeer
            standaardHoogte * 4, // stratosfeer
            standaardHoogte * 5, // mesosfeer
            standaardHoogte * 6, // thermosfeer
            standaardHoogte * 7, // exosfeer
        ];
                // Voeg de achtergrondafbeelding toe voor de exosfeer (vijfde sfeer)
                const bgHoogteExosfeer = this.sfeerHoogtes[4];
                if (this.textures.exists('bg-exosfeer')) {
                    this.bgExosfeer = this.add.image(
                        this.scale.width / 2,
                        0, // tijdelijke y, wordt in update gezet
                        'bg-exosfeer'
                    ).setOrigin(0.5, 1)
                        .setDepth(-204); // achter thermosfeer
                    const texE = this.textures.get('bg-exosfeer').getSourceImage();
                    const scaleYE = bgHoogteExosfeer / texE.height;
                    this.bgExosfeer.setScale(this.scale.width / texE.width, scaleYE);
                    console.log("[Game] Exosfeer achtergrond toegevoegd.");
                } else {
                    this.bgExosfeer = null;
                }
        this.sfeerRects = [];
        this.sfeerBaseY = [];
        // Voeg de achtergrondafbeelding toe voor de troposfeer (eerste sfeer)
        const bgHoogte = this.sfeerHoogtes[0];
        // Startpositie: onderkant van het canvas, zodat je direct de troposfeer ziet
        if (this.textures.exists('bg-troposfeer')) {
            this.bgTroposfeer = this.add.image(
                this.scale.width / 2,
                this.scale.height,
                'bg-troposfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-200);
            // Schaal de afbeelding zodat de hoogte exact bgHoogte is, breedte wordt automatisch geschaald
            const tex = this.textures.get('bg-troposfeer').getSourceImage();
            const scaleY = bgHoogte / tex.height;
            this.bgTroposfeer.setScale(this.scale.width / tex.width, scaleY);

            console.log("[Game] Troposfeer achtergrond toegevoegd.");
        } else {
            this.bgTroposfeer = null;
        }
        // Voeg de achtergrondafbeelding toe voor de stratosfeer (tweede sfeer)
        const bgHoogteStratosfeer = this.sfeerHoogtes[1];
        if (this.textures.exists('bg-stratosfeer')) {
            this.bgStratosfeer = this.add.image(
                this.scale.width / 2,
                0, // tijdelijke y, wordt in update gezet
                'bg-stratosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-201); // achter troposfeer
            const texS = this.textures.get('bg-stratosfeer').getSourceImage();
            const scaleYS = bgHoogteStratosfeer / texS.height;
            this.bgStratosfeer.setScale(this.scale.width / texS.width, scaleYS);
            console.log("[Game] Stratosfeer achtergrond toegevoegd.");
        } else {
            this.bgStratosfeer = null;
        }

        // Voeg de achtergrondafbeelding toe voor de mesosfeer (derde sfeer)
        const bgHoogteMesosfeer = this.sfeerHoogtes[2];
        if (this.textures.exists('bg-mesosfeer')) {
            this.bgMesosfeer = this.add.image(
                this.scale.width / 2,
                0, // tijdelijke y, wordt in update gezet
                'bg-mesosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-202); // achter stratosfeer
            const texM = this.textures.get('bg-mesosfeer').getSourceImage();
            const scaleYM = bgHoogteMesosfeer / texM.height;
            this.bgMesosfeer.setScale(this.scale.width / texM.width, scaleYM);
            console.log("[Game] Mesosfeer achtergrond toegevoegd.");
        } else {
            this.bgMesosfeer = null;
        }
        const bgHoogteThermosfeer = this.sfeerHoogtes[3];
        if (this.textures.exists('bg-thermosfeer')) {
            this.bgThermosfeer = this.add.image(
                this.scale.width / 2,
                0, // tijdelijke y, wordt in update gezet
                'bg-thermosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-203); // achter mesosfeer
            const texT = this.textures.get('bg-thermosfeer').getSourceImage();
            const scaleYT = bgHoogteThermosfeer / texT.height;
            this.bgThermosfeer.setScale(this.scale.width / texT.width, scaleYT);
            console.log("[Game] Thermosfeer achtergrond toegevoegd.");
        } else {
            this.bgThermosfeer = null;
        }
        // Sferen tekenen: eerste sfeer is troposfeer, rest standaard
        let worldY = this.scale.height - this.sfeerHoogtes[0] / 2;
        for (let i = 0; i < this.sfeerHoogtes.length; i++) {
            const hoogte = this.sfeerHoogtes[i];
            // Eerste sfeer: troposfeer-kleur, rest: SFEER_LABELS[i-1] (want troposfeer is apart)
            const kleur = SFEER_LABELS[i]?.colors?.a ?? 0xffffff;
            const kleurInt = typeof kleur === 'number' ? kleur : 0xffffff;
            const baseCenterY = worldY;
            this.sfeerBaseY.push(baseCenterY);
            const rect = this.add.rectangle(
                this.scale.width / 2,
                baseCenterY,
                this.scale.width,
                hoogte,
                kleurInt
            ).setDepth(-100);
            // Maak de eerste t/m vijfde sfeer-rectangle transparant zodat de achtergrond zichtbaar is
            if (i === 0 || i === 1 || i === 2 || i === 3 || i === 4) rect.setFillStyle(kleurInt, 0);
            rect.width = this.scale.width;
            rect.height = hoogte;
            this.sfeerRects.push(rect);
            if (i < this.sfeerHoogtes.length - 1) {
                worldY -= (hoogte / 2) + (this.sfeerHoogtes[i + 1] / 2);
            }
        }
        this.sfeerOffsetY = 0;
        try {
            // Maak de ballon sprite
            this.ballon = this.add.sprite(
                0,
                0,
                "balloon"
            ).setScale(0.5).setDepth(50);
            // Maak de propellors aan, met offset t.o.v. ballon
            this.propellorBlauw = this.add.sprite(
                this.propellorOffsetXBlauw,
                this.propellorOffsetY,
                'propellor-blauw'
            ).setScale(0.5).setDepth(1002);
            // Zet animatie op eerste frame en pauzeer, speel niet automatisch
            if (this.anims.exists('propellor-blauw')) {
                this.propellorBlauw.setFrame(0);
                this.propellorBlauw.anims.stop();
            }
            this.propellorRood = this.add.sprite(
                this.propellorOffsetXRood,
                this.propellorOffsetY,
                'propellor-rood'
            ).setScale(0.5).setDepth(1002);
            // Zet animatie op eerste frame en pauzeer, speel niet automatisch
            if (this.anims.exists('propellor-rood')) {
                this.propellorRood.setFrame(0);
                this.propellorRood.anims.stop();
            }
            this.windBlauw = null;
            this.windRood = null;
            // Zet alles in een container, ballon als laatste zodat hij niet achter de propellors zit
            this.ballonContainer = this.add.container(
                this.scale.width / 2,
                this.scale.height * 0.85,
                [this.propellorBlauw, this.propellorRood, this.ballon]
            );
            this.ballonContainer.setDepth(1002);
        } catch (e) {
            console.error("[Game] Kan ballon of propellors niet aanmaken!", e);
        }
        this.birds = [];
        this.spawnBird();
        this.birdSpawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(4000, 7000),
            loop: true,
            callback: () => this.spawnBird()
        });
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = true;
            this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            console.log('EnterKey initialized:', this.enterKey);
        } else {
            console.log('Keyboard input not available!');
        }
        this.wasEnterDown = false;
        this.isGamePaused = false;
        EventBus.emit('current-scene-ready', this);
    }


    resetInactivityTimeout() {
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
        }
        this.inactivityTimeout = setTimeout(() => {
            EventBus.emit('change-scene', 'MainMenu');
            this.inactivityTimeout = null;
        }, 10000);
    }


    spawnBird() {
        if (!this.textures.exists('bird-walk')) return;
        try {
            const fromLeft = Math.random() < 0.5;
            const x = fromLeft ? -50 : this.scale.width + 50;
            const y = -40;
            const bird = this.physics.add.sprite(
                x,
                y,
                "bird-walk"
            ).setScale(fromLeft ? 3 : -3, 3).setDepth(50).setOrigin(0.5);
            (bird.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            bird.play("bird-walk");
            const speed = Phaser.Math.Between(2, 3);
            (bird as any).direction = fromLeft ? 1 : -1;
            (bird as any).speed = speed;
            this.birds.push(bird);
        } catch (e) {
            // Silent fail
        }
    }

    update() {
        // Enter pauzeert/hervat het spel alleen als de game actief is
        if (this.enterKey) {
            if (this.enterKey.isDown && !this.wasEnterDown) {
                this.isGamePaused = !this.isGamePaused;
                console.log('Enter pressed. isGamePaused:', this.isGamePaused);
                if (this.isGamePaused) {
                    this.pauseStartTime = Date.now();
                } else {
                    this.pauseStartTime = null;
                }
            }
            this.wasEnterDown = this.enterKey.isDown;
        }
        // Game-logica alleen uitvoeren als niet gepauzeerd
        if (this.isGamePaused) {
            // Debug: laat weten dat game gepauzeerd is
            // Na 30 seconden op pauze: terug naar MainMenu
            if (this.pauseStartTime && Date.now() - this.pauseStartTime >= 30000) {
                this.scene.start('MainMenu');
                this.isGamePaused = false;
                this.pauseStartTime = null;
            }
            return;
        }
                // Laat de exosfeer-achtergrond direct aansluiten op de bovenkant van de thermosfeer-bg
                if (this.bgExosfeer && this.bgThermosfeer) {
                    this.bgExosfeer.y = this.bgThermosfeer.y - this.bgThermosfeer.displayHeight;
                }
        // Laat de thermosfeer-achtergrond direct aansluiten op de bovenkant van de mesosfeer-bg

        // Houd de container op de juiste plek

        // Scrollsnelheid per sfeer instellen
        const scrollSpeeds = [5, 7, 9, 11, 13]; // Troposfeer, Stratosfeer, Mesosfeer, Thermosfeer, Exosfeer
        // const scrollSpeeds = [50, 50, 50, 50, 50]; // Troposfeer, Stratosfeer, Mesosfeer, Thermosfeer, Exosfeer
        const targetScrollSpeed = scrollSpeeds[this.huidigeSfeerIndex] ?? 15;
        // Vloeiend interpoleren naar de nieuwe snelheid
        this.smoothScrollSpeed += (targetScrollSpeed - this.smoothScrollSpeed) * 0.05;
        this.sfeerOffsetY += this.smoothScrollSpeed;
        for (let i = 0; i < this.sfeerRects.length; i++) {
            const baseY = this.sfeerBaseY[i];
            this.sfeerRects[i].y = baseY + this.sfeerOffsetY;
        }
        // Laat de troposfeer-achtergrond meescrollen met de eerste sfeer
        if (this.bgTroposfeer) {
            this.bgTroposfeer.y = this.sfeerBaseY[0] + this.sfeerOffsetY + this.sfeerHoogtes[0] / 2;
        }
        // Laat de stratosfeer-achtergrond direct aansluiten op de bovenkant van de troposfeer-bg
        if (this.bgStratosfeer && this.bgTroposfeer) {
            this.bgStratosfeer.y = this.bgTroposfeer.y - this.bgTroposfeer.displayHeight;
        }
        // Laat de mesosfeer-achtergrond direct aansluiten op de bovenkant van de stratosfeer-bg
        if (this.bgMesosfeer && this.bgStratosfeer) {
            this.bgMesosfeer.y = this.bgStratosfeer.y - this.bgStratosfeer.displayHeight;
        }
        if (this.bgThermosfeer && this.bgMesosfeer) {
            this.bgThermosfeer.y = this.bgMesosfeer.y - this.bgMesosfeer.displayHeight;
        }
        for (const bird of this.birds) {
            bird.y += this.smoothScrollSpeed;
        }
        const centerScreenY = this.scale.height / 2;
        const centerWorldY = centerScreenY - this.sfeerOffsetY;
        let sfeerIndex = this.sfeerBaseY.length - 1;
        for (let i = 0; i < this.sfeerBaseY.length; i++) {
            const baseCenterY = this.sfeerBaseY[i];
            const hoogte = this.sfeerHoogtes[i];
            const top = baseCenterY - hoogte / 2;
            const bottom = baseCenterY + hoogte / 2;
            if (centerWorldY >= top && centerWorldY < bottom) {
                sfeerIndex = i;
                break;
            }
        }
        if (this.huidigeSfeerIndex !== sfeerIndex) {
            this.huidigeSfeerIndex = sfeerIndex;
            EventBus.emit('update-sfeer', SFEER_LABELS[sfeerIndex].naam);
        }
        EventBus.emit('update-sfeer-index', sfeerIndex);
        const totalHeight = this.sfeerHoogtes.reduce((a, b) => a + b, 0);
        const totalScrollable = totalHeight - this.scale.height;
        const safeTotal = Math.max(1, totalScrollable);
        const scrolled = Math.min(this.sfeerOffsetY, safeTotal);
        const progress = Math.min(Math.max(scrolled / safeTotal, 0), 1);
        EventBus.emit('update-sfeer-progress', progress);
        // Sla de actuele progressie op in window zodat GameOver deze kan tonen
        if (typeof window !== 'undefined') {
            (window as any).sfeerProgress = progress;
        }
        if (progress >= 1) {
            EventBus.emit('gamevictory-ui', this.huidigeSfeerIndex);
            this.scene.pause();
            return;
        }
        if (this.ballonContainer) {
            let rotaryEdge = false;
            let deltaX = 0;
            let sensor1Active = false;
            let sensor2Active = false;
            if (this.rotary && Array.isArray(this.rotary.lastAngles) && Array.isArray(this.rotary.prevAngles)) {
                if (
                    typeof this.rotary.lastAngles[0] === 'number' &&
                    typeof this.rotary.lastAngles[1] === 'number' &&
                    (typeof this.rotary.prevAngles[0] !== 'number' || typeof this.rotary.prevAngles[1] !== 'number')
                ) {
                    this.rotary.prevAngles = [...this.rotary.lastAngles];
                }
                const angles = this.rotary.lastAngles;
                const prevs = this.rotary.prevAngles;
                const threshold = 3;
                if (
                    angles.length >= 2 && prevs.length >= 2 &&
                    typeof angles[0] === 'number' && typeof prevs[0] === 'number' &&
                    typeof angles[1] === 'number' && typeof prevs[1] === 'number'
                ) {
                    if (!this._lastDiffs) this._lastDiffs = [0, 0];
                    const diff1 = angleDiff(angles[0], prevs[0]);
                    const diff2 = angleDiff(angles[1], prevs[1]);
                    // Detecteer edge: rotary net bewogen
                    if ((Math.abs(diff1) > threshold && Math.abs(this._lastRotaryDiffs[0]) <= threshold) ||
                        (Math.abs(diff2) > threshold && Math.abs(this._lastRotaryDiffs[1]) <= threshold)) {
                        rotaryEdge = true;
                    }
                    this._lastRotaryDiffs = [diff1, diff2];
                    if (diff1 !== this._lastDiffs[0] || diff2 !== this._lastDiffs[1]) {
                        this._lastDiffs = [diff1, diff2];
                        sensor1Active = Math.abs(diff1) > threshold;
                        sensor2Active = Math.abs(diff2) > threshold;
                        const activeCount = (sensor1Active ? 1 : 0) + (sensor2Active ? 1 : 0);
                        if (sensor1Active) {
                            EventBus.emit('rotary1-move');
                            if (activeCount === 1) {
                                deltaX += 4;
                            } else {
                                if (diff1 < -threshold) {
                                    deltaX -= 4;
                                }
                                if (diff1 > threshold) {
                                    deltaX += 4;
                                }
                            }
                        }
                        if (sensor2Active) {
                            EventBus.emit('rotary2-move');
                            if (activeCount === 1) {
                                deltaX -= 4;
                            } else {
                                if (diff2 < -threshold) {
                                    deltaX -= 4;
                                }
                                if (diff2 > threshold) {
                                    deltaX += 4;
                                }
                            }
                        }
                    } else {
                        sensor1Active = Math.abs(diff1) > threshold;
                        sensor2Active = Math.abs(diff2) > threshold;
                    }
                }
            }
            // Propellor animatie logica
            // PropellorBlauw: speel altijd 1x af bij nieuwe draai (en alleen dan)
            if (this.propellorBlauw) {
                if (sensor1Active) {
                    if (!this.propellorBlauw.anims.isPlaying) {
                        this.propellorBlauw.play({ key: 'propellor-blauw', repeat: 0 });
                        this.propellorBlauw.once('animationcomplete', () => {
                            if (this.propellorBlauw && this.propellorBlauw.anims.currentAnim && this.propellorBlauw.anims.currentAnim.frames.length > 0) {
                                this.propellorBlauw.anims.pause(this.propellorBlauw.anims.currentAnim.frames[0]);
                            }
                        });
                    }
                } else {
                    if (!this.propellorBlauw.anims.isPlaying && this.propellorBlauw.anims.currentAnim && this.propellorBlauw.anims.currentAnim.frames.length > 0) {
                        this.propellorBlauw.anims.pause(this.propellorBlauw.anims.currentAnim.frames[0]);
                    }
                }
            }
            // PropellorRood: speel altijd 1x af bij nieuwe draai (en alleen dan)
            if (this.propellorRood) {
                if (sensor2Active) {
                    if (!this.propellorRood.anims.isPlaying) {
                        this.propellorRood.play({ key: 'propellor-rood', repeat: 0 });
                        this.propellorRood.once('animationcomplete', () => {
                            if (this.propellorRood && this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
                                this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
                            }
                        });
                    }
                } else {
                    if (!this.propellorRood.anims.isPlaying && this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
                        this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
                    }
                }
            }

            // WindBlauw: speel altijd 1x af bij nieuwe draai (en alleen dan)
            if (sensor1Active) {
                if (!this.windBlauw) {
                    if (this.ballonContainer) {
                        this.windBlauw = this.add.sprite(
                            this.ballonContainer.x + this.propellorOffsetXBlauw + 30,
                            this.ballonContainer.y + this.propellorOffsetY,
                            'wind-blauw'
                        ).setDepth(1002).setScale(0.4);
                        this.windBlauw.play({ key: 'wind-blauw', repeat: 0 });
                        this.windBlauw.once('animationcomplete', () => {
                            if (this.windBlauw) {
                                this.windBlauw.destroy();
                                this.windBlauw = null;
                            }
                        });
                    }
                }
            } else {
                if (this.windBlauw && !this.windBlauw.anims.isPlaying) {
                    this.windBlauw.destroy();
                    this.windBlauw = null;
                }
            }
            // WindRood: speel altijd 1x af bij nieuwe draai (en alleen dan)
            if (sensor2Active) {
                if (!this.windRood) {
                    if (this.ballonContainer) {
                        this.windRood = this.add.sprite(
                            this.ballonContainer.x + this.propellorOffsetXRood - 30,
                            this.ballonContainer.y + this.propellorOffsetY,
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
                }
            } else {
                if (this.windRood && !this.windRood.anims.isPlaying) {
                    this.windRood.destroy();
                    this.windRood = null;
                }
            }
            let leftEdge = false, rightEdge = false;
            if (this.cursors) {
                if (this.cursors.left?.isDown && !this._lastLeftDown) leftEdge = true;
                if (this.cursors.right?.isDown && !this._lastRightDown) rightEdge = true;
                this._lastLeftDown = !!this.cursors.left?.isDown;
                this._lastRightDown = !!this.cursors.right?.isDown;
                if (this.cursors.left?.isDown) deltaX -= 10;
                if (this.cursors.right?.isDown) deltaX += 10;
            }
            if (deltaX !== 0) {
                this.ballonContainer.x += deltaX;
            }
            // if (rotaryEdge || leftEdge || rightEdge) {
            //     this.resetInactivityTimeout();
            // }
            const bounds = this.ballonContainer.getBounds();
            if (bounds.left < 0) this.ballonContainer.x += -bounds.left;
            if (bounds.right > this.scale.width) this.ballonContainer.x -= (bounds.right - this.scale.width);
        }
        // WindBlauw/Rood positie updaten als ze bestaan
        if (this.windBlauw && this.ballonContainer) {
            this.windBlauw.x = this.ballonContainer.x + this.propellorOffsetXBlauw - 50;
            this.windBlauw.y = this.ballonContainer.y + this.propellorOffsetY;
        }
        if (this.windRood && this.ballonContainer) {
            this.windRood.x = this.ballonContainer.x + this.propellorOffsetXRood + 50;
            this.windRood.y = this.ballonContainer.y + this.propellorOffsetY;
        }
        if (this.ballon) {
            for (let i = this.birds.length - 1; i >= 0; i--) {
                const bird = this.birds[i];
                if (!(bird as any).direction) (bird as any).direction = 1;
                const speed = (bird as any).speed || 5;
                const direction = (bird as any).direction;
                bird.x += speed * direction;
                if ((direction === 1 && bird.x > this.scale.width + bird.displayWidth) ||
                    (direction === -1 && bird.x < -bird.displayWidth)) {
                    bird.destroy();
                    this.birds.splice(i, 1);
                    continue;
                }
                if (!this.ballonInvulnerable && this.checkOverlap(bird, this.ballon)) {
                    this.damageBallon();
                    this.ballonInvulnerable = true;
                    this.time.delayedCall(1000, () => {
                        this.ballonInvulnerable = false;
                    });
                    const x = bird.x;
                    const y = bird.y;
                    const parent = bird.parentContainer;
                    bird.destroy();
                    const deadBird = this.physics.add.sprite(x, y, "bird-walk")
                        .setScale(4)
                        .setDepth(50)
                        .setOrigin(0.5);
                    if (parent) parent.add(deadBird);
                    deadBird.play("bird-death");
                    const body = deadBird.body as Phaser.Physics.Arcade.Body;
                    body.setAllowGravity(true);
                    body.setGravityY(800);
                    body.setVelocityY(Phaser.Math.Between(250, 400));
                    body.setVelocityX(Phaser.Math.Between(-50, 50));
                    body.setBounce(0.2);
                    this.time.addEvent({
                        delay: 100,
                        loop: true,
                        callback: () => {
                            if (deadBird && deadBird.y > this.scale.height + 100) {
                                this.tweens.add({
                                    targets: deadBird!,
                                    alpha: 0,
                                    duration: 400,
                                    onComplete: () => deadBird?.destroy(),
                                });
                            }
                        }
                    });
                    this.birds.splice(i, 1);
                }
            }
        }
    }

    shutdown() {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = null;
        EventBus.off('pause-game-scene', this.handlePauseGameScene, this);
        closeRotaryClient();
    }
}