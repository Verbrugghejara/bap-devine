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
import { sfeerProgress } from '../utils/sfeerProgressStore';

export class Game extends Scene {
            private isVictorySwiping: boolean = false;
        private gameStartTime: number = 0;
        private gameEndTime: number = 0;
        private countdownDone: boolean = false;
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
    private pauseStartTime: number | null = null;

    private isVictorySequence: boolean = false;
    private isBalloonLeaving: boolean = false;

    constructor() {
        super('Game');
        EventBus.emit('show-countdown');
        EventBus.on('pause-game-scene', this.handlePauseGameScene, this);
        EventBus.on('resume-game-scene', this.handleResumeGameScene, this);
        EventBus.on('victory-swipe-in', () => this.handleVictorySwipeIn());
        
    }

    handleVictorySwipeIn() {
        if (this.isVictorySwiping) return;
        this.isVictorySwiping = true;
        const swipeDistance = this.scale.height - 25;
        const camera = this.cameras.main;
        const startY = camera.scrollY;
        const targetY = startY + swipeDistance; // Scroll naar beneden (positieve richting)
        const VICTORY_SWIPE_DURATION = 1400;
        const duration = VICTORY_SWIPE_DURATION;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            camera.scrollY = startY + (targetY - startY) * ease;
            console.log('camera.scrollY', camera.scrollY);
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isVictorySwiping = false;
            }
        };
        animate();
    }

    handleResumeGameScene() {
        if (this.isGamePaused) {
            this.isGamePaused = false;
            this.pauseStartTime = null;
            EventBus.emit('hide-pauseui');
        }
    }

    handlePauseGameScene() {
        if (this.scene.isActive() && !this.scene.isPaused()) {
            this.scene.pause();
        }
    }



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
        if (this.ballonHealth <= 0) {
            this.time.delayedCall(1000, () => {
                EventBus.emit('hide-gameui'); // Laat GameUI verdwijnen
                this.scene.start('GameOver');
            });
        }
    }


    create() {
        this.ballonHealth = 3;
        this.sfeerOffsetY = 0;
        this.huidigeSfeerIndex = 0;
        this.isGamePaused = false;
        this.pauseStartTime = null;
        this.countdownDone = false;
        this.isVictorySequence = false;
        this.isBalloonLeaving = false;
        
        sfeerProgress.value = 0;
        EventBus.emit('show-countdown');
        EventBus.emit('show-gameui');
        setTimeout(() => {
            console.log('start timer');
            this.gameStartTime = Date.now();
            this.countdownDone = true;
        }, 5000);
        this.rotary = getRotaryClient();
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        this.cameras.main.setBackgroundColor(0x00000000);
        const standaardHoogte = this.scale.height;
        this.sfeerHoogtes = [
            standaardHoogte * 3, // troposfeer (3 schermhoogtes)
            standaardHoogte * 4, // stratosfeer (4 schermhoogtes)
            standaardHoogte * 5, // mesosfeer (5 schermhoogtes)
            standaardHoogte * 6, // thermosfeer (6 schermhoogtes)
            standaardHoogte * 7, // exosfeer (7 schermhoogtes)
        ];
        
        // Maak atmosphere layer rectangles
        this.sfeerRects = [];
        this.sfeerBaseY = [];
        
        // Create background images with correct heights
        const bgHoogte = this.sfeerHoogtes[0];
        if (this.textures.exists('bg-troposfeer')) {
            this.bgTroposfeer = this.add.image(
                this.scale.width / 2,
                this.scale.height,
                'bg-troposfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-200);
            const tex = this.textures.get('bg-troposfeer').getSourceImage();
            const scaleY = bgHoogte / tex.height;
            this.bgTroposfeer.setScale(this.scale.width / tex.width, scaleY);

            console.log("[Game] Troposfeer achtergrond toegevoegd.");
        } else {
            this.bgTroposfeer = null;
        }
        const bgHoogteStratosfeer = this.sfeerHoogtes[1];
        if (this.textures.exists('bg-stratosfeer')) {
            this.bgStratosfeer = this.add.image(
                this.scale.width / 2,
                0, 
                'bg-stratosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-201); 
            const texS = this.textures.get('bg-stratosfeer').getSourceImage();
            const scaleYS = bgHoogteStratosfeer / texS.height;
            this.bgStratosfeer.setScale(this.scale.width / texS.width, scaleYS);
            console.log("[Game] Stratosfeer achtergrond toegevoegd.");
        } else {
            this.bgStratosfeer = null;
        }

        const bgHoogteMesosfeer = this.sfeerHoogtes[2];
        if (this.textures.exists('bg-mesosfeer')) {
            this.bgMesosfeer = this.add.image(
                this.scale.width / 2,
                0, 
                'bg-mesosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-202);
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
                0, 
                'bg-thermosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-203); 
            const texT = this.textures.get('bg-thermosfeer').getSourceImage();
            const scaleYT = bgHoogteThermosfeer / texT.height;
            this.bgThermosfeer.setScale(this.scale.width / texT.width, scaleYT);
            console.log("[Game] Thermosfeer achtergrond toegevoegd.");
        } else {
            this.bgThermosfeer = null;
        }
        
        const bgHoogteExosfeer = this.sfeerHoogtes[4];
        if (this.textures.exists('bg-exosfeer')) {
            this.bgExosfeer = this.add.image(
                this.scale.width / 2,
                0,
                'bg-exosfeer'
            ).setOrigin(0.5, 1)
                .setDepth(-204);
            const texE = this.textures.get('bg-exosfeer').getSourceImage();
            const scaleYE = bgHoogteExosfeer / texE.height;
            this.bgExosfeer.setScale(this.scale.width / texE.width, scaleYE);
            console.log("[Game] Exosfeer achtergrond toegevoegd.");
        } else {
            this.bgExosfeer = null;
        }
        
        let worldY = this.scale.height - this.sfeerHoogtes[0] / 2;
        for (let i = 0; i < this.sfeerHoogtes.length; i++) {
            const hoogte = this.sfeerHoogtes[i];
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
            this.ballon = this.add.sprite(
                0,
                0,
                "balloon"
            ).setScale(0.5).setDepth(50);
            this.propellorBlauw = this.add.sprite(
                this.propellorOffsetXBlauw,
                this.propellorOffsetY,
                'propellor-blauw'
            ).setScale(0.5).setDepth(1002);
            if (this.anims.exists('propellor-blauw')) {
                this.propellorBlauw.setFrame(0);
                this.propellorBlauw.anims.stop();
            }
            this.propellorRood = this.add.sprite(
                this.propellorOffsetXRood,
                this.propellorOffsetY,
                'propellor-rood'
            ).setScale(0.5).setDepth(1002);
            if (this.anims.exists('propellor-rood')) {
                this.propellorRood.setFrame(0);
                this.propellorRood.anims.stop();
            }
            this.windBlauw = null;
            this.windRood = null;
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
        }
    }

    update() {
        if (this.enterKey) {
            if (this.enterKey.isDown && !this.wasEnterDown) {
                if (!this.isGamePaused) {
                    this.isGamePaused = true;
                    console.log('Enter pressed. isGamePaused:', this.isGamePaused);
                    this.pauseStartTime = Date.now();
                    EventBus.emit('show-pauseui');
                } else {
                    console.log('Enter pressed, maar game is al gepauzeerd.');
                }
            }
            this.wasEnterDown = this.enterKey.isDown;
        }
        if (this.isGamePaused) {
            if (this.pauseStartTime && Date.now() - this.pauseStartTime >= 30000) {
                console.log('30 seconden pauze verstreken, terug naar MainMenu');
                EventBus.emit('hide-pauseui');
                this.scene.start('MainMenu');
                this.isGamePaused = false;
                this.pauseStartTime = null;
            }
            return;
        }

        if (this.isVictorySequence) {
            if (this.isBalloonLeaving && this.ballonContainer) {
                this.ballonContainer.y -= 12;
                
                if (this.ballonContainer.y + (this.ballon?.height ?? 100) < -50) {
                    // Ballon is uit beeld, start nu de scroll animatie
                    this.isBalloonLeaving = false;
                    
                    // Launch GameVictory scene eerst
                    this.scene.launch('GameVictory');
                    
                    // Start beide swipes direct tegelijk zonder timeout
                    EventBus.emit('victory-swipe-in'); // Start GameVictory swipe
                    
                    // Start ook de game scene camera scroll naar beneden
                    const scrollDuration = 1400; // Zelfde timing als GameVictory swipe
                    const camera = this.cameras.main;
                    const cameraStartY = camera.scrollY;
                    const cameraTargetY = cameraStartY - (this.scale.height - 25); // Negatief = scene gaat naar beneden
                    
                    this.tweens.add({
                        targets: camera,
                        scrollY: cameraTargetY,
                        duration: scrollDuration,
                        ease: 'Cubic.easeOut',
                        onUpdate: () => {
                            // Update background positions tijdens scroll
                            if (this.bgTroposfeer) {
                                this.bgTroposfeer.y = this.scale.height + this.sfeerOffsetY;
                            }
                            if (this.bgStratosfeer && this.bgTroposfeer) {
                                this.bgStratosfeer.y = this.bgTroposfeer.y - this.bgTroposfeer.displayHeight;
                            }
                            if (this.bgMesosfeer && this.bgStratosfeer) {
                                this.bgMesosfeer.y = this.bgStratosfeer.y - this.bgStratosfeer.displayHeight;
                            }
                            if (this.bgThermosfeer && this.bgMesosfeer) {
                                this.bgThermosfeer.y = this.bgMesosfeer.y - this.bgMesosfeer.displayHeight;
                            }
                            if (this.bgExosfeer && this.bgThermosfeer) {
                                this.bgExosfeer.y = this.bgThermosfeer.y - this.bgThermosfeer.displayHeight;
                            }
                        },
                        onComplete: () => {
                            this.isVictorySequence = false;
                            EventBus.emit('hide-gameui');
                        }
                    });
                }
            }
            return;
        }

        // const scrollSpeeds = [5, 7, 9, 11, 13]; // Troposfeer, Stratosfeer, Mesosfeer, Thermosfeer, Exosfeer
        const scrollSpeeds = [50, 50, 50, 50, 50]; // Troposfeer, Stratosfeer, Mesosfeer, Thermosfeer, Exosfeer
        const targetScrollSpeed = scrollSpeeds[this.huidigeSfeerIndex] ?? 15;
        this.smoothScrollSpeed += (targetScrollSpeed - this.smoothScrollSpeed) * 0.05;
        this.sfeerOffsetY += this.smoothScrollSpeed;
        for (let i = 0; i < this.sfeerRects.length; i++) {
            const baseY = this.sfeerBaseY[i];
            this.sfeerRects[i].y = baseY + this.sfeerOffsetY;
        }
        
        // Update background positions - chain them all together
        if (this.bgTroposfeer) {
            this.bgTroposfeer.y = this.scale.height + this.sfeerOffsetY;
        }
        if (this.bgStratosfeer && this.bgTroposfeer) {
            this.bgStratosfeer.y = this.bgTroposfeer.y - this.bgTroposfeer.displayHeight;
        }
        if (this.bgMesosfeer && this.bgStratosfeer) {
            this.bgMesosfeer.y = this.bgStratosfeer.y - this.bgStratosfeer.displayHeight;
        }
        if (this.bgThermosfeer && this.bgMesosfeer) {
            this.bgThermosfeer.y = this.bgMesosfeer.y - this.bgMesosfeer.displayHeight;
        }
        if (this.bgExosfeer && this.bgThermosfeer) {
            this.bgExosfeer.y = this.bgThermosfeer.y - this.bgThermosfeer.displayHeight;
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
        
        // Bereken totale hoogte van alle lagen minus 1 schermhoogte
        const totalHeight = this.sfeerHoogtes.reduce((a, b) => a + b, 0) - this.scale.height -75;
        const safeTotal = Math.max(1, totalHeight);
        const scrolled = Math.min(this.sfeerOffsetY, totalHeight);
        const progress = Math.min(Math.max(scrolled / safeTotal, 0), 1);
        EventBus.emit('update-sfeer-progress', progress);
        if (typeof window !== 'undefined') {
            (window as any).sfeerProgress = progress;
        }
        if (progress >= 1 && this.countdownDone && !this.isVictorySequence) {
            this.gameEndTime = Date.now();
            const duration = this.gameEndTime - this.gameStartTime;
            if (typeof window !== 'undefined') {
                if ((window as any).gameDurationMs === undefined) {
                    (window as any).gameDurationMs = duration;
                }
            }
            this.isVictorySequence = true;
            this.isBalloonLeaving = true;
        }
        if (this.ballonContainer) {
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
                    const diff1 = angleDiff(angles[0], prevs[0]);
                    const diff2 = angleDiff(angles[1], prevs[1]);
                    this._lastRotaryDiffs = [diff1, diff2];
                    if (diff1 !== this._lastRotaryDiffs[0] || diff2 !== this._lastRotaryDiffs[1]) {
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
            
            if (this.cursors) {
                if (this.cursors.left?.isDown && !this._lastLeftDown) {
                    // Left edge detected
                }
                if (this.cursors.right?.isDown && !this._lastRightDown) {
                    // Right edge detected
                }
                this._lastLeftDown = !!this.cursors.left?.isDown;
                this._lastRightDown = !!this.cursors.right?.isDown;
                if (this.cursors.left?.isDown) deltaX -= 10;
                if (this.cursors.right?.isDown) deltaX += 10;
            }
            if (deltaX !== 0) {
                this.ballonContainer.x += deltaX;
            }
            const bounds = this.ballonContainer.getBounds();
            if (bounds.left < 0) this.ballonContainer.x += -bounds.left;
            if (bounds.right > this.scale.width) this.ballonContainer.x -= (bounds.right - this.scale.width);
        }
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