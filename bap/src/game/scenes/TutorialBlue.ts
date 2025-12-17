import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { getRotaryClient } from "../utils/rotaryClientSingleton";

export class Tutorial extends Scene {
    private sceneIsReady: boolean = false;
    // ==================== PROPERTIES ====================
    
    // Rotary input
    private rotary: any;
    private lastAngle1: number | null = null;
    private lastAngle2: number | undefined = undefined;
    private startAngle1: number | null = null;
    private totalDelta: number = 0;
    
    // Button state
    private wasButtonPressed: boolean = false;
    private skipHoldStart: number | null = null;
    private skipHoldProgress: number = 0;
    private skipButtonTween: Phaser.Tweens.Tween | null = null;
    private skipButtonIsDown: boolean = false;
    private isTransitioning: boolean = false;
    // Input state tracking for skip/continue
    private _keyboardWasDown: boolean = false;
    private skipHoldSource: 'rotary' | 'keyboard' | null = null;
    
    // UI elements
    private progressBar: Phaser.GameObjects.Graphics | null = null;
    private skipFill: Phaser.GameObjects.Graphics | null = null;
    private skipCircleRadius: number = 20;
    private animTargets: Phaser.GameObjects.GameObject[] = [];
    
    // Balloon & propellors
    private balloon: Phaser.GameObjects.Image;
    private propellorBlauw: Phaser.GameObjects.Sprite | null;
    private propellorRood: Phaser.GameObjects.Sprite;
    private windBlauw: Phaser.GameObjects.Sprite | null;
    private windRood: Phaser.GameObjects.Sprite;
    private propellorOffsetX: number = -38;
    private propellorOffsetY: number = 142;
    
    // Tutorial elements
    private activePropellor: Phaser.GameObjects.Image;
    private inactivePropellor: Phaser.GameObjects.Image;
    private arrows: Phaser.GameObjects.Image;
    private inactiveShakeTimer: number = 0;
    private inactiveShakeDirection: number = 1;
    
    // Progress
    private progress: number = 0;
    private didRotateThisFrame: boolean = false;
    
    // Geen event handlers meer nodig

    // ==================== LIFECYCLE METHODS ====================

    constructor() {
        super('TutorialBlue');
        this.rotary = getRotaryClient();
    }

