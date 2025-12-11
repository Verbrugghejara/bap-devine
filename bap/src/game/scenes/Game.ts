import { Scene } from 'phaser';
import { getRotaryClient, closeRotaryClient } from '../utils/rotaryClientSingleton';
import { SFEER_LABELS } from '../utils/sfeerLabels';
import { EventBus } from '../EventBus';
import { sfeerProgress } from '../utils/sfeerProgressStore';

// Helper voor hoekverschil
function angleDiff(a: number, b: number): number {
    let diff = a - b;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}

export class Game extends Scene {
    // ==================== PROPERTIES ====================
    
    // Game state
    private gameStartTime: number = 0;
    private gameEndTime: number = 0;
    private countdownDone: boolean = false;
    private isGamePaused: boolean = false;
    private pauseStartTime: number | null = null;
    private isVictorySequence: boolean = false;
    private isBalloonLeaving: boolean = false;
    private isVictorySwiping: boolean = false;
    private lastSfeerIndex: number = 0;

    // Input state
    private rotary: any = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private enterKey: Phaser.Input.Keyboard.Key | null = null;
    private wasEnterDown: boolean = false;
    private wasButtonPressed: boolean = false;
    private _lastLeftDown: boolean = false;
    private _lastRightDown: boolean = false;
    private inactivityTimeout: any = null;

    // Sfeer (atmosphere) layers
    private huidigeSfeerIndex: number = 0;
    private sfeerRects: Phaser.GameObjects.Rectangle[] = [];
    private sfeerBaseY: number[] = [];
    private sfeerHoogtes: number[] = [];
    private sfeerOffsetY: number = 0;
    private smoothScrollSpeed: number = 5;

    // Background images
    private bgTroposfeer: Phaser.GameObjects.Image | null = null;
    private bgStratosfeer: Phaser.GameObjects.Image | null = null;
    private bgMesosfeer: Phaser.GameObjects.Image | null = null;
    private bgThermosfeer: Phaser.GameObjects.Image | null = null;
    private bgExosfeer: Phaser.GameObjects.Image | null = null;

    // Balloon
    private ballon: Phaser.GameObjects.Image | null = null;
    private ballonContainer: Phaser.GameObjects.Container | null = null;
    private ballonHealth: number = 3;
    private ballonInvulnerable: boolean = false;

    // Propellors
    private propellorBlauw: Phaser.GameObjects.Sprite | null;
    private propellorRood: Phaser.GameObjects.Sprite | null;
    private propellorOffsetXBlauw: number = -39;
    private propellorOffsetXRood: number = 39;
    private propellorOffsetY: number = 142;

    // Wind effects
    private windBlauw: Phaser.GameObjects.Sprite | null = null;
    private windRood: Phaser.GameObjects.Sprite | null = null;

    // Obstacles
    private obstacles: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    private obstacleSpawnTimer: Phaser.Time.TimerEvent | null = null;

    // Power-ups
    private powerUps: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    private powerUpsSpawned: Set<string> = new Set();
    private activePowerUp: string | null = null;
    private powerUpEndTime: number = 0;
    private freezeActive: boolean = false;
    private shieldActive: boolean = false;
    private baseScrollSpeed: number = 100;

    // ==================== LIFECYCLE METHODS ====================

    constructor() {
        super('Game');
        EventBus.emit('show-countdown');
        EventBus.on('pause-game-scene', this.handlePauseGameScene, this);
        EventBus.on('resume-game-scene', this.handleResumeGameScene, this);
        EventBus.on('victory-swipe-in', this.handleVictorySwipeIn, this);
    }

    create() {
        this.initializeGameState();
        this.setupPhysics();
        this.createSfeerLayers();
        this.createBackgrounds();
        this.createBalloon();
        this.setupObstacles();
        this.setupInput();
        
        EventBus.emit('current-scene-ready', this);
    }

    update() {
        this.handlePauseInput();
        
        if (this.isGamePaused) {
            this.checkPauseTimeout();
            return;
        }

        if (this.isVictorySequence) {
            this.updateVictorySequence();
            return;
        }

        this.updateScroll();
        this.updateBackgrounds();
        this.updateObstaclePositions();
        this.updateSfeerIndex();
        this.updateProgress();
        this.updateTimer();
        this.updatePowerUpPositions();
        this.checkPowerUpCollection();
        this.updateActivePowerUp();
        this.updateBalloonMovement();
        this.updateWindEffects();
        this.checkObstacleCollisions();
    }

    shutdown() {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = null;
        EventBus.off('pause-game-scene', this.handlePauseGameScene, this);
        EventBus.off('resume-game-scene', this.handleResumeGameScene, this);
        EventBus.off('victory-swipe-in', this.handleVictorySwipeIn, this);
        closeRotaryClient();
    }

    // ==================== INITIALIZATION ====================

