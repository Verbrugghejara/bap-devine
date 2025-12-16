import { Scene } from 'phaser';
import { getRotaryClient, closeRotaryClient } from '../utils/rotaryClientSingleton';
import { SFEER_LABELS } from '../utils/sfeerLabels';
import { EventBus } from '../EventBus';
import { sfeerProgress } from '../utils/sfeerProgressStore';

// Helper voor hoekverschil

// ==================== UTILITIES ====================
function angleDiff(a: number, b: number): number {
    let diff = a - b;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}


export class Game extends Scene {
            private hasPlayedVictoryCheer: boolean = false;
        private hasPlayedScream: boolean = false;
        private troposfeerSound: Phaser.Sound.BaseSound | null = null;
        private stratosfeerSound: Phaser.Sound.BaseSound | null = null;
        private spaceSound: Phaser.Sound.BaseSound | null = null;
    // ==================== PROPERTIES ====================
    // --- Game State ---
    private gameStartTime: number = 0;
    private gameEndTime: number = 0;
    private countdownDone: boolean = false;
    private isGamePaused: boolean = false;
    private pauseStartTime: number | null = null;
    private isVictorySequence: boolean = false;
    private isBalloonLeaving: boolean = false;
    private isVictorySwiping: boolean = false;
    private isGameOverSwiping: boolean = false;
    private lastSfeerIndex: number = 0;

    // --- Input State ---
    private rotary: any = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private enterKey: Phaser.Input.Keyboard.Key | null = null;
    private wasEnterDown: boolean = false;
    private wasButtonPressed: boolean = false;
    private inactivityTimeout: any = null;
    private _lastRotaryDiffs: number[] = [0, 0];

    // --- Sfeer Layers ---
    private huidigeSfeerIndex: number = 0;
    private sfeerRects: Phaser.GameObjects.Rectangle[] = [];
    private sfeerBaseY: number[] = [];
    private sfeerHoogtes: number[] = [];
    private sfeerOffsetY: number = 0;
    private smoothScrollSpeed: number = 5;

    // --- Backgrounds ---
    private bgTroposfeer: Phaser.GameObjects.Image | null = null;
    private bgStratosfeer: Phaser.GameObjects.Image | null = null;
    private bgMesosfeer: Phaser.GameObjects.Image | null = null;
    private bgThermosfeer: Phaser.GameObjects.Image | null = null;
    private bgExosfeer: Phaser.GameObjects.Image | null = null;

    // --- Balloon ---
    private ballon: Phaser.GameObjects.Image | null = null;
    private ballonContainer: Phaser.GameObjects.Container | null = null;
    private ballonHealth: number = 3;
    private ballonInvulnerable: boolean = false;

    // --- Propellors ---
    private propellorBlauw: Phaser.GameObjects.Sprite | null;
    private propellorRood: Phaser.GameObjects.Sprite | null;
    private propellorOffsetXBlauw: number = -39;
    private propellorOffsetXRood: number = 39;
    private propellorOffsetY: number = 142;

    // --- Wind Effects ---
    private windBlauw: Phaser.GameObjects.Sprite | null = null;
    private windRood: Phaser.GameObjects.Sprite | null = null;
    private _windIsTilted: boolean = false;

    // --- Obstacles ---
    private obstacles: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    private lastObstacleSides: { [key: string]: number[] } = {};
    private obstacleSpawnTimer: Phaser.Time.TimerEvent | null = null;
    private firstMeteorSpawned: boolean = false;
    private wasNearObstacle: boolean = false;

    // --- Power-ups ---
    // powerUpContainer verwijderd, alleen powerUps array wordt gebruikt
    private powerUps: Phaser.GameObjects.Container[] = [];
    private powerUpsSpawned: Set<string> = new Set();
    private activePowerUp: string | null = null;
    private powerUpEndTime: number = 0;
    private freezeActive: boolean = false;
    private shieldActive: boolean = false;


    // --- Aliens ---

    private aliens: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    private alienConfigs = [
        { key: 'alien-tropo', sfeer: 0, x: 540, y: 5365, scale: 1 },
        { key: 'alien-strato', sfeer: 1, x: 100, y: 4720, scale: 1 },
        { key: 'alien-meso', sfeer: 2, x: 100, y: 8900 , scale: 1},
        { key: 'alien-thermo', sfeer: 3, x: 80, y: 5350 , scale: 1},
        { key: 'alien-exo', sfeer: 4, x: 80, y: 8400 , scale: 0.7},
    ];
    private alienSpawnTimer: Phaser.Time.TimerEvent | null = null;

    // --- Wind Offset for Testing ---
    blauwYOffsetTilted: number = 25;
    roodYOffsetTilted: number = 20;

    // --- Game Over Sequence ---
    isGameOverSequence: boolean = false;
    gameOverSwipeStarted: boolean = false;

    // ==================== LIFECYCLE METHODS ====================
    constructor() {
        super('Game');
        EventBus.emit('show-countdown');
        EventBus.on('pause-game-scene', this.handlePauseGameScene, this);
        EventBus.on('resume-game-scene', this.handleResumeGameScene, this);
        EventBus.on('victory-swipe-in', this.handleVictorySwipeIn, this);
        EventBus.on('gameover-swipe-in', this.handleGameOverSwipeIn, this);
        // Listen for countdown sound event from UI
        EventBus.on('play-countdown-sound', this.handlePlayCountdownSound, this);
        EventBus.on('play-start-sound', this.handlePlayStartdownSound, this);
        EventBus.on('play-startled-sound', this.handlePlayStartledSound, this);
    }


