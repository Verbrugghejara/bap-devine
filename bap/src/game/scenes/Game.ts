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
    obstacles: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    obstacleSpawnTimer: Phaser.Time.TimerEvent | null = null;
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
        this.obstacles = [];
        this.spawnObstacle();
        this.obstacleSpawnTimer = this.time.addEvent({
            delay: this.getObstacleSpawnDelay(),
            loop: true,
            callback: () => {
                this.spawnObstacle();
                // Update spawn delay based on current sfeer
                if (this.obstacleSpawnTimer) {
                    this.obstacleSpawnTimer.delay = this.getObstacleSpawnDelay();
                }
            }
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


    getObstacleSpawnDelay() {
        // Meteors spawn faster than other obstacles
        const delays = [
            Phaser.Math.Between(4000, 7000),  // Troposfeer - birds
            Phaser.Math.Between(4000, 7000),  // Stratosfeer - planes
            Phaser.Math.Between(1500, 3000),  // Mesosfeer - meteors (faster!)
            Phaser.Math.Between(4000, 7000),  // Thermosfeer - satellites
            Phaser.Math.Between(4000, 7000)   // Exosfeer - ufos
        ];
        return delays[this.huidigeSfeerIndex] || 5000;
    }

    getObstacleConfig() {
        // Returns config based on current sfeer: { texture, animKey, scale, hasAnimation, movementType }
        const configs = [
            { texture: 'bird-walk', animKey: 'bird-walk', scale: 3, hasAnimation: true, movementType: 'horizontal' },      // Troposfeer
            { texture: 'plane', animKey: 'plane-fly', scale: 0.5, hasAnimation: false, movementType: 'horizontal' },       // Stratosfeer
            { texture: 'meteor', animKey: 'meteor-spin', scale: 0.5, hasAnimation: false, movementType: 'vertical' },      // Mesosfeer
            { texture: 'sattelite', animKey: 'sattelite-spin', scale: 0.5, hasAnimation: false, movementType: 'horizontal' },// Thermosfeer
            { texture: 'ufo', animKey: 'ufo-fly', scale: 0.5, hasAnimation: false, movementType: 'horizontal' }            // Exosfeer
        ];
        return configs[this.huidigeSfeerIndex] || configs[0];
    }

    spawnObstacle() {
        const config = this.getObstacleConfig();
        if (!this.textures.exists(config.texture)) return;
        
        try {
            let x, y, direction, speed;
            
            if (config.movementType === 'vertical') {
                // Meteors spawn from top and fall down
                x = Phaser.Math.Between(50, this.scale.width - 50);
                y = -100;
                direction = 0; // No horizontal direction
                speed = Phaser.Math.Between(8, 12); // Faster falling speed
            } else {
                // Horizontal movement (birds, planes, satellites, ufos)
                const fromLeft = Math.random() < 0.5;
                x = fromLeft ? -50 : this.scale.width + 50;
                y = -40;
                direction = fromLeft ? 1 : -1;
                speed = Phaser.Math.Between(2, 3);
            }
            
            const obstacle = this.physics.add.sprite(
                x,
                y,
                config.texture
            ).setScale(config.movementType === 'horizontal' && direction === -1 ? -config.scale : config.scale, config.scale)
             .setDepth(50)
             .setOrigin(0.5);
            
            (obstacle.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            
            // Play animation if it exists and is configured
            if (config.hasAnimation && this.anims.exists(config.animKey)) {
                obstacle.play(config.animKey);
            }
            
            (obstacle as any).direction = direction;
            (obstacle as any).speed = speed;
            (obstacle as any).obstacleType = config.texture;
            (obstacle as any).movementType = config.movementType;
            
            this.obstacles.push(obstacle);
        } catch (e) {
            console.error('[Game] Failed to spawn obstacle:', e);
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

        const scrollSpeeds = [5, 7, 9, 11, 13]; // Troposfeer, Stratosfeer, Mesosfeer, Thermosfeer, Exosfeer
        // const scrollSpeeds = [50, 50, 50, 50, 50]; // Troposfeer, Stratosfeer, Mesosfeer, Thermosfeer, Exosfeer
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
        for (const obstacle of this.obstacles) {
            obstacle.y += this.smoothScrollSpeed;
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
                    
                    sensor1Active = Math.abs(diff1) > threshold;
                    sensor2Active = Math.abs(diff2) > threshold;
                    
                    const activeCount = (sensor1Active ? 1 : 0) + (sensor2Active ? 1 : 0);
                    if (sensor1Active) {
                        EventBus.emit('rotary1-move');
                        if (activeCount === 1) {
                            deltaX += 8; // Verhoogd van 4 naar 8
                        } else {
                            if (diff1 < -threshold) {
                                deltaX -= 8; // Verhoogd van 4 naar 8
                            }
                            if (diff1 > threshold) {
                                deltaX += 8; // Verhoogd van 4 naar 8
                            }
                        }
                    }
                    if (sensor2Active) {
                        EventBus.emit('rotary2-move');
                        if (activeCount === 1) {
                            deltaX -= 8; // Verhoogd van 4 naar 8
                        } else {
                            if (diff2 < -threshold) {
                                deltaX -= 8; // Verhoogd van 4 naar 8
                            }
                            if (diff2 > threshold) {
                                deltaX += 8; // Verhoogd van 4 naar 8
                            }
                        }
                    }
                    
                    this._lastRotaryDiffs = [diff1, diff2];
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
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obstacle = this.obstacles[i];
                const speed = (obstacle as any).speed || 5;
                const direction = (obstacle as any).direction;
                const movementType = (obstacle as any).movementType || 'horizontal';
                
                // Update position based on movement type
                if (movementType === 'vertical') {
                    // Meteors fall down (no scrollSpeed compensation needed as they already move with scene)
                    obstacle.y += speed;
                } else {
                    // Horizontal movement
                    if (!direction) (obstacle as any).direction = 1;
                    obstacle.x += speed * direction;
                }
                
                // Remove if off screen
                if (movementType === 'vertical') {
                    if (obstacle.y > this.scale.height + obstacle.displayHeight + 100) {
                        obstacle.destroy();
                        this.obstacles.splice(i, 1);
                        continue;
                    }
                } else {
                    if ((direction === 1 && obstacle.x > this.scale.width + obstacle.displayWidth) ||
                        (direction === -1 && obstacle.x < -obstacle.displayWidth)) {
                        obstacle.destroy();
                        this.obstacles.splice(i, 1);
                        continue;
                    }
                }
                
                // Check collision with balloon
                if (!this.ballonInvulnerable && this.checkOverlap(obstacle, this.ballon)) {
                    this.damageBallon();
                    this.ballonInvulnerable = true;
                    this.time.delayedCall(1000, () => {
                        this.ballonInvulnerable = false;
                    });
                    
                    const x = obstacle.x;
                    const y = obstacle.y;
                    const parent = obstacle.parentContainer;
                    const obstacleType = (obstacle as any).obstacleType;
                    obstacle.destroy();
                    
                    // Only do death animation for birds (other obstacles just disappear)
                    if (obstacleType === 'bird-walk' && this.textures.exists('bird-walk')) {
                        const deadObstacle = this.physics.add.sprite(x, y, "bird-walk")
                            .setScale(4)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(deadObstacle);
                        
                        if (this.anims.exists('bird-death')) {
                            deadObstacle.play("bird-death");
                        }
                        
                        const body = deadObstacle.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(800);
                        body.setVelocityY(Phaser.Math.Between(250, 400));
                        body.setVelocityX(Phaser.Math.Between(-50, 50));
                        body.setBounce(0.2);
                        
                        this.time.addEvent({
                            delay: 100,
                            loop: true,
                            callback: () => {
                                if (deadObstacle && deadObstacle.y > this.scale.height + 100) {
                                    this.tweens.add({
                                        targets: deadObstacle!,
                                        alpha: 0,
                                        duration: 400,
                                        onComplete: () => deadObstacle?.destroy(),
                                    });
                                }
                            }
                        });
                    }
                    
                    this.obstacles.splice(i, 1);
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