    private initializeGameState() {
        this.ballonHealth = 3;
        this.sfeerOffsetY = 0;
        this.huidigeSfeerIndex = 0;
        this.lastSfeerIndex = 0;
        this.isGamePaused = false;
        this.pauseStartTime = null;
        this.countdownDone = false;
        this.isVictorySequence = false;
        this.isBalloonLeaving = false;
        this.powerUps = [];
        this.powerUpsSpawned = new Set();
        this.activePowerUp = null;
        this.powerUpEndTime = 0;
        this.freezeActive = false;
        this.shieldActive = false;
        this.baseScrollSpeed = 100;
        
        sfeerProgress.value = 0;
        EventBus.emit('show-countdown');
        EventBus.emit('show-gameui');
        
        setTimeout(() => {
            this.gameStartTime = Date.now();
            this.countdownDone = true;
            
            // Show initial interlude for troposfeer after a short delay
            setTimeout(() => {
                EventBus.emit('show-interlude', 0);
            }, 1000);
            
            // Spawn initial power-up for troposfeer
            this.checkPowerUpSpawn(0);
        }, 5000);
        
        this.rotary = getRotaryClient();
    }

    private setupPhysics() {
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        this.cameras.main.setBackgroundColor(0x00000000);
    }

    private setupInput() {
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = true;
            this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        }
        