    create() {
        // Witte overlay fade-in
        const whiteOverlay = this.add.graphics();
        whiteOverlay.fillStyle(0xffffff, 1);
        whiteOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
        whiteOverlay.setDepth(9999);
        whiteOverlay.setAlpha(1);

        this.initializeState();
        this.createBackground();
        this.createTitle();
        this.createDescription();
        this.createTutorialElements();
        this.createBalloonAndPropellors();
        this.createProgressBar();
        this.createSkipButton();
        // setupEventListeners verwijderd, niet meer nodig

        this.sound.play('troposfeer', { loop: true, volume: 0.5 });
        // Reset rotary button state zodat een ingedrukte knop niet direct effect heeft
        this.wasButtonPressed = this.rotary?.buttonPressed || false;
        this.sceneIsReady = true;

        // Fade-out overlay zodra scene zichtbaar is
        this.tweens.add({
            targets: whiteOverlay,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                whiteOverlay.destroy();
            }
        });
    }

    update() {
        this.updateSkipButton();
        this.handleButtonInput();
        // Geen keyboard input, alleen rotaryClient/WebSocket
        this.updateInactivePropellorShake();
        this.updateArrowsRotation();
        this.updateActivePropellorRotation();
        this.updateBalloonMovement(); // MUST come before updatePropellorAnimations!
        this.updatePropellorAnimations();
        this.updateWindEffect();
        this.updatePropellorPositions();
    }

    shutdown() {
        console.log('TutorialBlue: shutdown() called');
        // shutdown() aangepast, geen event handlers meer
    }

    // ==================== INITIALIZATION ====================

    private initializeState() {
        this.wasButtonPressed = false;
        this.skipHoldStart = null;
        this.skipHoldProgress = 0;
        this.skipButtonTween = null;
        this.skipButtonIsDown = false;
        this.isTransitioning = false;
        this.progress = 0;
        this.startAngle1 = null;
        this.totalDelta = 0;
        this.windBlauw = null;
        
        // Zet troposfeer achtergrond image
        if (this.textures.exists('bg-troposfeer')) {
            const bg = this.add.image(this.scale.width / 2, this.scale.height, 'bg-troposfeer');
            const tex = this.textures.get('bg-troposfeer').getSourceImage();
            const scaleX = this.scale.width / tex.width;
            bg.setOrigin(0.5, 1).setDepth(-100).setScale(scaleX, 1);
        } else {
            // Fallback: kleur
            this.cameras.main.setBackgroundColor(
                '#' + SFEER_LABELS[0].colors.a.toString(16).padStart(6, '0').toUpperCase()
            );
        }
    }


    // ==================== UI CREATION ====================

    private createBackground() {
        const bg = this.add.graphics();
        const shadowOffset = 8;
        const rectWidth = 800;
        const rectHeight = 1350;
        const rectRadius = 32;
        const rectX = (this.scale.width - rectWidth) / 2;
        const rectY = (this.scale.height - rectHeight) / 2;

        // Shadow
        bg.fillStyle(0xE1E1E1, 1);
        bg.fillRoundedRect(rectX, rectY + shadowOffset, rectWidth, rectHeight, rectRadius);

        // Main background
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius);
    }

    private createTitle() {
        const paddingX = 32;
        const paddingY = 24;
        const borderRadius = 16;
        const titleY = 400;
        const shadowOffset = 8;
        
        // Temp title voor afmetingen
        const tempTitle = this.add.text(0, 0, 'Hoe werkt het?', {
            fontFamily: 'Bungee',
            fontSize: 64,
            color: '#fff',
            padding: { x: 20, y: 10 },
            align: 'center',
        }).setOrigin(0.5).setDepth(11);
        
        const titleWidth = tempTitle.width + paddingX * 2;
        const titleHeight = tempTitle.height + paddingY * 2;
        
        // Background met shadow
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0x35BBF0, 1);
        titleBg.fillRoundedRect(
            this.scale.width / 2 - titleWidth / 2,
            titleY - titleHeight / 2,
            titleWidth,
            titleHeight,
            borderRadius
        );
        titleBg.setDepth(10);
        
        // Echte title
        this.add.text(
            this.scale.width / 2,
            titleY,
            'Hoe werkt het?',
            {
                fontFamily: 'Bungee',
                fontSize: 64,
                color: '#fff',
                padding: { x: 20, y: 10 },
                align: 'center',
            }
        ).setOrigin(0.5).setDepth(10);
        
        tempTitle.destroy();
    }

    private createDescription() {
        const descFontSize = 52;
        const descY = this.scale.height / 2 - 420;
        
        const text1 = this.add.text(0, 0, 'Draai aan ', {
            fontFamily: 'Nunito',
            fontSize: descFontSize,
            color: '#35BBF0',
            fontStyle: 'normal',
        }).setOrigin(0, 0.5).setDepth(10);
        
        const text2 = this.add.text(0, 0, 'blauw', {
            fontFamily: 'Nunito',
            fontSize: descFontSize,
            color: '#35BBF0',
            fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(10);
        
        const totalWidth = text1.width + text2.width;
        const startX = this.scale.width / 2 - totalWidth / 2;
        
        text1.setPosition(startX, descY);
        text2.setPosition(startX + text1.width, descY);
    }

    private createTutorialElements() {
        const propellorX = this.scale.width / 2;
        const propellorY = this.scale.height / 2 + 425;
        
        this.inactivePropellor = this.add.image(
            propellorX + 200,
            propellorY,
            'inactive'
        ).setDepth(1001).setScale(0.60);
        
        this.activePropellor = this.add.image(
            propellorX - 150,
            propellorY,
            'active-blauw'
        ).setDepth(1003).setScale(0.8);
        
        this.arrows = this.add.image(
            this.activePropellor.x,
            this.activePropellor.y,
            'arrows-blue'
        ).setDepth(1004).setScale(0.6);
    }

    private createBalloonAndPropellors() {
        this.balloon = this.add.image(280, 860, 'balloon')
            .setDepth(1000)
            .setScale(0.54);
        
        this.propellorBlauw = this.add.sprite(
            this.balloon.x + this.propellorOffsetX,
            this.balloon.y + this.propellorOffsetY,
            'propellor-blauw'
        ).setDepth(1002).setScale(0.5);
        this.propellorBlauw.play('propellor-blauw');
        if (this.propellorBlauw.anims.currentAnim && this.propellorBlauw.anims.currentAnim.frames.length > 0) {
            this.propellorBlauw.anims.pause(this.propellorBlauw.anims.currentAnim.frames[0]);
        }
        
        this.propellorRood = this.add.sprite(
            this.balloon.x + this.propellorOffsetX + 77,
            this.balloon.y + this.propellorOffsetY,
            'propellor-rood'
        ).setDepth(1002).setScale(0.5);
        this.propellorRood.play('propellor-rood');
        if (this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
            this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
        }
    }

    private createProgressBar() {
        this.progressBar = this.add.graphics();
        this.progressBar.setDepth(20);
        this.drawProgressBar();
    }

    private createSkipButton() {
        const buttonWidth = 500;
        const buttonHeight = 100;
        const skipShadowOffsetY = 8;
        const buttonX = this.scale.width - buttonWidth / 2 - 54;
        const buttonY = this.scale.height - 150;
        const circleRadius = 20;
        const gap = 32;
        const skipTextPadding = 12;
        
        // Shadow
        const skipShadow = this.add.graphics();
        skipShadow.fillStyle(0x2485AB, 1);
        skipShadow.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2 + skipShadowOffsetY,
            buttonWidth,
            buttonHeight,
            16
        );
        skipShadow.setDepth(1999);
        
        // Background
        const skipBg = this.add.graphics();
        skipBg.fillStyle(0x35BBF0, 1);
        skipBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
        skipBg.setDepth(2000);
        
        // Text
        const skipText = this.add.text(0, 0, 'OVERSLAAN', {
            fontFamily: 'Bungee',
            fontSize: 50,
            color: '#ffffff',
        }).setOrigin(0, 0.5).setDepth(2001);

        // Shining effects
        const shineTopLeft = this.add.graphics();
        shineTopLeft.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft.fillRoundedRect(-buttonWidth / 2 +70, -buttonHeight / 2 -105, 16.844, 5.877, 3);
        shineTopLeft.rotation = -33.256 * (Math.PI / 180);
        const shineTopLeft2 = this.add.graphics();
        shineTopLeft2.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft2.fillRoundedRect(-buttonWidth / 2 +70, -buttonHeight / 2 -95, 9, 6, 3);
        shineTopLeft2.rotation = -33.256 * (Math.PI / 180);
        
        const shineBottomRight = this.add.graphics();
        shineBottomRight.fillStyle(0xFFFFFF, 0.4);
        shineBottomRight.fillRoundedRect(buttonWidth / 2 -80, buttonHeight / 2 + 100, 9, 6, 3);
        shineBottomRight.rotation = -33.256 * (Math.PI / 180);

        
        // Circle outline
        const skipCircle = this.add.graphics();
        skipCircle.lineStyle(8, 0xffffff, 1);
        skipCircle.strokeCircle(0, 0, circleRadius);
        skipCircle.setDepth(2002);
        
        // Circle fill
        const skipFill = this.add.graphics();
        skipFill.setDepth(2003);
        
        // Position elements
        const skipTotalWidth = circleRadius * 2 + gap + skipText.width + skipTextPadding * 2;
        skipCircle.x = -skipTotalWidth / 2 + circleRadius + skipTextPadding;
        skipCircle.y = 0;
        skipFill.x = skipCircle.x;
        skipFill.y = 0;
        skipText.x = skipCircle.x + circleRadius + gap;
        skipText.y = 0;
        
        // Container
        const skipButton = this.add.container(buttonX, buttonY, [skipShadow, skipBg,
            shineTopLeft,
            shineTopLeft2,
            shineBottomRight, skipCircle, skipFill, skipText]);
        skipButton.setSize(buttonWidth, buttonHeight);
        skipButton.setDepth(2000);
        skipButton.setInteractive({ useHandCursor: true });
        
        // Store references
        this.skipFill = skipFill;
        this.skipCircleRadius = circleRadius;
        this.animTargets = [skipBg, skipCircle, skipFill, skipText, shineTopLeft, shineTopLeft2, shineBottomRight];
        
        // Click handler
        skipButton.on('pointerdown', () => {
            this.scene.start('Game');
            const tropo = this.sound.get('troposfeer');
                    console.log('Shutting down MainMenu scene, stopping troposfeer sound if playing.', tropo);
                    if (tropo) {
                        tropo.stop();
                        tropo.destroy();
                    }
        });
    }

    // ==================== PROGRESS BAR ====================

    private drawProgressBar() {
        if (!this.progressBar) return;
        
        const barWidth = 600;
        const barHeight = 32;
        const barX = this.scale.width / 2 - barWidth / 2;
        const barY = 1050;
        const radius = 16;
        
        this.progressBar.clear();
        
        // Background
        this.progressBar.fillStyle(0xEDEDED, 1);
        this.progressBar.fillRoundedRect(barX, barY, barWidth, barHeight, radius);
        
        // Fill
        if (this.progress > 0) {
            const fillWidth = (barWidth - 30) * this.progress;
            this.progressBar.fillStyle(0x35BBF0, 1);
            this.progressBar.fillRoundedRect(barX, barY, fillWidth + 30, barHeight, radius);

            // Highlighted part (zoals GameOver)
            this.progressBar.fillStyle(0xffffff, 0.1);
            this.progressBar.fillRoundedRect(
                barX + 20,
                barY + 8,
                Math.max(0, fillWidth - 10),
                6,
                3
            );
        }

        // Border
        this.progressBar.strokeRoundedRect(barX, barY, barWidth, barHeight, radius);
        
        // Check completion
        if (this.progress >= 1) {
            this.scene.start('TutorialRed');
            
        }
    }

    // ==================== UPDATE METHODS ====================

    private updateSkipButton() {
        if (!this.skipFill) return;
        
        this.skipFill.clear();
        if (this.skipHoldProgress > 0) {
            this.skipFill.beginPath();
            this.skipFill.arc(
                0, 0, 
                this.skipCircleRadius - 2, 
                -Math.PI / 2, 
                -Math.PI / 2 + 2 * Math.PI * this.skipHoldProgress, 
                false
            );
            this.skipFill.lineTo(0, 0);
            this.skipFill.closePath();
            this.skipFill.fillStyle(0xffffff, 1);
            this.skipFill.fillPath();
        }
    }

    private handleButtonInput() {
        const buttonRaw = this.rotary?.buttonPressed;
        const buttonPressed = typeof buttonRaw === 'boolean' || typeof buttonRaw === 'number' ? !!buttonRaw : false;

        // Keyboard support: Enter or Space
        const enterKey = this.input.keyboard?.addKey('ENTER');
        const spaceKey = this.input.keyboard?.addKey('SPACE');
        const enterDown = !!(enterKey && enterKey.isDown);
        const spaceDown = !!(spaceKey && spaceKey.isDown);
        if (typeof this._keyboardWasDown !== 'boolean') (this as any)._keyboardWasDown = false;
        const keyboardDown: boolean = enterDown || spaceDown;

        // --- Rotary button logic ---
        if (this.sceneIsReady && buttonPressed && !this.wasButtonPressed && !this.skipButtonIsDown && !this.isTransitioning) {
            this.skipButtonIsDown = true;
            this.skipHoldSource = 'rotary';
            if (this.skipHoldStart === null) {
                this.skipHoldStart = Date.now();
            }
            if (this.skipButtonTween) this.skipButtonTween.stop();
            this.skipButtonTween = this.tweens.add({
                targets: this.animTargets,
                y: 8,
                duration: 80,
                yoyo: false
            });
        }
        if (this.sceneIsReady && !buttonPressed && this.wasButtonPressed && !this.isTransitioning && this.skipHoldSource === 'rotary') {
            this.skipButtonIsDown = false;
            this.skipHoldStart = null;
            this.skipHoldProgress = 0;
            this.skipHoldSource = null;
            if (this.skipButtonTween) this.skipButtonTween.stop();
            this.skipButtonTween = this.tweens.add({
                targets: this.animTargets,
                y: 0,
                duration: 80,
                yoyo: false
            });
        }
        this.wasButtonPressed = buttonPressed;

        // --- Keyboard logic ---
        if (this.sceneIsReady && keyboardDown && !this._keyboardWasDown && !this.skipButtonIsDown && !this.isTransitioning) {
            this.skipButtonIsDown = true;
            this.skipHoldSource = 'keyboard';
            if (this.skipHoldStart === null) {
                this.skipHoldStart = Date.now();
            }
            if (this.skipButtonTween) this.skipButtonTween.stop();
            this.skipButtonTween = this.tweens.add({
                targets: this.animTargets,
                y: 8,
                duration: 80,
                yoyo: false
            });
        }
        if (this.sceneIsReady && !keyboardDown && this._keyboardWasDown && !this.isTransitioning && this.skipHoldSource === 'keyboard') {
            this.skipButtonIsDown = false;
            this.skipHoldStart = null;
            this.skipHoldProgress = 0;
            this.skipHoldSource = null;
            if (this.skipButtonTween) this.skipButtonTween.stop();
            this.skipButtonTween = this.tweens.add({
                targets: this.animTargets,
                y: 0,
                duration: 80,
                yoyo: false
            });
        }
        (this as any)._keyboardWasDown = keyboardDown;

        // Check hold progress (alleen als sceneIsReady)
        if (this.sceneIsReady && this.skipHoldStart !== null && !this.isTransitioning) {
            const elapsed = Date.now() - this.skipHoldStart;
            this.skipHoldProgress = Math.min(1, elapsed / 2800);

            if (this.skipHoldProgress >= 1) {
                this.isTransitioning = true;
                this.skipHoldStart = null;
                this.skipButtonIsDown = false;
                if (this.skipButtonTween) this.skipButtonTween.stop();
                this.sound.play('button-click');
                const tropo = this.sound.get('troposfeer');
                console.log('---------------------------')
                console.log('Shutting down MainMenu scene, stopping troposfeer sound if playing.', tropo);
                if (tropo) {
                    tropo.stop();
                    tropo.destroy();
                }
                this.scene.start('Game');
            }
        } else if (!this.isTransitioning) {
            this.skipHoldProgress = 0;
        }
    }

    private updateInactivePropellorShake() {
        // Check if inactive propellor should shake
        if (this.rotary && this.rotary.lastAngles && this.rotary.lastAngles.length > 1) {
            const angle2 = this.rotary.lastAngles[1];
            if (typeof angle2 === 'number' && this.lastAngle2 !== undefined) {
                const angle2Delta = angle2 - this.lastAngle2;
                if (Math.abs(angle2Delta) >= 2) {
                    // Start shake alleen als timer exact 0 is (laat uitspelen)
                    if (this.inactiveShakeTimer === 0) {
                        this.inactiveShakeTimer = 16; // langer voor volledige heen-en-weer
                        this.inactiveShakeDirection = Math.sign(angle2Delta) || 1;
                    }
                }
            }
            this.lastAngle2 = angle2;
        }
        
        // Apply shake animation
        if (this.inactivePropellor) {
            if (this.inactiveShakeTimer > 0) {
                // Shake: heen en weer, niet resetten bij nieuwe data
                // 0 -> links, midden -> rechts, einde -> terug naar 0
                const totalFrames = 16;
                const progress = 1 - (this.inactiveShakeTimer / totalFrames);
                // Ease in-out
                const eased = Math.sin(progress * Math.PI);
                this.inactivePropellor.rotation = eased * 0.25 * this.inactiveShakeDirection;
                this.inactiveShakeTimer--;
            } else {
                this.inactivePropellor.rotation = 0;
            }
        }
    }

    private updateArrowsRotation() {
        if (this.arrows) {
            this.arrows.rotation -= 0.05;
        }
    }

    private updateActivePropellorRotation() {
        if (!this.activePropellor || !this.rotary || !Array.isArray(this.rotary.lastAngles)) return;
        
        const angle1 = this.rotary.lastAngles[0];
        if (typeof angle1 === 'number' && this.lastAngle1 !== null && angle1 !== this.lastAngle1) {
            const deltaStep = angle1 - this.lastAngle1;
            if (Math.abs(deltaStep) >= 2) {
                this.activePropellor.rotation += Math.sign(deltaStep) * 0.15;
            }
        }
    }

    private updateBalloonMovement() {
        // Rotary input
        let rotaryDelta = 0;
        if (this.rotary && Array.isArray(this.rotary.lastAngles)) {
            const angle1 = this.rotary.lastAngles[0];
            if (typeof angle1 === 'number') {
                if (this.startAngle1 === null) {
                    this.startAngle1 = angle1;
                    this.lastAngle1 = angle1;
                } else if (this.lastAngle1 !== null && angle1 !== this.lastAngle1) {
                    const deltaStep = angle1 - this.lastAngle1;
                    if (Math.abs(deltaStep) >= 2 && Math.abs(deltaStep) < 50) {
                        rotaryDelta = Math.sign(deltaStep) * Math.min(Math.abs(deltaStep), 10);
                        this.didRotateThisFrame = true;
                        this.totalDelta += Math.abs(deltaStep);
                        this.progress = Math.min(1, this.totalDelta / 2000);
                        this.drawProgressBar();
                    } else {
                        this.didRotateThisFrame = false;
                    }
                    this.lastAngle1 = angle1;
                }
            }
        }

        // Keyboard pijltjes
        let keyboardDelta = 0;
        const cursors = this.input.keyboard?.createCursorKeys();
        if (cursors) {
            // Alleen naar rechts (blauw) toegestaan
            if (cursors.right.isDown) {
                keyboardDelta = 8;
            }
        }

        // Combineer input
        let totalDelta = rotaryDelta + keyboardDelta;
        if (totalDelta !== 0) {
            this.didRotateThisFrame = true;
            // Move balloon
            const balloonStartX = 280;
            const balloonEndX = this.scale.width - 280;
            if (!this.progress) this.progress = 0;
            // Simuleer progressie bij keyboard input
            if (keyboardDelta !== 0) {
                this.progress = Math.min(1, Math.max(0, this.progress + keyboardDelta / (balloonEndX - balloonStartX)));
                this.drawProgressBar();
            }
            this.balloon.x = balloonStartX + (balloonEndX - balloonStartX) * this.progress;
        } else {
            this.didRotateThisFrame = false;
        }
    }

    private updatePropellorAnimations() {
        const shouldSpin = this.didRotateThisFrame;
        
        // PropellorBlauw: speel altijd 1x af bij nieuwe draai (en alleen dan)
        if (shouldSpin) {
            if (this.propellorBlauw && !this.propellorBlauw.anims.isPlaying) {
                this.propellorBlauw.play({ key: 'propellor-blauw', repeat: 0 });
                this.propellorBlauw.once('animationcomplete', () => {
                    if (this.propellorBlauw && this.propellorBlauw.anims.currentAnim && this.propellorBlauw.anims.currentAnim.frames.length > 0) {
                        this.propellorBlauw.anims.pause(this.propellorBlauw.anims.currentAnim.frames[0]);
                    }
                });
            }
        } else {
            if (this.propellorBlauw && !this.propellorBlauw.anims.isPlaying && this.propellorBlauw.anims.currentAnim && this.propellorBlauw.anims.currentAnim.frames.length > 0) {
                this.propellorBlauw.anims.pause(this.propellorBlauw.anims.currentAnim.frames[0]);
            }
        }
        
        // PropellorRood: altijd gepauzeerd
        if (this.propellorRood) {
            if (this.propellorRood.anims.currentAnim && this.propellorRood.anims.currentAnim.frames.length > 0) {
                this.propellorRood.anims.pause(this.propellorRood.anims.currentAnim.frames[0]);
            }
        }
    }

    private updateWindEffect() {
        const shouldTrigger = this.didRotateThisFrame;
        
        if (shouldTrigger && !this.windBlauw && this.balloon) {
            this.windBlauw = this.add.sprite(
                this.balloon.x + this.propellorOffsetX - 50,
                this.balloon.y + this.propellorOffsetY,
                'wind-blauw'
            ).setDepth(1002).setScale(0.4);
            this.sound.play('wind', { volume: 0.1 });

            this.windBlauw.play({ key: 'wind-blauw', repeat: 0 });
            this.windBlauw.once('animationcomplete', () => {
                if (this.windBlauw) {
                    this.windBlauw.destroy();
                    this.windBlauw = null;
                }
            });
        }
        
        // Update wind position if it exists
        if (this.windBlauw && this.windBlauw.active) {
            this.windBlauw.x = this.balloon.x + this.propellorOffsetX - 50;
            this.windBlauw.y = this.balloon.y + this.propellorOffsetY;
        }
    }

    private updatePropellorPositions() {
        if (!this.balloon || !this.propellorBlauw || !this.propellorRood) return;
        
        this.propellorBlauw.x = this.balloon.x + this.propellorOffsetX;
        this.propellorBlauw.y = this.balloon.y + this.propellorOffsetY;
        
        this.propellorRood.x = this.balloon.x + this.propellorOffsetX + 77;
        this.propellorRood.y = this.balloon.y + this.propellorOffsetY;
    }

    
}
