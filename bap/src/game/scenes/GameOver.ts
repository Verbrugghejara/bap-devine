import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { getRotaryClient } from "../utils/rotaryClientSingleton";



export class GameOver extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;
    sfeerNaamText: GameObjects.Text;
    private autoNavigateTimeout: ReturnType<typeof setTimeout> | null = null;
    private timeoutStarted: boolean = false;
    private rotary: any = null;
    private wasButtonPressed: boolean = false;
    private hasSwipedIn: boolean = false;

    constructor() {
        super('GameOver');
    }

    create() {
                this.rotary = getRotaryClient();
                console.log('GameOver create() called, timeoutStarted:', this.timeoutStarted);
                // Only set timeout once
                if (!this.timeoutStarted) {
                    this.timeoutStarted = true;
                    console.log('Setting up 30s timeout for first time');
                    
                    this.autoNavigateTimeout = setTimeout(() => {
                        console.log('30 seconds passed! Navigating to MainMenu now...');
                        if (this.autoNavigateTimeout) {
                            clearTimeout(this.autoNavigateTimeout);
                            this.autoNavigateTimeout = null;
                        }
                        this.timeoutStarted = false;
                        console.log('Stopping GameOver and starting MainMenu');
                        this.scene.stop('Game');
                        this.scene.stop('GameOver');
                        this.scene.start('MainMenu');
                    }, 60000);
                }
        
        // Swipe-in: identiek aan Game swipe-out, start onderaan beeld en beweeg naar y=0
        const GAMEOVER_SWIPE_DURATION = 1400; // Match Game.ts
        const gameoverContainer = this.add.container(0, this.scale.height);
        gameoverContainer.setDepth(9999);

        
        
        const bgGameOver = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg-gameover')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(1);
        gameoverContainer.add(bgGameOver);
        
        // Black overlay on top of background (starts invisible)
        const blackOverlayTop = this.add.graphics();
        blackOverlayTop.fillStyle(0x000000, 0.25);
        blackOverlayTop.fillRect(0, 0, this.scale.width, this.scale.height);
        blackOverlayTop.setDepth(8);
        blackOverlayTop.setAlpha(0);
        gameoverContainer.add(blackOverlayTop);
        
        // Title container
        const titleContainer = this.add.container(this.scale.width / 2, this.scale.height / 4 - 250);
        titleContainer.setAlpha(0);
        titleContainer.setDepth(10);
        
        const titleBg = this.add.graphics();
        titleBg.fillStyle(Number('0x' + SFEER_LABELS[1].colors.d.toString(16).padStart(6, '0')), 1);
        titleBg.fillRoundedRect(
            -520 / 2,
            -160 / 2,
            520,
            160,
            16
        );
        titleBg.setDepth(9);
        
        this.title = this.add.text(
            0,
            0,
            'GAME OVER',
            {
                fontFamily: 'Bungee',
                fontSize: 80,
                color: '#fff',
            }
        )
            .setOrigin(0.5)
            .setDepth(10);
        
        titleContainer.add([titleBg, this.title]);
        gameoverContainer.add(titleContainer);

        // Bepaal behaalde sfeer op basis van progress
        let currentProgress = 0;
        if (typeof window !== 'undefined' && (window as any).sfeerProgress !== undefined) {
            currentProgress = (window as any).sfeerProgress;
        }
        // Sfeergrenzen bepalen

        let sfeerIndex = 0;
        if (Array.isArray(SFEER_LABELS) && SFEER_LABELS.length > 0) {
            // Simuleer de progressiegrenzen zoals in Game.ts
            // We nemen aan: 0-0.2 troposfeer, 0.2-0.4 stratosfeer, 0.4-0.6 mesosfeer, 0.6-0.8 thermosfeer, 0.8-1 exosfeer
            const grenzen = [0, 0.2, 0.4, 0.6, 0.8, 1.01];
            for (let i = 0; i < grenzen.length - 1; i++) {
                if (
                    (currentProgress >= grenzen[i] && currentProgress < grenzen[i + 1]) ||
                    (i === grenzen.length - 2 && currentProgress >= grenzen[i]) // for progress == 1
                ) {
                    sfeerIndex = i;
                    break;
                }
            }
        }
        const sfeerNaam = SFEER_LABELS[sfeerIndex]?.naam || 'troposfeer';
        this.description = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 80,
            `Je behaalde de`,
            {
                fontFamily: 'nunito',
                fontSize: 56,
                color: '#ffffff' ,
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: 900 }
            }
        )
            .setOrigin(0.5)
            .setDepth(11)
            .setAlpha(0);
        gameoverContainer.add(this.description);
        console.log('GameOver sfeerIndex:', sfeerIndex, 'sfeerNaam:', sfeerNaam);

        // Sfeer naam los eronder (nu na declaratie sfeerNaam)
        this.sfeerNaamText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4,
            sfeerNaam,
            {
                fontFamily: 'Bungee',
                fontSize: 64,
                color: '#' + SFEER_LABELS[sfeerIndex].colors.d.toString(16).padStart(6, '0'),
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: 900 }
            }
        )
            .setOrigin(0.5)
            .setDepth(12)
            .setAlpha(0);
        gameoverContainer.add(this.sfeerNaamText);

        let durationMs = 0;
        if (typeof window !== 'undefined' && (window as any).gameDurationMs) {
            durationMs = (window as any).gameDurationMs;
        }
        const sfeerProgressY = this.scale.height / 4 + 200;
        const sfeerProgressContainer = this.add.container(this.scale.width / 2, sfeerProgressY);
        sfeerProgressContainer.setAlpha(0);
        sfeerProgressContainer.setDepth(12);

        const sfeerProgressWidth = 800;
        const sfeerProgressHeight = 80;
        const sfeerProgressBg = this.add.graphics();
        sfeerProgressBg.fillStyle(0xffffff, 1);
        sfeerProgressBg.fillRoundedRect(
            -sfeerProgressWidth / 2,
            -sfeerProgressHeight / 2,
            sfeerProgressWidth,
            sfeerProgressHeight,
            40
        );
        sfeerProgressContainer.add(sfeerProgressBg);
        
        // currentProgress is already declared above and set from window.sfeerProgress
        
        // Progress fill
        const progressFillWidth = (sfeerProgressWidth - 20) * currentProgress;
        if (currentProgress > 0) {
            // Gray background first (behind the colored fill)
            const progressFillbg = this.add.graphics();
            progressFillbg.fillStyle(0xEDEDED);
            progressFillbg.fillRoundedRect(
                -sfeerProgressWidth / 2 + 10,
                -sfeerProgressHeight / 2 + 10,
                sfeerProgressWidth - 20,
                sfeerProgressHeight - 20,
                30
            );
            sfeerProgressContainer.add(progressFillbg);
            
            // Colored progress fill on top
            const progressFill = this.add.graphics();
            progressFill.fillStyle(0x008049);
            progressFill.fillRoundedRect(
                -sfeerProgressWidth / 2 + 10,
                -sfeerProgressHeight / 2 + 10,
                progressFillWidth,
                sfeerProgressHeight - 20,
                30
            );
            sfeerProgressContainer.add(progressFill);
            // highlighted part
            const progressHighlight = this.add.graphics();
            progressHighlight.fillStyle(0xffffff,0.25);
            progressHighlight.fillRoundedRect(
                -sfeerProgressWidth / 2 + 30,
                -sfeerProgressHeight / 2 + 20,
                progressFillWidth -80,
                8,
                4
            );
            sfeerProgressContainer.add(progressHighlight);
            
            // Add alien icon at the end of progress bar with rounded rectangle background
            if (this.textures.exists('alien')) {
                const alienSize = 112;
                const alienBg = this.add.graphics();
                alienBg.fillStyle(0xffffff, 1);
                alienBg.fillRoundedRect(
                    -sfeerProgressWidth / 2 + 10 + progressFillWidth - alienSize / 2,
                    -alienSize / 2,
                    alienSize,
                    alienSize,
                    16
                );
                sfeerProgressContainer.add(alienBg);
                
                const alienIcon = this.add.image(
                    -sfeerProgressWidth / 2 + 10 + progressFillWidth,
                    0,
                    'alien'
                ).setOrigin(0.5).setScale(0.6);
                sfeerProgressContainer.add(alienIcon);
            }
        }
        
        gameoverContainer.add(sfeerProgressContainer);
        
        // Distance text below progress bar
        const meters = Math.round(currentProgress * 1000);
        const distanceText = this.add.text(
            this.scale.width / 2,
            sfeerProgressY + 120,
            `${meters} METER`,
            {
                fontFamily: 'Bungee',
                fontSize: 64,
                color: '#FFFFFF',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5).setDepth(12).setAlpha(0);
        gameoverContainer.add(distanceText);
        
        // Swipe-in animatie van onder naar boven
        this.tweens.add({
            targets: gameoverContainer,
            y: 0,
            duration: GAMEOVER_SWIPE_DURATION,
            ease: 'Cubic.easeOut',
            onStart: () => {
                if (!this.hasSwipedIn) {
                    this.hasSwipedIn = true;
                    EventBus.emit('gameover-swipe-in');
                }
            },
            onComplete: () => {
                gameoverContainer.y = 0;
                // Fade-in black overlay en pop-in elementen (zoals Victory)
                this.time.delayedCall(500, () => {
                    this.tweens.add({
                        targets: blackOverlayTop,
                        alpha: 1,
                        duration: 1200,
                        ease: 'Cubic.easeInOut',
                        onComplete: () => {
                            const popDuration = 500;
                            const popDelay = 150;
                            // Title
                            this.tweens.add({
                                targets: titleContainer,
                                alpha: 1,
                                scale: { from: 0.8, to: 1 },
                                duration: popDuration,
                                ease: 'Back.easeOut'
                            });
                            // Description
                            this.time.delayedCall(popDelay, () => {
                                this.tweens.add({
                                    targets: this.description,
                                    alpha: 1,
                                    scale: { from: 0.8, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });
                            // Sfeer naam
                            this.time.delayedCall(popDelay * 2, () => {
                                this.tweens.add({
                                    targets: this.sfeerNaamText,
                                    alpha: 1,
                                    scale: { from: 0.8, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });
                            // Progress bar
                            this.time.delayedCall(popDelay * 3, () => {
                                this.tweens.add({
                                    targets: [sfeerProgressContainer, distanceText],
                                    alpha: 1,
                                    scale: { from: 0.7, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });
                            // Button
                            this.time.delayedCall(popDelay * 4, () => {
                                this.tweens.add({
                                    targets: [this.againButton, this.againText],
                                    alpha: 1,
                                    scale: { from: 0.8, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });
                            // Stop Game pas na alle animaties
                            this.time.delayedCall(popDelay * 5, () => {
                                this.scene.stop('Game');
                            });
                        }
                    });
                });
            }
        });

        const paddingX = 24;
        const paddingY = 16;
        const startText = this.add.text(0, 0, 'Opnieuw', {
            fontFamily: 'Bungee',
            fontSize: '64px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5).setDepth(50);

        const circleSize = 44;
        const iconMargin = 12;

        const btnContentWidth = circleSize + iconMargin + startText.width;
        const btnWidth = btnContentWidth + 2 * paddingX;
        const btnHeight = startText.height + 2 * paddingY;


        const shadowOffsetY = 8;
        const shadow = this.add.graphics();
        shadow.fillStyle(0xB68302, 1);
        shadow.fillRoundedRect(
            -btnWidth / 2,
            -btnHeight / 2 + shadowOffsetY,
            btnWidth,
            btnHeight,
            16
        );

        const bg = this.add.graphics();
        bg.fillStyle(0xFFB703);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 16);

        // Shining effects
        const shineTopLeft = this.add.graphics();
        shineTopLeft.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft.fillRoundedRect(-btnWidth / 2 +55, -btnHeight / 2 -90, 16.844, 5.877, 3);
        shineTopLeft.rotation = -33.256 * (Math.PI / 180);
        const shineTopLeft2 = this.add.graphics();
        shineTopLeft2.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft2.fillRoundedRect(-btnWidth / 2 +55, -btnHeight / 2 -80, 9, 6, 3);
        shineTopLeft2.rotation = -33.256 * (Math.PI / 180);
        
        const shineBottomRight = this.add.graphics();
        shineBottomRight.fillStyle(0xFFFFFF, 0.4);
        shineBottomRight.fillRoundedRect(btnWidth / 2 -65, btnHeight / 2 + 85, 9, 6, 3);
        shineBottomRight.rotation = -33.256 * (Math.PI / 180);

        const circleRadius = circleSize / 3;
        const contentWidth = circleRadius * 2 + iconMargin + startText.width;
        const contentStartX = -contentWidth / 2;
        const circleY = 0;
        const circleX = contentStartX + circleRadius;
        const textX = circleX + circleRadius + iconMargin + startText.width / 2;
        const circle = this.add.graphics();
        circle.lineStyle(6, 0xffffff, 1);
        circle.strokeCircle(circleX, circleY, circleRadius);
        startText.setX(textX);
        startText.setY(0);

        // Button en tekst positie onderaan gameoverContainer
        const buttonY = this.scale.height / 2;
        this.againButton = this.add.container(this.scale.width / 2, buttonY +100, [
            shadow,
            bg,
            shineTopLeft,
            shineTopLeft2,
            shineBottomRight,
            circle,
            startText
        ]);
        this.againButton.setSize(btnWidth, btnHeight);
        this.againButton.setDepth(1100);
        this.againButton.setInteractive({ useHandCursor: true });
        this.againButton.setAlpha(0);
        gameoverContainer.add(this.againButton);

        this.againText = this.add.text(
            this.scale.width / 2,
            buttonY,
            'Opnieuw proberen?',
            {
                fontFamily: 'Nunito',
                fontSize: 40,
                color: '#FFFFFF',
                fontStyle: '500'
            }
        )
            .setOrigin(0.5)
            .setDepth(50)
            .setAlpha(0);
        gameoverContainer.add(this.againText);

        const triggerButton = () => {
            // Clear the auto-navigate timeout
            if (this.autoNavigateTimeout) {
                clearTimeout(this.autoNavigateTimeout);
                this.autoNavigateTimeout = null;
            }
            this.timeoutStarted = false;
            
            const bg = this.againButton.list[1];
            const circle = this.againButton.list[4];
            const startText = this.againButton.list[5];
            this.tweens.add({
                targets: [bg, circle, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    if (typeof window !== 'undefined') {
                        (window as any).sfeerProgress = 0;
                    }
                    EventBus.emit('update-health', 3);
                    EventBus.emit('show-gameui');
                    this.scene.stop('GameOver');
                    this.scene.start('Game');
                }
            });
        };
        this.againButton.on('pointerdown', () => {
            triggerButton();
        });
    }

    update() {
        // Check hardware button press
        const buttonPressed = this.rotary?.buttonPressed || false;
        
        if (buttonPressed && !this.wasButtonPressed) {
            // Clear the auto-navigate timeout
            if (this.autoNavigateTimeout) {
                clearTimeout(this.autoNavigateTimeout);
                this.autoNavigateTimeout = null;
            }
            this.timeoutStarted = false;
            
            const bg = this.againButton.list[1];
            const circle = this.againButton.list[4];
            const startText = this.againButton.list[5];
            this.tweens.add({
                targets: [bg, circle, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    if (typeof window !== 'undefined') {
                        (window as any).sfeerProgress = 0;
                    }
                    EventBus.emit('update-health', 3);
                    EventBus.emit('show-gameui');
                    this.scene.stop('GameOver');
                    this.scene.start('Game');
                }
            });
        }
        
        this.wasButtonPressed = buttonPressed;
    }

    shutdown() {
        console.log('GameOver shutdown() called');
        if (this.autoNavigateTimeout) {
            clearTimeout(this.autoNavigateTimeout);
            this.autoNavigateTimeout = null;
        }
        this.timeoutStarted = false;
    }
}