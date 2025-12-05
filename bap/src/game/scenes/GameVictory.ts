import { GameObjects, Scene } from "phaser";
const VICTORY_SWIPE_DURATION = 1400;
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { emit } from "process";
import { sfeerProgress } from "../utils/sfeerProgressStore";


export class GameVictory extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;
    private hasSwipedIn: boolean = false;
    private autoNavigateTimeout: ReturnType<typeof setTimeout> | null = null;
    private timeoutStarted: boolean = false;

    constructor() {
        super('GameVictory');
    }

    create() {
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
        const bgVictory = this.add.image(this.scale.width / 2, 0, 'bg-gamevictory').setOrigin(0.5, 0).setDepth(1);
        victoryContainer.add(bgVictory);
        this.title = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 300,
            'Goed zo',
            {
                fontFamily: 'Bungee',
                fontSize: 80,
                color: '#' + SFEER_LABELS[3].colors.e.toString(16).padStart(6, '0').toUpperCase(),
            }
        )
            .setOrigin(0.5)
            .setDepth(10)
            .setShadow(0, 6, '#2A292C', 0, false, true);
        victoryContainer.add(this.title);

        this.description = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 150,
            'Yes! De alien is veilig thuis!\nWat een topteam!',
            {
                fontFamily: 'Space Grotesk',
                fontSize: 56,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: 900 }
            }
        )
            .setOrigin(0.5)
            .setDepth(10);
        victoryContainer.add(this.description);

        let durationMs = 0;
        if (typeof window !== 'undefined' && (window as any).gameDurationMs) {
            durationMs = (window as any).gameDurationMs;
        }
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = durationMs % 1000;
        const msHundredths = Math.floor(ms / 10).toString().padStart(2, '0');
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${msHundredths}`;

        const iconKey = 'timer';
        const timeText = this.add.text(0, 0, `${formattedTime}`, {
            fontFamily: 'Bungee',
            fontSize: 80,
            color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
            fontStyle: 'bold',
            align: 'center',
        }).setOrigin(0, 0.5).setDepth(10).setShadow(0, 4, '#00000075', 0, false, true);
        let iconSprite: Phaser.GameObjects.Image | null = null;
        let groupWidth = timeText.width;
        const timeIconMargin = 16;
        if (this.textures.exists(iconKey)) {
            iconSprite = this.add.image(0, 0, iconKey).setOrigin(0, 0.5).setDisplaySize(80, 80).setDepth(10);
            groupWidth += iconSprite.displayWidth + timeIconMargin;
        }
        const groupX = this.scale.width / 2 - groupWidth / 2;
        const groupY = this.scale.height / 4 + 100;
        if (iconSprite) {
            iconSprite.setPosition(groupX, groupY);
            timeText.setPosition(groupX + iconSprite.displayWidth + timeIconMargin, groupY);
            victoryContainer.add(iconSprite);
        } else {
            timeText.setPosition(this.scale.width / 2 - timeText.width / 2, groupY);
        }
        victoryContainer.add(timeText);
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
            }
        });

        const paddingX = 24;
        const paddingY = 16;
        const startText = this.add.text(0, 0, 'Opnieuw', {
            fontFamily: 'Bungee',
            fontSize: '54px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5).setDepth(50);

        const circleSize = 44;
        const iconMargin = 12;

        const btnContentWidth = circleSize + iconMargin + startText.width;
        const btnWidth = btnContentWidth + 2 * paddingX;
        const btnHeight = startText.height + 2 * paddingY;


        const shadowOffsetY = 8;
        const shadow = this.add.graphics();
        shadow.fillStyle(0xBC7F36, 1);
        shadow.fillRoundedRect(
            -btnWidth / 2,
            -btnHeight / 2 + shadowOffsetY,
            btnWidth,
            btnHeight,
            16
        );

        const bg = this.add.graphics();
        bg.fillStyle(Number('0x' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0')), 1);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 16);

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
        const buttonY = this.scale.height / 2 - 200;
        this.againButton = this.add.container(this.scale.width / 2, buttonY +100, [
            shadow,
            bg,
            circle,
            startText
        ]);
        this.againButton.setSize(btnWidth, btnHeight);
        this.againButton.setDepth(1100);
        this.againButton.setInteractive({ useHandCursor: true });
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
            .setDepth(50);
        victoryContainer.add(this.againText);

        const triggerButton = () => {
            // Clear the auto-navigate timeout
            if (this.autoNavigateTimeout) {
                clearTimeout(this.autoNavigateTimeout);
                this.autoNavigateTimeout = null;
            }
            this.timeoutStarted = false;
            
            const bg = this.againButton.list[1];
            const circle = this.againButton.list[2];
            const startText = this.againButton.list[3];
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
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
                triggerButton();
            }
        });
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