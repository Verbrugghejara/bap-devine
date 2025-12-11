import { GameObjects, Scene } from "phaser";
const VICTORY_SWIPE_DURATION = 1400;
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { emit } from "process";
import { sfeerProgress } from "../utils/sfeerProgressStore";
import { getRotaryClient } from "../utils/rotaryClientSingleton";


export class GameVictory extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;
    private hasSwipedIn: boolean = false;
    private autoNavigateTimeout: ReturnType<typeof setTimeout> | null = null;
    private timeoutStarted: boolean = false;
    private rotary: any = null;
    private wasButtonPressed: boolean = false;

    constructor() {
        super('GameVictory');
    }

    create() {
                this.rotary = getRotaryClient();
                console.log('GameVictory create() called, timeoutStarted:', this.timeoutStarted);
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
                        console.log('Stopping GameVictory and starting MainMenu');
                        this.scene.stop('Game');
                        this.scene.stop('GameVictory');
                        this.scene.start('MainMenu');
                    }, 30000);
                }
        
        const victoryContainer = this.add.container(0, -this.scale.height);
        victoryContainer.setDepth(9999);
        if (this.hasSwipedIn) {
            victoryContainer.y = 0;
        }
        
        const bgVictory = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg-gamevictory')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(1);
        victoryContainer.add(bgVictory);
        
        // Black overlay on top of background (starts invisible)
        const blackOverlayTop = this.add.graphics();
        blackOverlayTop.fillStyle(0x000000, 0.25);
        blackOverlayTop.fillRect(0, 0, this.scale.width, this.scale.height);
        blackOverlayTop.setDepth(8);
        blackOverlayTop.setAlpha(0);
        victoryContainer.add(blackOverlayTop);
        
        // Title container
        const titleContainer = this.add.container(this.scale.width / 2, this.scale.height / 4 - 150);
        titleContainer.setAlpha(0);
        titleContainer.setDepth(10);
        
        const titleBg = this.add.graphics();
        titleBg.fillStyle(Number('0x' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0')), 1);
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
            'GOED ZO!',
            {
                fontFamily: 'Bungee',
                fontSize: 80,
                color: '#fff',
            }
        )
            .setOrigin(0.5)
            .setDepth(10);
        
        titleContainer.add([titleBg, this.title]);
        victoryContainer.add(titleContainer);

        this.description = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 +100,
            'Yes! De alien is veilig thuis!\nWat een topteam!',
            {
                fontFamily: 'Space Grotesk',
                fontSize: 56,
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: 900 }
            }
        )
            .setOrigin(0.5)
            .setDepth(11)
            .setAlpha(0);
        victoryContainer.add(this.description);

        let durationMs = 0;
        if (typeof window !== 'undefined' && (window as any).gameDurationMs) {
            durationMs = (window as any).gameDurationMs;
        }
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // Timer display (commented out)
        // const ms = durationMs % 1000;
        // const msHundredths = Math.floor(ms / 10).toString().padStart(2, '0');
        // const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${msHundredths}`;

        // const iconKey = 'timer';
        // const timeText = this.add.text(0, 0, `${formattedTime}`, {
        //     fontFamily: 'Bungee',
        //     fontSize: 80,
        //     color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        //     fontStyle: 'bold',
        //     align: 'center',
        // }).setOrigin(0, 0.5).setDepth(10).setShadow(0, 4, '#00000075', 0, false, true);
        // let iconSprite: Phaser.GameObjects.Image | null = null;
        // let groupWidth = timeText.width;
        // const timeIconMargin = 16;
        // if (this.textures.exists(iconKey)) {
        //     iconSprite = this.add.image(0, 0, iconKey).setOrigin(0, 0.5).setDisplaySize(80, 80).setDepth(10);
        //     groupWidth += iconSprite.displayWidth + timeIconMargin;
        // }
        // const groupX = this.scale.width / 2 - groupWidth / 2;
        // const groupY = this.scale.height / 4 + 100;
        // if (iconSprite) {
        //     iconSprite.setPosition(groupX, groupY);
        //     timeText.setPosition(groupX + iconSprite.displayWidth + timeIconMargin, groupY);
        //     victoryContainer.add(iconSprite);
        // } else {
        //     timeText.setPosition(this.scale.width / 2 - timeText.width / 2, groupY);
        // }
        // victoryContainer.add(timeText);
        
        // Leaderboard container
        const leaderboardWidth = 520;
        const leaderboardHeight = 200;
        const leaderboardY = this.scale.height / 2 - 100;
        
        // Create container for entire leaderboard
        const leaderboardContainer = this.add.container(this.scale.width / 2, leaderboardY);
        leaderboardContainer.setAlpha(0);
        leaderboardContainer.setDepth(12);
        
        // Background
        const leaderboardBg = this.add.graphics();
        leaderboardBg.fillStyle(0xffffff, 1);
        leaderboardBg.fillRoundedRect(
            -leaderboardWidth / 2,
            -leaderboardHeight / 2,
            leaderboardWidth,
            leaderboardHeight,
            16
        );
        leaderboardContainer.add(leaderboardBg);
        
        // Row 1 - JIJ
        const row1Y = -50;
        const iconStartX = -leaderboardWidth / 2 + 60;
        const nameX = iconStartX + 120;
        const timeXRight = leaderboardWidth / 2 - 60;
        
        // Trophy icon for JIJ
        const trophyIcon1 = this.add.image(iconStartX, row1Y, 'winner')
            .setOrigin(0.5)
            .setScale(0.8);
        leaderboardContainer.add(trophyIcon1);
        
        // Alien icon for JIJ
        const alienIcon1 = this.add.image(iconStartX + 80, row1Y, 'alien')
            .setOrigin(0.5)
            .setScale(0.3);
        leaderboardContainer.add(alienIcon1);
        
        // Name JIJ
        const name1 = this.add.text(nameX, row1Y, 'JIJ', {
            fontFamily: 'Bungee',
            fontSize: 40,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        }).setOrigin(0, 0.5);
        leaderboardContainer.add(name1);
        
        // Time 1:23
        const time1 = this.add.text(timeXRight, row1Y, `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, {
            fontFamily: 'Bungee',
            fontSize: 40,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        }).setOrigin(1, 0.5);
        leaderboardContainer.add(time1);
        
        // Row 2 - ANDERE
        const row2Y = 50;
        const nameX2 = iconStartX + 60;
        
        // Trophy icon for ANDERE
        const trophyIcon2 = this.add.image(iconStartX, row2Y, 'second')
            .setOrigin(0.5)
            .setScale(0.8);
        leaderboardContainer.add(trophyIcon2);
        
        // Name ANDERE
        const name2 = this.add.text(nameX2, row2Y, 'ANDERE', {
            fontFamily: 'Bungee',
            fontSize: 40,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        }).setOrigin(0, 0.5);
        leaderboardContainer.add(name2);
        
        // Time 2:41
        const time2 = this.add.text(timeXRight, row2Y, '2:41', {
            fontFamily: 'Bungee',
            fontSize: 40,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        }).setOrigin(1, 0.5);
        leaderboardContainer.add(time2);
        
        victoryContainer.add(leaderboardContainer);
        
        this.tweens.add({
            targets: victoryContainer,
            y: 0,
            duration: VICTORY_SWIPE_DURATION,
            ease: 'Cubic.easeOut',
            onStart: () => {
                if (!this.hasSwipedIn) {
                    this.hasSwipedIn = true;
                    EventBus.emit('victory-swipe-in');
                }
            },
            onComplete: () => {
                victoryContainer.y = 0;
                this.scene.stop('Game');
                
                // After 2 seconds, fade in black overlay
                this.time.delayedCall(1000, () => {
                    // Fade in black overlay
                    this.tweens.add({
                        targets: blackOverlayTop,
                        alpha: 1,
                        duration: 800,
                        ease: 'Cubic.Out',
                        onComplete: () => {
                            // Pop in elements one by one
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
                            
                            // Leaderboard
                            this.time.delayedCall(popDelay * 2, () => {
                                this.tweens.add({
                                    targets: leaderboardContainer,
                                    alpha: 1,
                                    scale: { from: 0.7, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });
                            
                            // Button
                            this.time.delayedCall(popDelay * 3, () => {
                                this.tweens.add({
                                    targets: [this.againButton, this.againText],
                                    alpha: 1,
                                    scale: { from: 0.8, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
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
            fontSize: '40px',
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
        shineTopLeft.fillRoundedRect(-btnWidth / 2 +45, -btnHeight / 2 -60, 16.844, 5.877, 3);
        shineTopLeft.rotation = -33.256 * (Math.PI / 180);
        const shineTopLeft2 = this.add.graphics();
        shineTopLeft2.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft2.fillRoundedRect(-btnWidth / 2 +45, -btnHeight / 2 -50, 9, 6, 3);
        shineTopLeft2.rotation = -33.256 * (Math.PI / 180);
        
        const shineBottomRight = this.add.graphics();
        shineBottomRight.fillStyle(0xFFFFFF, 0.4);
        shineBottomRight.fillRoundedRect(btnWidth / 2 -60, btnHeight / 2 + 50, 9, 6, 3);
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

        // Button en tekst positie onderaan victoryContainer
        const buttonY = this.scale.height / 2 + 200;
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
        victoryContainer.add(this.againButton);

        this.againText = this.add.text(
            this.scale.width / 2,
            buttonY,
            'Opnieuw proberen?',
            {
                fontFamily: 'Space Grotesk',
                fontSize: 40,
                color: '#FFFFFF',
                fontStyle: '500'
            }
        )
            .setOrigin(0.5)
            .setDepth(50)
            .setAlpha(0);
        victoryContainer.add(this.againText);

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
                    this.scene.stop('GameVictory');
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
                    this.scene.stop('GameVictory');
                    this.scene.start('Game');
                }
            });
        }
        
        this.wasButtonPressed = buttonPressed;
    }

    shutdown() {
        console.log('GameVictory shutdown() called');
        if (this.autoNavigateTimeout) {
            clearTimeout(this.autoNavigateTimeout);
            this.autoNavigateTimeout = null;
        }
        this.timeoutStarted = false;
    }
}