    create() {
        this.initializeGameState();
        this.setupPhysics();
        this.createSfeerLayers();
        this.createBackgrounds();
        this.createBalloon();
        this.setupObstacles();
        this.setupInput();
        // Start alien easter egg spawner
        this.startAlienSpawner();
        // this.sound.stopAll();
        // Spawn tropo-alien direct bij start
        this.troposfeerSound = this.sound.add('troposfeer', { loop: true, volume: 1 });
                    this.troposfeerSound.play();
        const tropoConfig = this.alienConfigs.find(a => a.key === 'alien-tropo');
        if (tropoConfig && this.textures.exists(tropoConfig.key)) {
            const sfeerCenterY = this.sfeerBaseY[tropoConfig.sfeer] + this.sfeerOffsetY;
            const sfeerHeight = this.sfeerHoogtes[tropoConfig.sfeer];
            const y = sfeerCenterY - (sfeerHeight / 2) + tropoConfig.y;
            const scale = tropoConfig.scale;
            const alien = this.physics.add.sprite(tropoConfig.x, y, tropoConfig.key, 0)
                .setScale(scale)
                .setDepth(999)
                .setOrigin(0.5);
            (alien.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            (alien as any).alienKey = tropoConfig.key;
            if (this.anims.exists(tropoConfig.key)) {
                alien.play(tropoConfig.key);
            }
            this.aliens.push(alien);
        }
        // // TEST: Speel troposfeer sound direct af
        // if (this.sound && this.sound.locked === false) {
        //         this.sound.play('troposfeer', { loop: true, volume: 1 });
            
        // } else {
        //     console.warn('Phaser sound is locked of niet beschikbaar.');
        // }
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
        if (this.isGameOverSequence) {
            this.updateGameOverSequence();
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
        this.checkNearObstacle(10); // Check for proximity to obstacles and notify UI
        this.updateAliens();
    }
        // ==================== ALIEN EASTER EGGS ====================
        private startAlienSpawner() {
            // Geen timer meer: aliens worden direct gespawned bij sfeerwissel
            // Functie blijft voor compatibiliteit, maar doet niets meer
            if (this.alienSpawnTimer) {
                this.alienSpawnTimer.remove(false);
                this.alienSpawnTimer = null;
            }
        }

        private spawnAlien() {
            // Kies random alien config
            // Spawn alleen de alien van de huidige sfeer, maar niet als hij al bestaat
            const sfeerAliens = this.alienConfigs.filter(a => a.sfeer === this.huidigeSfeerIndex);
            if (sfeerAliens.length === 0) return;
            const config = Phaser.Utils.Array.GetRandom(sfeerAliens);
            // Check of deze alien al bestaat (op key)
            if (this.aliens.some(a => (a as any).alienKey === config.key)) return;
            if (!this.textures.exists(config.key)) return;
            const scale = config.scale;
            let y;
            if (config.key === 'alien-tropo') {
                // Forceer tropo-alien in het midden van het scherm
                y = this.scale.height / 2;
            } else {
                const sfeerCenterY = this.sfeerBaseY[config.sfeer] + this.sfeerOffsetY;
                const sfeerHeight = this.sfeerHoogtes[config.sfeer];
                y = sfeerCenterY - (sfeerHeight / 2) + config.y;
            }
            const alien = this.physics.add.sprite(config.x, y, config.key, 0)
                .setScale(scale)
                .setDepth(1)
                .setOrigin(0.5);
            (alien.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            (alien as any).alienKey = config.key;
            // Speel animatie af als die bestaat
            if (this.anims.exists(config.key)) {
                alien.play(config.key);
            }
            this.aliens.push(alien);
        }

        private updateAliens() {
            // Laat aliens naar beneden bewegen
            for (const alien of this.aliens) {
                alien.y += this.smoothScrollSpeed;
            }
            // Verwijder aliens die uit beeld zijn
            for (let i = this.aliens.length - 1; i >= 0; i--) {
                if (this.aliens[i].y > this.scale.height + 200) {
                    this.aliens[i].destroy();
                    this.aliens.splice(i, 1);
                }
            }
        }
    
    shutdown() {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = null;
        EventBus.off('pause-game-scene', this.handlePauseGameScene, this);
        EventBus.off('resume-game-scene', this.handleResumeGameScene, this);
        EventBus.off('victory-swipe-in', this.handleVictorySwipeIn, this);
        EventBus.off('gameover-swipe-in', this.handleGameOverSwipeIn, this);
        EventBus.off('play-countdown-sound', this.handlePlayCountdownSound, this);
        EventBus.off('play-start-sound', this.handlePlayStartdownSound, this);
        EventBus.off('play-startled-sound', this.handlePlayStartledSound, this);
        closeRotaryClient();
        // Play countdown sound when event is received from UI
        // Stop troposfeer sound indien nog bezig
        if (this.troposfeerSound) {
            this.troposfeerSound.stop();
            this.troposfeerSound.destroy();
            this.troposfeerSound = null;
        }
        if (this.stratosfeerSound) {
            this.stratosfeerSound.stop();
            this.stratosfeerSound.destroy();
            this.stratosfeerSound = null;
        }
    }

    private handlePlayStartledSound() {
        this.sound.play('alien-startled', { volume: 0.7 });
    }
    private handlePlayCountdownSound() {
        // if (this.sound && this.sound.get('count-down')) {
        this.sound.play('count-down', { volume: 0.3 });
        // }
    }

    private handlePlayStartdownSound() {

        this.sound.setDetune(1200);
        this.sound.play('count-down', { volume: 0.3 });
        this.time.delayedCall(1000, () => {
            this.sound.setDetune(0);
        });
        // this.sound.setDetune(0);
    }
            // if (this.sound && this.sound.get('count-down')) {
    // ==================== NEAR OBSTACLE CHECK ====================
    /**
     * Checks if the balloon is near any obstacle (within a given distance).
     * Emits an event to the UI if the state changes.
     * @param threshold The distance in pixels to consider as 'near'.
     */
    private checkNearObstacle(threshold: number = 10): void {
        if (!this.ballonContainer) return;
        let near = false;
        const margin = 0;
        for (const obstacle of this.obstacles) {
            const balloonBounds = this.ballonContainer.getBounds();
            const reducedBalloonBounds = new Phaser.Geom.Rectangle(
                balloonBounds.x + margin,
                balloonBounds.y + margin,
                balloonBounds.width - 2 * margin,
                balloonBounds.height - 2 * margin
            );
            const obstacleBounds = obstacle.getBounds();
            const inflatedBalloonBounds = new Phaser.Geom.Rectangle(
                reducedBalloonBounds.x - threshold,
                reducedBalloonBounds.y - threshold,
                reducedBalloonBounds.width + 2 * threshold,
                reducedBalloonBounds.height + 2 * threshold
            );
            if (Phaser.Geom.Intersects.RectangleToRectangle(inflatedBalloonBounds, obstacleBounds)) {
                near = true;
                break;
            }
        }
        if (near !== this.wasNearObstacle) {
            if (this.shieldActive) return;
            this.wasNearObstacle = near;
            EventBus.emit('update-near-obstacle', near);
        }
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
        this.isGameOverSequence = false;
        this.isBalloonLeaving = false;
        this.powerUps = [];
        this.powerUpsSpawned = new Set();
        this.activePowerUp = null;
        this.powerUpEndTime = 0;
        this.freezeActive = false;
        this.shieldActive = false;
        this.aliens = [];
        
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
            // Start troposfeer sound
            // if (this.sound && this.sound.locked === false) {
            //     // if (this.sound.get('troposfeer')) {
            //         this.sound.play('troposfeer', { loop: true, volume: 0.4 });
                    
            //     // }
            // }
        }, 3000);
        
        this.rotary = getRotaryClient();
    }

    private setupPhysics() {
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        this.cameras.main.setBackgroundColor(0x00000000);
    }

    private setupInput() {
        // Keyboard pijltjes als fallback/debug
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        this.enterKey = null;
        this.wasEnterDown = false;
        this.wasButtonPressed = false;
    }

    // ==================== SFEER LAYERS ====================

    private createSfeerLayers() {
        const standaardHoogte = this.scale.height;
        this.sfeerHoogtes = [
            standaardHoogte * 4, // troposfeer
            standaardHoogte * 5, // stratosfeer
            standaardHoogte * 6, // mesosfeer
            standaardHoogte * 7, // thermosfeer
            standaardHoogte * 8, // exosfeer
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

            // Start lager dan normaal
            const startY = this.scale.height * 0.90;
            const targetY = this.scale.height * 0.85;
            this.ballonContainer = this.add.container(
                this.scale.width / 2,
                startY,
                [this.propellorBlauw, this.propellorRood, this.ballon]
            );
            this.ballonContainer.setDepth(1002);

            // Eerst ballon los omhoog laten gaan, dan pas bg swipen
            this.scene.pause(); // Pauzeer de scene zodat update() niet direct alles beweegt
            this.tweens.add({
                targets: this.ballonContainer,
                y: targetY,
                duration: 1200,
                ease: 'Cubic.easeOut',onStart: () => {
                    this.sound.detune = 0;
                    this.sound.play('alien-cheers', { volume: 0.4 });
                },
                onComplete: () => {
                    this.scene.resume(); // Start nu pas de rest van de game
                }
            });
        } catch (e) {
            console.error("[Game] Kan ballon of propellors niet aanmaken!", e);
        }
    }

    private damageBallon() {
        this.sound.play('hit', { volume: 0.3 });
        this.time.delayedCall(1000, () => {
            if (this.ballonHealth > 1) {

                this.sound.play('alien-angry', { volume: 0.5 });
            }

        });
                
        this.ballonHealth--;
        // Speel geluid af als je op 1 hartje komt
        if (this.ballonHealth === 1) {
            this.sound.play('alien-sad', { volume: 0.7 });
        }
        this.ballonInvulnerable = true;
        EventBus.emit('update-health', this.ballonHealth);
        EventBus.emit('show-hit-emotion');
        // Play hit sound at lower volume
        // if (this.sound && this.sound.get('hit')) {
        // }
        
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
            // Zet propellor stand afhankelijk van health
            if (!this.activePowerUp) {
                if (this.ballonHealth <= 1) {
                    this.setPropellorPositions('tilted');
                    this._windIsTilted = true;
                    this.updateWindEffects();
                } else {
                    this.setPropellorPositions('normal');
                    this._windIsTilted = false;
                    this.updateWindEffects();
                }
            }
        }
        
        if (this.ballonHealth <= 0) {
            // Wind sprites verwijderen bij game over
            if (this.windBlauw) {
                this.windBlauw.destroy();
                this.windBlauw = null;
            }
            if (this.windRood) {
                this.windRood.destroy();
                this.windRood = null;
            }
            // Start death sequence
            this.isGamePaused = false;
            this.gameOverSwipeStarted = false;
            EventBus.emit('hide-gameui');
            this.isGameOverSequence = true; 
        }
    }