        this.wasEnterDown = false;
        this.wasButtonPressed = false;
    }

    // ==================== SFEER LAYERS ====================

    private createSfeerLayers() {
        const standaardHoogte = this.scale.height;
        this.sfeerHoogtes = [
            standaardHoogte * 3, // troposfeer
            standaardHoogte * 4, // stratosfeer
            standaardHoogte * 5, // mesosfeer
            standaardHoogte * 6, // thermosfeer
            standaardHoogte * 7, // exosfeer
        ];
        
        this.sfeerRects = [];
        this.sfeerBaseY = [];
        
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
            
            rect.setFillStyle(kleurInt, 0);
            rect.width = this.scale.width;
            rect.height = hoogte;
            
            this.sfeerRects.push(rect);
            
            if (i < this.sfeerHoogtes.length - 1) {
                worldY -= (hoogte / 2) + (this.sfeerHoogtes[i + 1] / 2);
            }
        }
        
        this.sfeerOffsetY = 0;
    }

    // ==================== BACKGROUND CREATION ====================

    private createBackgrounds() {
        this.createBackground('bg-troposfeer', 0, (img, scale) => {
            this.bgTroposfeer = img;
            this.bgTroposfeer.y = this.scale.height;
            this.bgTroposfeer.setOrigin(0.5, 1).setDepth(-200).setScale(scale.x, scale.y);
        });

        this.createBackground('bg-stratosfeer', 1, (img, scale) => {
            this.bgStratosfeer = img;
            this.bgStratosfeer.y = 0;
            this.bgStratosfeer.setOrigin(0.5, 1).setDepth(-201).setScale(scale.x, scale.y);
        });

        this.createBackground('bg-mesosfeer', 2, (img, scale) => {
            this.bgMesosfeer = img;
            this.bgMesosfeer.y = 0;
            this.bgMesosfeer.setOrigin(0.5, 1).setDepth(-202).setScale(scale.x, scale.y);
        });

        this.createBackground('bg-thermosfeer', 3, (img, scale) => {
            this.bgThermosfeer = img;
            this.bgThermosfeer.y = 0;
            this.bgThermosfeer.setOrigin(0.5, 1).setDepth(-203).setScale(scale.x, scale.y);
        });

        this.createBackground('bg-exosfeer', 4, (img, scale) => {
            this.bgExosfeer = img;
            this.bgExosfeer.y = 0;
            this.bgExosfeer.setOrigin(0.5, 1).setDepth(-204).setScale(scale.x, scale.y);
        });
    }

    private createBackground(
        textureKey: string, 
        sfeerIndex: number, 
        callback: (img: Phaser.GameObjects.Image, scale: { x: number; y: number }) => void
    ) {
        if (!this.textures.exists(textureKey)) return;

        const img = this.add.image(this.scale.width / 2, 0, textureKey);
        const tex = this.textures.get(textureKey).getSourceImage();
        const bgHoogte = this.sfeerHoogtes[sfeerIndex];
        const scaleX = this.scale.width / tex.width;
        const scaleY = bgHoogte / tex.height;
        
        callback(img, { x: scaleX, y: scaleY });
    }

    // ==================== BALLOON ====================

    private createBalloon() {
        try {
            this.ballon = this.add.image(0, 0, "balloon").setScale(0.54).setDepth(50);

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
    }

    private damageBallon() {
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
            
            // Change balloon texture based on health (only if no power-up is active)
            if (!this.activePowerUp) {
                if (this.ballonHealth === 2 && this.textures.exists('balloon-health2')) {
                    this.ballon.setTexture('balloon-health2');
                } else if (this.ballonHealth === 1 && this.textures.exists('balloon-health1')) {
                    this.ballon.setTexture('balloon-health1');
                }
            }
        }
        
        if (this.ballonHealth <= 0) {
            this.time.delayedCall(1000, () => {
                EventBus.emit('hide-gameui');
                this.scene.start('GameOver');
            });
        }
    }

    // ==================== OBSTACLES ====================

    private setupObstacles() {
        this.obstacles = [];
        this.spawnObstacle();
        
        this.obstacleSpawnTimer = this.time.addEvent({
            delay: this.getObstacleSpawnDelay(),
            loop: true,
            callback: () => {
                this.spawnObstacle();
            }
        });
    }

    private getObstacleSpawnDelay(): number {
        const delays = [
            Phaser.Math.Between(4000, 7000),  // Troposfeer - birds
            Phaser.Math.Between(4000, 7000),  // Stratosfeer - planes
            Phaser.Math.Between(1500, 3000),  // Mesosfeer - meteors
            Phaser.Math.Between(4000, 7000),  // Thermosfeer - satellites
            Phaser.Math.Between(4000, 7000)   // Exosfeer - ufos
        ];
        return delays[this.huidigeSfeerIndex] || 5000;
    }

    private getObstacleConfig() {
        const configs = [
            { texture: 'bird-walk', animKey: 'bird-walk', scale: 1, hasAnimation: true, movementType: 'horizontal' },
            { texture: 'plane-flying', animKey: 'plane-flying', scale: 1, hasAnimation: true, movementType: 'horizontal' },
            { texture: 'meteor-falling', animKey: 'meteor-falling', scale: 1, hasAnimation: true, movementType: 'vertical' },
            { texture: 'sattelite', animKey: 'sattelite-spin', scale: 0.5, hasAnimation: false, movementType: 'horizontal' },
            { texture: 'ufo', animKey: 'ufo-fly', scale: 0.5, hasAnimation: false, movementType: 'horizontal' }
        ];
        return configs[this.huidigeSfeerIndex] || configs[0];
    }

    private spawnObstacle() {
        const config = this.getObstacleConfig();
        if (!this.textures.exists(config.texture)) return;
        
        try {
            let x, y, direction, speed;
            
            // Calculate current sfeer's screen Y position range
            const currentSfeerCenterY = this.sfeerBaseY[this.huidigeSfeerIndex] + this.sfeerOffsetY;
            const currentSfeerHeight = this.sfeerHoogtes[this.huidigeSfeerIndex];
            const currentSfeerTop = currentSfeerCenterY - (currentSfeerHeight / 2);
            const currentSfeerBottom = currentSfeerCenterY + (currentSfeerHeight / 2);
            
            // Only spawn if the top of the screen is within the current sfeer
            if (currentSfeerTop > 0) {
                // We're not yet in a position to spawn obstacles for this sfeer
                return;
            }
            
            if (config.movementType === 'vertical') {
                direction = Math.random() < 0.5 ? 1 : -1; // Random left or right
                // Adjust spawn position based on direction to avoid going off screen
                if (direction === -1) {
                    // Moving left, spawn more to the right
                    x = Phaser.Math.Between(this.scale.width * 0.5, this.scale.width - 100);
                } else {
                    // Moving right, spawn more to the left
                    x = Phaser.Math.Between(100, this.scale.width * 0.5);
                }
                y = -100;
                speed = Phaser.Math.Between(8, 12);
            } else {
                const fromLeft = Math.random() < 0.5;
                x = fromLeft ? -200 : this.scale.width + 200;
                y = -200;
                direction = fromLeft ? 1 : -1;
                speed = Phaser.Math.Between(2, 3);
            }
            
            const obstacle = this.physics.add.sprite(x, y, config.texture)
                .setScale(
                    (config.movementType === 'horizontal' && direction === -1) || (config.movementType === 'vertical' && direction === -1) ? -config.scale : config.scale, 
                    config.scale
                )
                .setDepth(50)
                .setOrigin(0.5);
            
            (obstacle.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            
            if (config.hasAnimation && this.anims.exists(config.animKey)) {
                obstacle.play(config.animKey);
            }
            
            (obstacle as any).direction = direction;
            (obstacle as any).speed = speed;
            (obstacle as any).obstacleType = config.texture;
            (obstacle as any).movementType = config.movementType;
            
            // Add flying animation for birds
            if (config.texture === 'bird-walk') {
                (obstacle as any).flyingOffset = 0;
                (obstacle as any).flyingSpeed = Phaser.Math.Between(2, 4);
            }
            
            this.obstacles.push(obstacle);
        } catch (e) {
            console.error('[Game] Failed to spawn obstacle:', e);
        }
    }

    private checkOverlap(a: any, b: any): boolean {
        if (!a || !b) return false;
        const ab = (a.getBounds) ? a.getBounds() : a.body.getBounds();
        const bb = (b.getBounds) ? b.getBounds() : b.body.getBounds();
        const marginA = 20, marginB = 20;
        const abRect = new Phaser.Geom.Rectangle(ab.x + marginA, ab.y + marginA, ab.width - 2 * marginA, ab.height - 2 * marginA);
        const bbRect = new Phaser.Geom.Rectangle(bb.x + marginB, bb.y + marginB, bb.width - 2 * marginB, bb.height - 2 * marginB);
        return Phaser.Geom.Intersects.RectangleToRectangle(abRect, bbRect);
    }

    // ==================== EVENT HANDLERS ====================

    private handleVictorySwipeIn() {
        if (this.isVictorySwiping) return;
        this.isVictorySwiping = true;
        
        const VICTORY_SWIPE_DURATION = 1400;
        const allGameObjects = [
            this.bgTroposfeer,
            this.bgStratosfeer,
            this.bgMesosfeer,
            this.bgThermosfeer,
            this.bgExosfeer,
            this.ballonContainer,
            ...this.sfeerRects,
            ...this.obstacles
        ].filter(obj => obj !== null);
        
        this.tweens.add({
            targets: allGameObjects,
            y: `+=${this.scale.height}`,
            duration: VICTORY_SWIPE_DURATION,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.isVictorySwiping = false;
                this.isVictorySequence = false;
            }
        });
    }

    private handleResumeGameScene() {
        if (this.isGamePaused) {
            this.isGamePaused = false;
            this.pauseStartTime = null;
            EventBus.emit('hide-pauseui');
        }
    }

    private handlePauseGameScene() {
        if (this.scene.isActive() && !this.scene.isPaused()) {
            this.scene.pause();
        }
    }

    // ==================== INPUT HANDLING ====================

    private handlePauseInput() {
        const buttonPressed = this.rotary?.buttonPressed || false;
        
        if (buttonPressed && !this.wasButtonPressed && this.countdownDone) {
            if (!this.isGamePaused) {
                this.isGamePaused = true;
                this.pauseStartTime = Date.now();
                EventBus.emit('show-pauseui');
            }
        }
        this.wasButtonPressed = buttonPressed;
        
        // Fallback: Enter key voor debugging
        if (this.enterKey) {
            if (this.enterKey.isDown && !this.wasEnterDown) {
                if (!this.isGamePaused) {
                    this.isGamePaused = true;
                    this.pauseStartTime = Date.now();
                    EventBus.emit('show-pauseui');
                }
            }
            this.wasEnterDown = this.enterKey.isDown;
        }
    }

    private checkPauseTimeout() {
        if (this.pauseStartTime && Date.now() - this.pauseStartTime >= 30000) {
            EventBus.emit('hide-pauseui');
            this.scene.start('MainMenu');
            this.isGamePaused = false;
            this.pauseStartTime = null;
        }
    }

    // ==================== UPDATE METHODS ====================

    private updateVictorySequence() {
        if (this.isBalloonLeaving && this.ballonContainer) {
            this.ballonContainer.y -= 12;
            
            if (this.ballonContainer.y + (this.ballon?.height ?? 100) < -50) {
                this.isBalloonLeaving = false;
                this.scene.launch('GameVictory');
                EventBus.emit('victory-swipe-in');
            }
        }
    }

    private updateScroll() {
        const scrollSpeeds = [5, 7, 9, 11, 13];
        // const scrollSpeeds = [200, 200, 200, 200, 200];
        
        // Health-based speed modifier: 3 hearts = 100%, 2 hearts = 85%, 1 heart = 70%
        let healthSpeedModifier = 1.0;
        if (this.ballonHealth === 2) {
            healthSpeedModifier = 0.90;
        } else if (this.ballonHealth === 1) {
            healthSpeedModifier = 0.80;
        }
        
        const targetScrollSpeed = (scrollSpeeds[this.huidigeSfeerIndex] ?? 15) * healthSpeedModifier; // * (this.shieldActive ? 1.5 : 1);
        this.smoothScrollSpeed += (targetScrollSpeed - this.smoothScrollSpeed) * 0.05;
        this.sfeerOffsetY += this.smoothScrollSpeed;
        
        for (let i = 0; i < this.sfeerRects.length; i++) {
            const baseY = this.sfeerBaseY[i];
            this.sfeerRects[i].y = baseY + this.sfeerOffsetY;
        }
    }

    private updateBackgrounds() {
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
            
            // Extend exosfeer upwards if needed
            const cameraTop = this.cameras.main.scrollY;
            const exosfeerTop = this.bgExosfeer.y - this.bgExosfeer.displayHeight;
            if (cameraTop < exosfeerTop) {
                this.bgExosfeer.y = cameraTop + this.bgExosfeer.displayHeight;
            }
        }
    }

    private updateObstaclePositions() {
        for (const obstacle of this.obstacles) {
            obstacle.y += this.smoothScrollSpeed;
        }
    }

    private updateSfeerIndex() {
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
            this.checkPowerUpSpawn(sfeerIndex);
            
            // Show interlude when entering new sfeer (skip first transition and only if countdown is done)
            if (this.countdownDone && sfeerIndex > 0 && sfeerIndex > this.lastSfeerIndex) {
                EventBus.emit('show-interlude', sfeerIndex);
            }
            this.lastSfeerIndex = sfeerIndex;
        }
        EventBus.emit('update-sfeer-index', sfeerIndex);
    }

    private updateProgress() {
        const totalHeight = this.sfeerHoogtes.reduce((a, b) => a + b, 0) - this.scale.height;
        const safeTotal = Math.max(1, totalHeight);
        const scrolled = Math.min(this.sfeerOffsetY, totalHeight);
        const progress = Math.min(Math.max(scrolled / safeTotal, 0), 1);
        
        // Calculate meters: 0m at start, 1000m at top (rounded to nearest meter)
        const metersClimbed = Math.round(progress * 1000);
        
        EventBus.emit('update-sfeer-progress', progress);
        EventBus.emit('update-distance', metersClimbed);
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
            EventBus.emit('hide-gameui');
        }
    }

    private updateTimer() {
        if (!this.countdownDone || this.gameStartTime === 0) return;
        
        const elapsed = Date.now() - this.gameStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        EventBus.emit('update-timer', timeString);
    }

    private updateBalloonMovement() {
        if (!this.ballonContainer) return;
        
        let deltaX = 0;
        let sensor1Active = false;
        let sensor2Active = false;
        
        // Rotary input
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
                        deltaX += 8;
                    } else {
                        if (diff1 < -threshold) deltaX -= 8;
                        if (diff1 > threshold) deltaX += 8;
                    }
                }
                
                if (sensor2Active) {
                    EventBus.emit('rotary2-move');
                    if (activeCount === 1) {
                        deltaX -= 8;
                    } else {
                        if (diff2 < -threshold) deltaX -= 8;
                        if (diff2 > threshold) deltaX += 8;
                    }
                }
                
                this._lastRotaryDiffs = [diff1, diff2];
            }
        }
        
        // Update propellor animations
        this.updatePropellorAnimation(this.propellorBlauw, sensor1Active);
        this.updatePropellorAnimation(this.propellorRood, sensor2Active);
        
        // Update wind effects
        this.updateWindSprite(sensor1Active, sensor2Active);
        
        // Keyboard input (fallback)
        if (this.cursors) {
            if (this.cursors.left?.isDown && !this._lastLeftDown) {}
            if (this.cursors.right?.isDown && !this._lastRightDown) {}
            this._lastLeftDown = !!this.cursors.left?.isDown;
            this._lastRightDown = !!this.cursors.right?.isDown;
            if (this.cursors.left?.isDown) deltaX -= 10;
            if (this.cursors.right?.isDown) deltaX += 10;
        }
        
        // Apply movement
        if (deltaX !== 0) {
            this.ballonContainer.x += deltaX;
        }
        
        // Keep balloon in bounds
        const bounds = this.ballonContainer.getBounds();
        if (bounds.left < 0) this.ballonContainer.x += -bounds.left;
        if (bounds.right > this.scale.width) this.ballonContainer.x -= (bounds.right - this.scale.width);
    }

    private updatePropellorAnimation(propellor: Phaser.GameObjects.Sprite | null, isActive: boolean) {
        if (!propellor) return;
        
        if (isActive) {
            if (!propellor.anims.isPlaying) {
                const animKey = propellor.texture.key === 'propellor-blauw' ? 'propellor-blauw' : 'propellor-rood';
                propellor.play({ key: animKey, repeat: 0 });
                propellor.once('animationcomplete', () => {
                    if (propellor && propellor.anims.currentAnim && propellor.anims.currentAnim.frames.length > 0) {
                        propellor.anims.pause(propellor.anims.currentAnim.frames[0]);
                    }
                });
            }
        } else {
            if (!propellor.anims.isPlaying && propellor.anims.currentAnim && propellor.anims.currentAnim.frames.length > 0) {
                propellor.anims.pause(propellor.anims.currentAnim.frames[0]);
            }
        }
    }

    private updateWindSprite(sensor1Active: boolean, sensor2Active: boolean) {
        if (!this.ballonContainer) return;
        
        // Wind blauw
        if (sensor1Active) {
            if (!this.windBlauw) {
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
        } else {
            if (this.windBlauw && !this.windBlauw.anims.isPlaying) {
                this.windBlauw.destroy();
                this.windBlauw = null;
            }
        }
        
        // Wind rood
        if (sensor2Active) {
            if (!this.windRood) {
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
        } else {
            if (this.windRood && !this.windRood.anims.isPlaying) {
                this.windRood.destroy();
                this.windRood = null;
            }
        }
    }

    private updateWindEffects() {
        if (this.windBlauw && this.ballonContainer) {
            this.windBlauw.x = this.ballonContainer.x + this.propellorOffsetXBlauw - 50;
            this.windBlauw.y = this.ballonContainer.y + this.propellorOffsetY;
        }
        if (this.windRood && this.ballonContainer) {
            this.windRood.x = this.ballonContainer.x + this.propellorOffsetXRood + 50;
            this.windRood.y = this.ballonContainer.y + this.propellorOffsetY;
        }
    }

    private checkObstacleCollisions() {
        if (!this.ballon || !this.ballonContainer) return;
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            const speed = (obstacle as any).speed || 5;
            const direction = (obstacle as any).direction;
            const movementType = (obstacle as any).movementType || 'horizontal';
            
            // Check if obstacle should be frozen
            const distanceToBalloon = Phaser.Math.Distance.Between(
                obstacle.x, obstacle.y,
                this.ballonContainer.x, this.ballonContainer.y
            );
            const shouldFreeze = this.freezeActive && distanceToBalloon < 700;
            
            // const screenMiddleY = this.scale.height / 2;
            // const reachedMiddle = obstacle.y >= screenMiddleY - 50 && obstacle.y <= screenMiddleY + 50;
            // const shouldFreeze = this.freezeActive && reachedMiddle;
            // Update obstacle position only if not frozen
            if (!shouldFreeze) {
                if (movementType === 'vertical') {
                    obstacle.y += speed;
                    // Add horizontal drift for meteors
                    if ((obstacle as any).obstacleType === 'meteor-falling') {
                        obstacle.x += direction * 3;
                    }
                } else {
                    if (!direction) (obstacle as any).direction = 1;
                    obstacle.x += speed * direction;
                    
                    // Add flying animation for birds
                    if ((obstacle as any).obstacleType === 'bird-walk') {
                        (obstacle as any).flyingOffset += (obstacle as any).flyingSpeed * 0.1;
                        obstacle.y += Math.sin((obstacle as any).flyingOffset) * 1.5;
                    }
                }
            } else {
                // Visual feedback for frozen obstacles
                if (!obstacle.getData('frozen')) {
                    // obstacle.setTint(0x88ccff);
                    obstacle.setData('frozen', true);
                    
                    // Change plane texture to frozen version if it's a plane
                    if ((obstacle as any).obstacleType === 'plane-flying' && this.textures.exists('plane-freeze')) {
                        obstacle.setTexture('plane-freeze');
                        obstacle.anims.stop();
                    }
                }
            }
            
            // Remove freeze tint if no longer frozen
            if (!shouldFreeze && obstacle.getData('frozen')) {
                obstacle.clearTint();
                obstacle.setData('frozen', false);
                
                // Change plane back to animated version
                if ((obstacle as any).obstacleType === 'plane-flying' && this.textures.exists('plane-flying')) {
                    obstacle.setTexture('plane-flying');
                    if (this.anims.exists('plane-flying')) {
                        obstacle.play('plane-flying');
                    }
                }
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
            
            // Check collision
            if (!this.ballonInvulnerable && this.checkOverlap(obstacle, this.ballon)) {
                // If shield is active, destroy obstacle but don't damage balloon
                if (this.shieldActive) {
                    const x = obstacle.x;
                    const y = obstacle.y;
                    const parent = obstacle.parentContainer;
                    const obstacleType = (obstacle as any).obstacleType;
                    const obstacleScaleX = obstacle.scaleX;
                    obstacle.destroy();
                    
                    // Play destruction animations without damaging balloon
                    // Bird death animation
                    if (obstacleType === 'bird-walk' && this.textures.exists('bird-walk')) {
                        const xOffset = obstacleScaleX < 0 ? -100 : 100;
                        const deadObstacle = this.physics.add.sprite(x + xOffset, y+100, "bird-walk")
                            .setScale(obstacleScaleX, 1)
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
                    
                    // Meteor breaking animation
                    if (obstacleType === 'meteor-falling' && this.textures.exists('meteor-breaking')) {
                        const breakingMeteor = this.physics.add.sprite(x+30, y+60, 'meteor-breaking')
                            .setScale(1)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(breakingMeteor);
                        
                        const body = breakingMeteor.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(600);
                        body.setVelocityY(Phaser.Math.Between(200, 300));
                        
                        if (this.anims.exists('meteor-breaking')) {
                            breakingMeteor.play('meteor-breaking');
                            breakingMeteor.once('animationcomplete', () => {
                                this.tweens.add({
                                    targets: breakingMeteor,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => breakingMeteor.destroy()
                                });
                            });
                        }
                    }
                    
                    // Plane crashing animation
                    if (obstacleType === 'plane-flying' && this.textures.exists('plane-crashing')) {
                        const xOffset = obstacleScaleX < 0 ? -100 : 100;
                        const crashingPlane = this.physics.add.sprite(x + xOffset, y+170, 'plane-crashing')
                            .setScale(obstacleScaleX, 1)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(crashingPlane);
                        
                        const body = crashingPlane.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(700);
                        body.setVelocityY(Phaser.Math.Between(250, 350));
                        
                        if (this.anims.exists('plane-crashing')) {
                            crashingPlane.play('plane-crashing');
                            crashingPlane.once('animationcomplete', () => {
                                this.tweens.add({
                                    targets: crashingPlane,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => crashingPlane.destroy()
                                });
                            });
                        }
                    }
                    
                    this.obstacles.splice(i, 1);
                } else {
                    // Normal collision - damage balloon
                    this.damageBallon();
                    this.ballonInvulnerable = true;
                    
                    // Camera shake effect
                    this.cameras.main.shake(500, 0.01);
                    
                    this.time.delayedCall(1000, () => {
                        this.ballonInvulnerable = false;
                    });
                    
                    const x = obstacle.x;
                    const y = obstacle.y;
                    const parent = obstacle.parentContainer;
                    const obstacleType = (obstacle as any).obstacleType;
                    const obstacleScaleX = obstacle.scaleX; // Save scale for mirroring
                    obstacle.destroy();
                
                    // Bird death animation
                    if (obstacleType === 'bird-walk' && this.textures.exists('bird-walk')) {
                    // Adjust x offset based on direction (if mirrored, offset should be negative)
                    const xOffset = obstacleScaleX < 0 ? -100 : 100;
                    const deadObstacle = this.physics.add.sprite(x + xOffset, y+100, "bird-walk")
                        .setScale(obstacleScaleX, 1) // Use the same horizontal scale (mirroring) as the original bird
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
                
                // Meteor breaking animation
                if (obstacleType === 'meteor-falling' && this.textures.exists('meteor-breaking')) {
                    const breakingMeteor = this.physics.add.sprite(x+30, y+60, 'meteor-breaking')
                        .setScale(1)
                        .setDepth(50)
                        .setOrigin(0.5);
                    if (parent) parent.add(breakingMeteor);
                    
                    const body = breakingMeteor.body as Phaser.Physics.Arcade.Body;
                    body.setAllowGravity(true);
                    body.setGravityY(600);
                    body.setVelocityY(Phaser.Math.Between(200, 300));
                    
                    if (this.anims.exists('meteor-breaking')) {
                        breakingMeteor.play('meteor-breaking');
                        breakingMeteor.once('animationcomplete', () => {
                            this.tweens.add({
                                targets: breakingMeteor,
                                alpha: 0,
                                duration: 300,
                                onComplete: () => breakingMeteor.destroy()
                            });
                        });
                    }
                }
                
                // Plane crashing animation
                if (obstacleType === 'plane-flying' && this.textures.exists('plane-crashing')) {
                    // Adjust x offset based on direction (if mirrored, offset should be negative)
                    const xOffset = obstacleScaleX < 0 ? -100 : 100;
                    const crashingPlane = this.physics.add.sprite(x + xOffset, y+170, 'plane-crashing')
                        .setScale(obstacleScaleX, 1) // Use the same horizontal scale (mirroring) as the original plane
                        .setDepth(50)
                        .setOrigin(0.5);
                    if (parent) parent.add(crashingPlane);
                    
                    const body = crashingPlane.body as Phaser.Physics.Arcade.Body;
                    body.setAllowGravity(true);
                    body.setGravityY(700);
                    body.setVelocityY(Phaser.Math.Between(250, 350));
                    
                    if (this.anims.exists('plane-crashing')) {
                        crashingPlane.play('plane-crashing');
                        crashingPlane.once('animationcomplete', () => {
                            this.tweens.add({
                                targets: crashingPlane,
                                alpha: 0,
                                duration: 300,
                                onComplete: () => crashingPlane.destroy()
                            });
                        });
                    }
                }
                
                    this.obstacles.splice(i, 1);
                }
            }
        }
    }

    // ==================== POWER-UP SYSTEM ====================

    private checkPowerUpSpawn(sfeerIndex: number) {
        const powerUpConfigs = [
            { sfeer: 0, type: 'timer', key: 'timer-troposfeer' },
            { sfeer: 1, type: 'freeze', key: 'freeze-stratosfeer' },
            { sfeer: 2, type: 'health', key: 'health-mesosfeer' },
            { sfeer: 2, type: 'timer', key: 'timer-mesosfeer' },
            { sfeer: 3, type: 'shield', key: 'shield-thermosfeer' },
            { sfeer: 4, type: 'timer', key: 'timer-exosfeer' }
        ];

        for (const config of powerUpConfigs) {
            if (config.sfeer === sfeerIndex && !this.powerUpsSpawned.has(config.key)) {
                this.spawnPowerUp(config.type, config.key, sfeerIndex);
                this.powerUpsSpawned.add(config.key);
            }
        }
    }

    private spawnPowerUp(type: string, uniqueKey: string, sfeerIndex: number) {
        const textureMap: { [key: string]: string } = {
            'health': 'heart-outline',
            'freeze': 'freeze-outline',
            'shield': 'shield-outline',
            'timer': 'time-outline'
        };

        const texture = textureMap[type];
        
        if (!this.textures.exists(texture)) {
            return;
        }

        // Calculate spawn position based on sfeer's actual position and height
        const x = Phaser.Math.Between(150, this.scale.width - 150);
        const sfeerCenterY = this.sfeerBaseY[sfeerIndex] + this.sfeerOffsetY;
        const sfeerHeight = this.sfeerHoogtes[sfeerIndex];
        
        // Spawn in upper 30-60% of the sfeer (random position)
        const minOffset = sfeerHeight * 0.3;
        const maxOffset = sfeerHeight * 0.6;
        const randomOffset = Phaser.Math.Between(minOffset, maxOffset);
        const y = sfeerCenterY - (sfeerHeight / 2) + randomOffset;

        try {
            const powerUp = this.physics.add.sprite(x, y, texture)
                .setScale(1.5)
                .setDepth(100)
                .setOrigin(0.5);

            (powerUp.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            (powerUp as any).powerUpType = type;
            (powerUp as any).uniqueKey = uniqueKey;
            (powerUp as any).baseY = y; // Store base Y position for bobbing animation
            (powerUp as any).bobOffset = 0; // Current bob offset

            this.powerUps.push(powerUp);
            
            // Add glow effect
            this.tweens.add({
                targets: powerUp,
                alpha: 0.7,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } catch (e) {
            console.error('[Game] Failed to spawn power-up:', e);
        }
    }

    private updatePowerUpPositions() {
        const time = this.time.now;
        
        for (const powerUp of this.powerUps) {
            // Update base Y with scroll
            (powerUp as any).baseY += this.smoothScrollSpeed;
            
            // Calculate bob offset (sine wave for smooth up/down motion)
            (powerUp as any).bobOffset = Math.sin(time * 0.003) * 20;
            
            // Apply both base position and bob offset
            powerUp.y = (powerUp as any).baseY + (powerUp as any).bobOffset;
        }

        // Remove power-ups that are off screen
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            if ((this.powerUps[i] as any).baseY > this.scale.height + 200) {
                this.powerUps[i].destroy();
                this.powerUps.splice(i, 1);
            }
        }
    }

    private checkPowerUpCollection() {
        if (!this.ballon) return;

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.checkOverlap(powerUp, this.ballon)) {
                const type = (powerUp as any).powerUpType;
                this.activatePowerUp(type);
                
                // Visual feedback
                this.tweens.add({
                    targets: powerUp,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => powerUp.destroy()
                });
                
                this.powerUps.splice(i, 1);
            }
        }
    }

    private activatePowerUp(type: string) {
        switch (type) {
            case 'health':
                if (this.ballonHealth < 3) {
                    this.ballonHealth++;
                    EventBus.emit('update-health', this.ballonHealth);
                    
                    // Update balloon texture based on new health (if no other power-up is active)
                    if (this.ballon && !this.activePowerUp) {
                        if (this.ballonHealth === 3 && this.textures.exists('balloon')) {
                            this.ballon.setTexture('balloon');
                        } else if (this.ballonHealth === 2 && this.textures.exists('balloon-health2')) {
                            this.ballon.setTexture('balloon-health2');
                        }
                    }
                }
                break;

            case 'freeze':
                this.freezeActive = true;
                this.activePowerUp = 'freeze';
                this.powerUpEndTime = Date.now() + 15000; // 10 seconds
                EventBus.emit('update-powerup', 'freeze');
                
                // Change balloon to freeze version
                if (this.ballon && this.textures.exists('balloon-freeze')) {
                    this.ballon.setTexture('balloon-freeze');
                }
                break;

            case 'shield':
                this.shieldActive = true;
                this.activePowerUp = 'shield';
                this.powerUpEndTime = Date.now() + 15000; // 10 seconds
                EventBus.emit('update-powerup', 'shield');
                
                // Change balloon to shield version
                if (this.ballon && this.textures.exists('balloon-shield')) {
                    this.ballon.setTexture('balloon-shield');
                }
                break;

            case 'timer':
                // Subtract 10 seconds from elapsed time
                this.gameStartTime += 10000;
                EventBus.emit('timer-update', '-10s');
                break;
        }
    }

    private updateActivePowerUp() {
        if (this.activePowerUp && Date.now() >= this.powerUpEndTime) {
            if (this.activePowerUp === 'freeze') {
                this.freezeActive = false;
                // Change balloon back based on health
                if (this.ballon && this.textures.exists('balloon')) {
                    if (this.ballonHealth === 3) {
                        this.ballon.setTexture('balloon');
                    } else if (this.ballonHealth === 2 && this.textures.exists('balloon-health2')) {
                        this.ballon.setTexture('balloon-health2');
                    } else if (this.ballonHealth === 1 && this.textures.exists('balloon-health1')) {
                        this.ballon.setTexture('balloon-health1');
                    }
                }
            } else if (this.activePowerUp === 'shield') {
                this.shieldActive = false;
                // Change balloon back based on health
                if (this.ballon && this.textures.exists('balloon')) {
                    if (this.ballonHealth === 3) {
                        this.ballon.setTexture('balloon');
                    } else if (this.ballonHealth === 2 && this.textures.exists('balloon-health2')) {
                        this.ballon.setTexture('balloon-health2');
                    } else if (this.ballonHealth === 1 && this.textures.exists('balloon-health1')) {
                        this.ballon.setTexture('balloon-health1');
                    }
                }
            }
            
            this.activePowerUp = null;
            EventBus.emit('update-powerup', null);
        }
    }
}