    // ==================== OBSTACLES ====================

    private setupObstacles() {
        this.obstacles = [];
        this.firstMeteorSpawned = false;
        this.spawnObstacle();

        // Obstakels blijven spawnen
        if (this.obstacleSpawnTimer) {
            this.obstacleSpawnTimer.remove(false);
        }
        this.obstacleSpawnTimer = this.time.addEvent({
            delay: this.getObstacleSpawnDelay(),
            loop: true,
            callback: () => {
                this.spawnObstacle();
                // Reset timer met nieuwe delay voor variatie
                if (this.obstacleSpawnTimer) {
                    this.obstacleSpawnTimer.reset({
                        delay: this.getObstacleSpawnDelay(),
                        callback: this.obstacleSpawnTimer.callback,
                        callbackScope: this.obstacleSpawnTimer.callbackScope,
                        loop: true
                    });
                }
            }
        });
    }

    private getObstacleSpawnDelay(): number {
        // Lagere delays voor meer obstakels
        // if (this.huidigeSfeerIndex === 2) { // Mesosfeer - meteors
        //     if (this.firstMeteorSpawned) {
        //         console.log('extra lange delay voor eerste meteoriet');
        //         // Eerste meteoriet: extra lang wachten
        //         // this.firstMeteorSpawned = false; // Reset voor volgende keer
        //         return Phaser.Math.Between(5000, 5500);
        //     } else {
        //         // Daarna sneller
        //         console.log('normale delay voor volgende meteorieten');
        //         return Phaser.Math.Between(2500, 4000);
        //     }
        // }
        const delays = [
            Phaser.Math.Between(2500, 5000),  // Troposfeer - birds
            Phaser.Math.Between(2500, 4000),  // Stratosfeer - planes (meer vliegtuigen)
            Phaser.Math.Between(2500, 4000),   // Mesosfeer - meteors (fallback, zou niet gebruikt moeten worden)
            Phaser.Math.Between(2500, 3500),  // Thermosfeer - satellites
            Phaser.Math.Between(2500, 4000)   // Exosfeer - ufos
        ];
        console.log('-------------------------------------');
        console.log('Obstacle Spawn Delay:', delays[this.huidigeSfeerIndex]);
        return delays[this.huidigeSfeerIndex] || 2000;
    }

    private getObstacleConfig() {
        const configs = [
            { texture: 'bird-walk', animKey: 'bird-walk', scale: 1, hasAnimation: true, movementType: 'horizontal' },
            { texture: 'plane-flying', animKey: 'plane-flying', scale: 1, hasAnimation: true, movementType: 'horizontal' },
            { texture: 'meteor-falling', animKey: 'meteor-falling', scale: 1, hasAnimation: true, movementType: 'vertical' },
            { texture: 'sattelite-flying', animKey: 'sattelite-flying', scale: 0.7, hasAnimation: true, movementType: 'horizontal' },
            { texture: 'ufo', animKey: 'ufo-fly', scale: 0.5, hasAnimation: false, movementType: 'horizontal' }
        ];
        return configs[this.huidigeSfeerIndex] || configs[0];
    }

    private spawnObstacle() {
        if (this.isGamePaused) return;

        const config = this.getObstacleConfig();
        if (!this.textures.exists(config.texture)) return;

        try {
            let x, y, direction, speed;

            // Calculate current sfeer's screen Y position range
            const currentSfeerCenterY = this.sfeerBaseY[this.huidigeSfeerIndex] + this.sfeerOffsetY;
            const currentSfeerHeight = this.sfeerHoogtes[this.huidigeSfeerIndex];
            const currentSfeerTop = currentSfeerCenterY - (currentSfeerHeight / 2);
            // const currentSfeerBottom = currentSfeerCenterY + (currentSfeerHeight / 2);

            // Start spawning only when we're 10% into the sfeer
            if (this.huidigeSfeerIndex === 2) {
                let startSpawnThreshold = 768*2; // Original threshold
                if (currentSfeerTop > -startSpawnThreshold) {
                    // We haven't progressed enough into this sfeer yet
                    return;
                }
            }
            else {
                const startSpawnThreshold = 500;
                if (currentSfeerTop > -startSpawnThreshold) {
                    // We haven't progressed enough into this sfeer yet
                    return;
                }
            }

            // Laat obstakels tot bijna het einde van de sfeer spawnen (laatste 5% niet meer)
            // const stopSpawnThreshold = currentSfeerHeight * 0.05;
            // if (currentSfeerTop < -currentSfeerHeight + stopSpawnThreshold) {
            //     // We're too close to the end of this sfeer
            //     return;
            // }

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
                // Markeer dat de eerste meteoriet is gespawned
                if (this.huidigeSfeerIndex === 2 && config.texture === 'meteor-falling' && !this.firstMeteorSpawned) {
                    console.log('Eerste meteoriet gespawned!');
                    this.firstMeteorSpawned = true;
                }
            } else {
                // --- ALLE HORIZONTALE OBSTAKELS: van beide kanten, max 2x zelfde kant ---
                let fromLeft;
                const typeKey = config.texture;
                if (!this.lastObstacleSides[typeKey]) this.lastObstacleSides[typeKey] = [];
                const last = this.lastObstacleSides[typeKey];
                let lastSide = last.length > 0 ? last[last.length - 1] : null;
                let count = 0;
                for (let i = last.length - 1; i >= 0 && lastSide !== null; i--) {
                    if (last[i] === lastSide) count++;
                    else break;
                }
                if (count >= 2 && lastSide !== null) {
                    fromLeft = lastSide === -1;
                } else {
                    fromLeft = Math.random() < 0.5;
                }
                // Sla kant op
                last.push(fromLeft ? 1 : -1);
                if (last.length > 5) last.shift();
                x = fromLeft ? -200 : this.scale.width + 200;
                y = -200;
                direction = fromLeft ? 1 : -1;
                // Variabele snelheid per sfeer en type
                let minSpeed = 2, maxSpeed = 3;
                switch (this.huidigeSfeerIndex) {
                    case 0: // Troposfeer - birds
                        minSpeed = 2; maxSpeed = 3;
                        break;
                    case 1: // Stratosfeer - planes
                        minSpeed = 2; maxSpeed = 3;
                        break;
                    case 2: // Mesosfeer - meteors (should be vertical, but just in case)
                        minSpeed = 1; maxSpeed = 1;
                        break;
                    case 3: // Thermosfeer - satellites
                        minSpeed = 4; maxSpeed = 5;
                        break;
                    case 4: // Exosfeer - ufos
                        minSpeed = 5; maxSpeed = 6;
                        break;
                }
                speed = Phaser.Math.Between(minSpeed, maxSpeed);
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
    private handleGameOverSwipeIn() {
        if (this.isGameOverSwiping) return;
        this.isGameOverSwiping = true;
        
        const GAMEOVER_SWIPE_DURATION = 1200; // Sync met hoofdgame
        // Swipe alleen backgrounds, sfeerRects en ballonContainer (geen obstakels of powerUps)
        const allGameObjects = [
            this.bgTroposfeer,
            this.bgStratosfeer,
            this.bgMesosfeer,
            this.bgThermosfeer,
            this.bgExosfeer,
            this.ballonContainer,
            ...this.sfeerRects
        ].filter(obj => obj !== null);

        this.tweens.add({
            targets: allGameObjects,
            y: `-=${this.scale.height}`,
            duration: GAMEOVER_SWIPE_DURATION,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.isGameOverSwiping = false;
                this.isGameOverSequence = false;
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
        if (this.pauseStartTime && Date.now() - this.pauseStartTime >= 60000) {
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
            if (!this.hasPlayedVictoryCheer) {
                this.sound.play('alien-cheers', { volume: 0.5 });
                this.hasPlayedVictoryCheer = true;
            }
            if (this.ballonContainer.y + (this.ballon?.height ?? 100) < -50) {
                this.isBalloonLeaving = false;
                this.scene.launch('GameVictory');
                EventBus.emit('victory-swipe-in');
            }
        }
    }

        // ==================== GAME OVER SEQUENCE ====================
    private updateGameOverSequence() {
        // 1. Tijdens het vallen van de ballon: alleen de huidige sfeer als stilstaande achtergrond
        const sfeerBgs = [this.bgTroposfeer, this.bgStratosfeer, this.bgMesosfeer, this.bgThermosfeer, this.bgExosfeer];
        // for (let i = 0; i < sfeerBgs.length; i++) {
        //     const bg = sfeerBgs[i];
        //     if (bg) {
        //         if (i === this.huidigeSfeerIndex) {
        //             bg.y = this.scale.height;
        //             bg.setVisible(true);
        //             bg.setAlpha(1);
        //             bg.setDepth(-200);
        //         } else {
        //             bg.setVisible(false);
        //             bg.setAlpha(0);
        //         }
        //     }
        // }

        // 2. Ballon valt naar beneden zolang hij bestaat
        if (this.ballonContainer) {
            if (!this.hasPlayedScream) {
                this.sound.play('alien-scream', { volume: 0.3 });
                this.hasPlayedScream = true;
            }
            this.ballonContainer.y += 18; // Snelheid van vallen
            // Als ballon uit beeld is, verwijder hem en start sfeer scroll-back (swipe-in gebeurt pas na scroll)
            if (
                this.ballonHealth <= 0 &&
                this.ballonContainer &&
                !this.gameOverSwipeStarted &&
                this.ballonContainer.y - (this.ballon?.height ?? 100) > this.scale.height + 100
            ) {
                // Verwijder ballonContainer en ballon
                this.ballonContainer.destroy();
                this.ballonContainer = null;
                this.ballon = null;
                this.gameOverSwipeStarted = true;
            }
        }

        // 3. Als ballon weg is en swipe nog niet gestart, swipe de huidige bg en sfeerRects naar boven
        if (
            this.ballonHealth <= 0 &&
            !this.ballonContainer &&
            this.gameOverSwipeStarted
        ) {
            this.gameOverSwipeStarted = false; // voorkom dubbele animatie
            if (this.huidigeSfeerIndex === 0) {
                // In troposfeer: swipe direct naar GameOver
                this.scene.launch('GameOver');
                EventBus.emit('gameover-swipe-in');
            } else {
                // Andere sferen: sfeer scroll-back animatie
                const startOffset = this.sfeerOffsetY;
                let lastTweenValue = startOffset;
                const troposfeerHeight = this.sfeerHoogtes[0];
                const troposfeerEnd = troposfeerHeight - (this.scale.height * 2);
                const targetOffset = Math.max(troposfeerEnd, 0);
                this.tweens.addCounter({
                    from: startOffset,
                    to: targetOffset,
                    duration: (() => {
                        switch (this.huidigeSfeerIndex) {
                            case 1: return 1000; // stratosfeer
                            case 2: return 2000; // mesosfeer
                            case 3: return 2500; // thermosfeer
                            case 4: return 3000; // exosfeer
                            default: return 2000;
                        }
                    })(),
                    ease: 'Sine.easeIn',
                    onUpdate: tween => {
                        const currentValue = tween.getValue() ?? 0;
                        const delta = currentValue - lastTweenValue;
                        this.sfeerOffsetY = currentValue;
                        lastTweenValue = currentValue;
                        for (let i = 0; i < this.sfeerRects.length; i++) {
                            const baseY = this.sfeerBaseY[i];
                            this.sfeerRects[i].y = baseY + this.sfeerOffsetY;
                        }
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
                            if (obstacle && obstacle.active) {
                                obstacle.y += delta;
                            }
                        }
                        for (const powerUp of this.powerUps) {
                            if (powerUp && powerUp.active) {
                                powerUp.y += delta;
                            }
                        }
                        for (const alien of this.aliens) {
                            if (alien && alien.active) {
                                alien.y += delta;
                            }
                        }
                    },
                    onComplete: () => {
                        this.scene.launch('GameOver');
                        EventBus.emit('gameover-swipe-in');
                    }
                });
            }
        }
    }

    private updateScroll() {
        const scrollSpeeds = [200, 7, 9, 11, 12];
        // const scrollSpeeds = [200, 200, 200, 200, 12];
        // Scroll pas als ballon op targetY is
        if (this.ballonContainer && this.ballonContainer.y > this.scale.height * 0.86) {
            return;
        }
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
        // Obstakels en powerUps meescrollen met sfeerOffsetY
        // (de y-positie wordt alleen hier aangepast, niet elders)
    }

    private updateBackgrounds() {
        // Normale stacking: backgrounds meescrollen met sfeerOffsetY
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

            // UFO bobbing effect (op en neer bewegen)
            if ((obstacle as any).obstacleType === 'ufo') {
                if (!(obstacle as any).bobbingOffset) {
                    (obstacle as any).bobbingOffset = Math.random() * Math.PI * 2;
                }
                (obstacle as any).bobbingOffset += 0.05;
                obstacle.y += Math.sin((obstacle as any).bobbingOffset) * 3;
            }
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
            // Reset meteoriet-flag als je de mesosfeer verlaat
            if (this.huidigeSfeerIndex === 2 && sfeerIndex !== 2) {
                this.firstMeteorSpawned = false;
            }
            // Reset obstacleSpawnTimer bij binnenkomst mesosfeer
            if (sfeerIndex === 2 && this.huidigeSfeerIndex !== 2) {
                if (this.obstacleSpawnTimer) {
                    this.obstacleSpawnTimer.remove(false);
                }
                this.obstacleSpawnTimer = this.time.addEvent({
                    delay: this.getObstacleSpawnDelay(),
                    loop: true,
                    callback: () => {
                        this.spawnObstacle();
                        if (this.obstacleSpawnTimer) {
                            this.obstacleSpawnTimer.reset({
                                delay: this.getObstacleSpawnDelay(),
                                callback: this.obstacleSpawnTimer.callback,
                                callbackScope: this.obstacleSpawnTimer.callbackScope,
                                loop: true
                            });
                        }
                    }
                });
            }
            // Toon interlude iets eerder: aan het einde van de vorige sfeer
            if (this.countdownDone && sfeerIndex > 0 && sfeerIndex > this.lastSfeerIndex) {
                // Bepaal progressie in vorige sfeer
                const prevSfeerIndex = sfeerIndex - 1;
                const prevSfeerHeight = this.sfeerHoogtes[prevSfeerIndex];
                const prevSfeerBaseY = this.sfeerBaseY[prevSfeerIndex];
                const prevSfeerTop = prevSfeerBaseY - prevSfeerHeight / 2;
                const prevSfeerBottom = prevSfeerBaseY + prevSfeerHeight / 2;
                const centerWorldY = (this.scale.height / 2) - this.sfeerOffsetY;
                const progressInPrevSfeer = 1 - ((centerWorldY - prevSfeerTop) / prevSfeerHeight);
                if (progressInPrevSfeer > 0.70) {
                    EventBus.emit('show-interlude', sfeerIndex);
                }
            }
            // --- SFEER SOUND DIRECT SWITCH ---
            this.huidigeSfeerIndex = sfeerIndex;
            EventBus.emit('update-sfeer', SFEER_LABELS[sfeerIndex].naam);
            this.checkPowerUpSpawn(sfeerIndex);
            this.spawnAlien(); // Spawn de alien direct bij sfeerwissel
            this.lastSfeerIndex = sfeerIndex;
            console.log('------------------------------------');
            console.log(this.sound);

            console.log(this.sound.locked)
            if (this.sound.locked === false) {
                // Crossfade logica: fade huidige sfeer sound uit, nieuwe in, met overlap
                const FADE_TIME = 1500; // ms
                let oldSound: Phaser.Sound.BaseSound | null = null;
                let newSound: Phaser.Sound.BaseSound | null = null;
                let newKey = '';
                if (sfeerIndex === 0) {
                    newKey = 'troposfeer';
                    oldSound = this.stratosfeerSound || this.spaceSound;
                } else if (sfeerIndex === 1) {
                    newKey = 'stratosfeer';
                    oldSound = this.troposfeerSound || this.spaceSound;
                } else if (sfeerIndex === 2 || sfeerIndex === 3 || sfeerIndex === 4) {
                    newKey = 'space';
                    oldSound = this.troposfeerSound || this.stratosfeerSound;
                }

                // Start nieuwe sound op volume 0
                if (newKey) {
                    newSound = this.sound.add(newKey, { loop: true, volume: 0 });
                    newSound.play();
                }

                // Fade out oude sound, fade in nieuwe sound
                if (oldSound && oldSound.isPlaying) {
                    this.tweens.add({
                        targets: oldSound,
                        volume: 0,
                        duration: FADE_TIME,
                        onComplete: () => {
                            oldSound.stop();
                            oldSound.destroy();
                            if (oldSound === this.troposfeerSound) this.troposfeerSound = null;
                            if (oldSound === this.stratosfeerSound) this.stratosfeerSound = null;
                            if (oldSound === this.spaceSound) this.spaceSound = null;
                        }
                    });
                }
                if (newSound) {
                    this.tweens.add({
                        targets: newSound,
                        volume: 1,
                        duration: FADE_TIME
                    });
                }

                // Update references
                if (sfeerIndex === 0) {
                    this.troposfeerSound = newSound;
                    if (this.stratosfeerSound) { this.stratosfeerSound = null; }
                    if (this.spaceSound) { this.spaceSound = null; }
                } else if (sfeerIndex === 1) {
                    this.stratosfeerSound = newSound;
                    if (this.troposfeerSound) { this.troposfeerSound = null; }
                    if (this.spaceSound) { this.spaceSound = null; }
                } else if (sfeerIndex === 2 || sfeerIndex === 3 || sfeerIndex === 4) {
                    this.spaceSound = newSound;
                    if (this.troposfeerSound) { this.troposfeerSound = null; }
                    if (this.stratosfeerSound) { this.stratosfeerSound = null; }
                }
            }
            
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
            // Speel victory sound alleen hier
            // this.sound.play('alien-cheers', { volume: 0.8 });
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
        if (this.ballonHealth <= 0) return;
        // Ballon mag altijd bewegen, ook bij 0 levens

        let deltaX = 0;
        let propellorLeftActive = false;
        let propellorRightActive = false;

        // Rotary input
        if (this.rotary && Array.isArray(this.rotary.lastAngles) && Array.isArray(this.rotary.prevAngles)) {
            const angles = this.rotary.lastAngles;
            const prevs = this.rotary.prevAngles;
            const threshold = 3;

            if (
                angles.length >= 2 && prevs.length >= 2 &&
                typeof angles[0] === 'number' && typeof prevs[0] === 'number' &&
                typeof angles[1] === 'number' && typeof prevs[1] === 'number'
            ) {
                const diff1 = angleDiff(angles[0], prevs[0]); // rechts
                const diff2 = angleDiff(angles[1], prevs[1]); // links

                // Rotary1: naar rechts, Rotary2: naar links
                if (Math.abs(diff1) > threshold) {
                    EventBus.emit('rotary1-move');
                    deltaX += Math.abs(diff1); // rechts
                }
                if (Math.abs(diff2) > threshold) {
                    EventBus.emit('rotary2-move');
                    deltaX -= Math.abs(diff2); // links
                }

                this._lastRotaryDiffs = [diff1, diff2];
            }
        }

        // Keyboard pijltjes als fallback
        if (this.cursors) {
            if (this.cursors.left?.isDown) {
                deltaX -= 8;
            }
            if (this.cursors.right?.isDown) {
                deltaX += 8;
            }
        }

        // Propellor animatie: als ballon naar links/rechts beweegt
        if (deltaX < 0) {
            propellorLeftActive = true;
        }
        if (deltaX > 0) {
            propellorRightActive = true;
        }

        // Update propellor animations (override sensorXActive)
        this.updatePropellorAnimation(this.propellorBlauw, propellorRightActive);
        this.updatePropellorAnimation(this.propellorRood, propellorLeftActive);

        // Update wind effects
        this.updateWindSprite(propellorRightActive, propellorLeftActive);

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
                let x = this.ballonContainer.x + this.propellorOffsetXBlauw + 30;
                let y = this.ballonContainer.y + this.propellorOffsetY;
                if (this.ballonHealth === 1) {
                    x = this.ballonContainer.x + this.propellorOffsetXBlauw - 50;
                    y = this.ballonContainer.y + this.propellorOffsetY - 100;
                }
                this.windBlauw = this.add.sprite(
                    x,
                    y,
                    'wind-blauw'
                ).setDepth(1002).setScale(0.4);
                this.windBlauw.play({ key: 'wind-blauw', repeat: 0 });
                // Forceer juiste rotatie direct na aanmaken
                if (this.ballonHealth === 1) {
                    this.windBlauw.setRotation(0.26);
                } else {
                    this.windBlauw.setRotation(0);
                }
                this.windBlauw.once('animationcomplete', () => {
                    if (this.windBlauw) {
                        this.windBlauw.destroy();
                        this.windBlauw = null;
                    }
                });
            } else {
                // Forceer juiste rotatie als sprite al bestaat
                if (this.ballonHealth === 1) {
                    this.windBlauw.setRotation(0.26);
                } else {
                    this.windBlauw.setRotation(0);
                }
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
                let x = this.ballonContainer.x + this.propellorOffsetXRood - 30;
                let y = this.ballonContainer.y + this.propellorOffsetY;
                if (this.ballonHealth === 1) {
                    x = this.ballonContainer.x + this.propellorOffsetXRood + 40;
                    y = this.ballonContainer.y + this.propellorOffsetY + 100;
                }
                this.windRood = this.add.sprite(
                    x,
                    y,
                    'wind-rood'
                ).setDepth(1002).setScale(0.4);
                this.windRood.play({ key: 'wind-rood', repeat: 0 });
                // Forceer juiste rotatie direct na aanmaken
                if (this.ballonHealth === 1) {
                    this.windRood.setRotation(0.26);
                } else {
                    this.windRood.setRotation(0);
                }
                this.windRood.once('animationcomplete', () => {
                    if (this.windRood) {
                        this.windRood.destroy();
                        this.windRood = null;
                    }
                });
            } else {
                // Forceer juiste rotatie als sprite al bestaat
                if (this.ballonHealth === 1) {
                    this.windRood.setRotation(0.26);
                } else {
                    this.windRood.setRotation(0);
                }
            }
        } else {
            if (this.windRood && !this.windRood.anims.isPlaying) {
                this.windRood.destroy();
                this.windRood = null;
            }
        }
    }

    // Offset-waarden voor makkelijk testen (nu als class properties)

    private updateWindEffects() {
        if (this.ballonHealth <= 0) {
            // Wind moet niet meer zichtbaar zijn
            if (this.windBlauw) { this.windBlauw.setVisible(false); }
            if (this.windRood) { this.windRood.setVisible(false); }
            return;
        }
        // ...existing code...
        if (this.windBlauw && this.ballonContainer) {
            if (this._windIsTilted) {
                this.windBlauw.x = this.ballonContainer.x + this.propellorOffsetXBlauw - 50;
                this.windBlauw.y = this.ballonContainer.y + this.propellorOffsetY - this.blauwYOffsetTilted;
            } else {
                this.windBlauw.x = this.ballonContainer.x + this.propellorOffsetXBlauw - 50;
                this.windBlauw.y = this.ballonContainer.y + this.propellorOffsetY;
            }
            this.windBlauw.setVisible(true);
        }
        if (this.windRood && this.ballonContainer) {
            if (this._windIsTilted) {
                this.windRood.x = this.ballonContainer.x + this.propellorOffsetXRood + 40;
                this.windRood.y = this.ballonContainer.y + this.propellorOffsetY + this.roodYOffsetTilted;
            } else {
                this.windRood.x = this.ballonContainer.x + this.propellorOffsetXRood + 50;
                this.windRood.y = this.ballonContainer.y + this.propellorOffsetY;
            }
            this.windRood.setVisible(true);
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
            const isFrozen = obstacle.getData('frozen');
            
            // Once frozen, stay frozen until power-up ends
            // Only check distance for obstacles that aren't already frozen
            if (!isFrozen && this.freezeActive) {
                this.setPropellorPositions('normal');
                const distanceToBalloon = Phaser.Math.Distance.Between(
                    obstacle.x, obstacle.y,
                    this.ballonContainer.x, this.ballonContainer.y
                );
                
                if (distanceToBalloon < 1100) {
                    obstacle.setData('frozen', true);
                    
                        this.sound.play('freeze', { volume: 0.6 });
                    // Change plane texture to frozen version if it's a plane
                    if ((obstacle as any).obstacleType === 'plane-flying' && this.textures.exists('plane-freeze')) {
                        obstacle.setTexture('plane-freeze');
                        obstacle.anims.stop();
                    }
                }
            }
            
            // Update obstacle position only if not frozen
            if (!isFrozen) {
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
                // ...existing code...
                // If shield is active, destroy obstacle but don't damage balloon
                if (this.shieldActive) {
                                        // Speel shield-hit geluid af
                    this.sound.play('hit-metal', { volume: 0.5 });
                    this.setPropellorPositions('normal');
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
                    
                    // Satellite breaking animation
                    if (obstacleType === 'sattelite-flying' && this.textures.exists('sattelite-breaking')) {
                        const xOffset = obstacleScaleX < 0 ? 0 : 0;
                        const breakingSattelite = this.physics.add.sprite(x + xOffset, y-50, 'sattelite-breaking')
                            .setScale(obstacleScaleX, 0.7)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(breakingSattelite);
                        
                        const body = breakingSattelite.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(600);
                        body.setVelocityY(Phaser.Math.Between(200, 300));
                        
                        if (this.anims.exists('sattelite-breaking')) {
                            breakingSattelite.play('sattelite-breaking');
                            breakingSattelite.once('animationcomplete', () => {
                                this.tweens.add({
                                    targets: breakingSattelite,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => breakingSattelite.destroy()
                                });
                            });
                        }
                    }
                    // UFO breaking animation
                    if (obstacleType === 'ufo' && this.textures.exists('ufo-breaking')) {
                        const breakingUfo = this.physics.add.sprite(x, y, 'ufo-breaking')
                            .setScale(0.5, 0.5)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(breakingUfo);
                        const body = breakingUfo.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(600);
                        body.setVelocityY(Phaser.Math.Between(200, 300));
                        if (this.anims.exists('ufo-breaking')) {
                            breakingUfo.play('ufo-breaking');
                            breakingUfo.once('animationcomplete', () => {
                                this.tweens.add({
                                    targets: breakingUfo,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => breakingUfo.destroy()
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
                
                    // Satellite breaking animation
                    if (obstacleType === 'sattelite-flying' && this.textures.exists('sattelite-breaking')) {
                        const xOffset = obstacleScaleX < 0 ? 0 : 0;
                        const breakingSattelite = this.physics.add.sprite(x + xOffset, y-40, 'sattelite-breaking')
                            .setScale(obstacleScaleX, 0.7)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(breakingSattelite);
                        const body = breakingSattelite.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(600);
                        body.setVelocityY(Phaser.Math.Between(200, 300));
                        if (this.anims.exists('sattelite-breaking')) {
                            breakingSattelite.play('sattelite-breaking');
                            breakingSattelite.once('animationcomplete', () => {
                                this.tweens.add({
                                    targets: breakingSattelite,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => breakingSattelite.destroy()
                                });
                            });
                        }
                    }

                    // UFO breaking animation (ook bij gewone botsing)
                    if (obstacleType === 'ufo' && this.textures.exists('ufo-breaking')) {
                        const xOffset = obstacleScaleX < 0 ? 0 : 0;

                        const breakingUfo = this.physics.add.sprite(x + xOffset, y, 'ufo-breaking')
                            .setScale(0.5, 0.5)
                            .setDepth(50)
                            .setOrigin(0.5);
                        if (parent) parent.add(breakingUfo);
                        const body = breakingUfo.body as Phaser.Physics.Arcade.Body;
                        body.setAllowGravity(true);
                        body.setGravityY(600);
                        body.setVelocityY(Phaser.Math.Between(200, 300));
                        if (this.anims.exists('ufo-breaking')) {
                            breakingUfo.play('ufo-breaking');
                            breakingUfo.once('animationcomplete', () => {
                                this.tweens.add({
                                    targets: breakingUfo,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => breakingUfo.destroy()
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
        
        let minOffset = sfeerHeight * 0.3;
        let maxOffset = sfeerHeight * 0.6;
        // Laat freeze power-up lager spawnen in de sfeer
        if (type === 'freeze') {
            minOffset = sfeerHeight * 0.55;
            maxOffset = sfeerHeight * 0.85;
        }
        if ( type === 'timer') {
            minOffset = sfeerHeight * 0.2;
            maxOffset = sfeerHeight * 0.25;
        }
        const randomOffset = Phaser.Math.Between(minOffset, maxOffset);
        const y = sfeerCenterY - (sfeerHeight / 2) + randomOffset;

        try {
            // Kies kleur per type
            let circleColor = 0x00d9ff; // default blauw
            switch (type) {
                case 'health': circleColor = 0xE73228; break; // groen
                case 'freeze': circleColor = 0x35BBF0; break; // blauw
                case 'shield': circleColor = 0x26B31F; break; // geel
                case 'timer':  circleColor = 0xFFB703; break; // paars
            }
            // Maak twee cirkels achter de power-up
            const circle1 = this.add.circle(0, 0, 100, circleColor, 0.5)
                .setDepth(98)
                .setOrigin(0.5)
                .setScale(0)
                .setAlpha(1);

            const circle2 = this.add.circle(0, 0, 100, circleColor, 0.5)
                .setDepth(98)
                .setOrigin(0.5)
                .setScale(0)
                .setAlpha(1);

            const powerUp = this.physics.add.sprite(0, 0, texture)
                .setScale(1.5)
                .setDepth(100)
                .setOrigin(0.5);

            // Voeg cirkels en sprite toe aan container (cirkels eerst)
            const container = this.add.container(x, y, [circle1, circle2, powerUp]);
            container.setDepth(100);
            (container as any).powerUpSprite = powerUp;
            (container as any).circle1 = circle1;
            (container as any).circle2 = circle2;
            (container as any).powerUpType = type;
            (container as any).uniqueKey = uniqueKey;
            (container as any).baseY = y;
            (container as any).bobOffset = 0;
            (container as any).x = x;
            (container as any).y = y;
            (container as any).circleAnimOffset = Math.random() * Math.PI * 2; // voor variatie
            (powerUp.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.add.existing(container);
            this.powerUps.push(container);

        } catch (e) {
            console.error('[Game] Failed to spawn power-up:', e);
        }
    }

    private updatePowerUpPositions() {

        const time = this.time.now;
        for (const container of this.powerUps) {
            (container as any).baseY += this.smoothScrollSpeed;
            (container as any).bobOffset = Math.sin(time * 0.003) * 20;
            container.x = (container as any).x;
            container.y = (container as any).baseY + (container as any).bobOffset;

            // Puls: cirkels gaan van klein (0) naar groot (1), resetten naar 0
            // Fade-out in laatste 7% van de animatie, zodat de pauze minimaal is
            const speed = 1 / 1800; // 1.8 seconden per pulse
            if ((container as any).circle1 && (container as any).circle2) {
                const baseTime = this.time.now * speed + (container as any).circleAnimOffset;
                // Circle 1
                let p1 = baseTime % 1;
                if (p1 < 0) p1 += 1;
                let scale1 = p1;
                let alpha1 = 1;
                if (scale1 > 0.93) {
                    alpha1 = 1 - ((scale1 - 0.93) / 0.07); // fade out van 1 naar 0 tussen 0.93 en 1
                }
                if (scale1 >= 1 || scale1 === 0) {
                    scale1 = 0;
                    alpha1 = 0;
                }
                (container as any).circle1.setScale(scale1);
                (container as any).circle1.setAlpha(Math.max(0, Math.min(1, alpha1)));

                // Circle 2, kwart fase offset (0.25)
                let p2 = (baseTime + 0.25) % 1;
                if (p2 < 0) p2 += 1;
                let scale2 = p2;
                let alpha2 = 1;
                if (scale2 > 0.93) {
                    alpha2 = 1 - ((scale2 - 0.93) / 0.07);
                }
                if (scale2 >= 1 || scale2 === 0) {
                    scale2 = 0;
                    alpha2 = 0;
                }
                (container as any).circle2.setScale(scale2);
                (container as any).circle2.setAlpha(Math.max(0, Math.min(1, alpha2)));
            }
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
            const container = this.powerUps[i];
            const powerUp = (container as any).powerUpSprite;
            if (this.checkOverlap(powerUp, this.ballon)) {
                const type = (container as any).powerUpType;
                this.activatePowerUp(type);

                // Play sound for health power-up
                if (type === 'health') {
                    this.sound.play('pick-up', { volume: 0.5 });
                    this.time.delayedCall(1000, () => {
                        this.sound.play('alien-happy', { volume: 0.5 });
                    });
                } else {
                    this.sound.play('pick-up', { volume: 0.2 });
                }
                // Visual feedback
                this.tweens.add({
                    targets: container,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => container.destroy()
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

                    this.setPropellorPositions('normal');
                        }
                    }
                }
                break;

            case 'freeze':
                this.freezeActive = true;
                this.activePowerUp = 'freeze';
                this.powerUpEndTime = Date.now() + 10000; // 10 seconds
                EventBus.emit('update-powerup', 'freeze');
                
                // Change balloon to freeze version
                if (this.ballon && this.textures.exists('balloon-freeze')) {
                    this.ballon.setTexture('balloon-freeze');
                }
                break;

            case 'shield':
                this.shieldActive = true;
                this.activePowerUp = 'shield';
                this.powerUpEndTime = Date.now() + 10000; // 10 seconds
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
            const powerUpType = this.activePowerUp;
            // Clear power-up state and notify UI immediately
            this.activePowerUp = null;
            EventBus.emit('update-powerup', null);

            if (powerUpType === 'freeze') {
                this.freezeActive = false;
                // Unfreeze all frozen obstacles immediately
                for (const obstacle of this.obstacles) {
                    if (obstacle.getData('frozen')) {
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
                }
                // Change balloon back based on health
                if (this.ballon && this.textures.exists('balloon')) {
                    if (this.ballonHealth === 3) {
                        this.ballon.setTexture('balloon').setScale(0.54);
                        this.setPropellorPositions('normal');
                    } else if (this.ballonHealth === 2 && this.textures.exists('balloon-health2')) {
                        this.ballon.setTexture('balloon-health2').setScale(0.54);
                        this.setPropellorPositions('normal');
                    } else if (this.ballonHealth <= 1 && this.textures.exists('balloon-health1')) {
                        this.ballon.setTexture('balloon-health1').setScale(0.54);
                        this.setPropellorPositions('tilted');
                    }
                }
            } else if (powerUpType === 'shield') {
                this.shieldActive = false;
                // Change balloon back based on health
                if (this.ballon && this.textures.exists('balloon')) {
                    if (this.ballonHealth === 3) {
                        this.ballon.setTexture('balloon').setScale(0.54);
                        this.setPropellorPositions('normal');
                    } else if (this.ballonHealth === 2 && this.textures.exists('balloon-health2')) {
                        this.ballon.setTexture('balloon-health2').setScale(0.54);
                        this.setPropellorPositions('normal');
                    } else if (this.ballonHealth <= 1 && this.textures.exists('balloon-health1')) {
                        this.ballon.setTexture('balloon-health1').setScale(0.54);
                        this.setPropellorPositions('tilted');
                    }
                }
            }
            // Zet de propellor posities afhankelijk van health
        }
    }

    private setPropellorPositions(mode: 'normal' | 'tilted') {
        if (!this.propellorBlauw || !this.propellorRood) return;
        // Sync wind mode
        // Let op: setRotation gebruikt radialen, setAngle gebruikt graden
        if (mode === 'tilted') {
            this.propellorBlauw.x = this.propellorOffsetXBlauw -5;
            this.propellorBlauw.y = this.propellorOffsetY - 15;
            this.propellorBlauw.setRotation(0.26); // ~15 graden
            // this.propellorBlauw.setTint(0x3399ff); // debug: blauw
            this.propellorRood.x = this.propellorOffsetXRood-12;
            this.propellorRood.y = this.propellorOffsetY + 3;
            this.propellorRood.setRotation(0.26); // ~15 graden
            // this.propellorRood.setTint(0xff3333); // debug: rood
        } else {
            this.propellorBlauw.x = this.propellorOffsetXBlauw;
            this.propellorBlauw.y = this.propellorOffsetY;
            this.propellorBlauw.setRotation(0);
            this.propellorRood.x = this.propellorOffsetXRood;
            this.propellorRood.y = this.propellorOffsetY;
            this.propellorRood.setRotation(0);
        }
        // Wind logica nu in updateWindEffects
    }


    

    // setWindPositions verwijderd, logica zit nu in updateWindEffects

}

