import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";

export class GameOver extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    create() {
        setTimeout(() => {
                    if (this.scene.isActive()) {
                        this.scene.start('MainMenu');
                        
                    }
                }, 30000);
        const progressBarWidth = this.scale.width * 0.6;
        const progressBarHeight = 32;
        const progressBarX = this.scale.width / 2 - progressBarWidth / 2;
        const progressBarY = this.scale.height / 2 - 400;
        let sfeerProgress = 1; 
        if (window && (window as any).sfeerProgress !== undefined) {
            sfeerProgress = (window as any).sfeerProgress;
        }
        const bar = this.add.graphics();
        bar.clear();
        bar.fillStyle(0xffffff, 0.25);
        bar.fillRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 16);
        const meters = Math.round(sfeerProgress * 1000);
        this.add.text(
            this.scale.width / 2,
            progressBarY + 80,
            `${meters} M`,
            {
                fontFamily: 'Bungee',
                fontSize: 64,
                color: '#FFFFFF',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5).setDepth(21).setShadow(0, 6, 'rgba(0, 0, 0, 0.25)', 0, false, true);
        let fillWidth = (progressBarWidth - 30) * sfeerProgress;
        if (sfeerProgress > 0) {
            const radius = 16;
            bar.fillStyle(Number('0x' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0')), 1);
            bar.fillRoundedRect(progressBarX, progressBarY, fillWidth + 30, progressBarHeight, { tl: radius, tr: radius, bl: radius, br: radius });
            if (fillWidth + 30 > 60) {
                const highlightWidth = Math.max(60, (fillWidth));
                const highlightHeight = 8;
                const highlightX = progressBarX + (fillWidth + 30) / 2 - highlightWidth / 2;
                const highlightY = progressBarY + 4;
                bar.save();
                bar.beginPath();
                bar.fillStyle(0xffffff, 0.1);
                bar.fillRoundedRect(highlightX, highlightY, highlightWidth, highlightHeight, 4);
                bar.closePath();
                bar.restore();
            }
            const indicatorX = progressBarX + Math.max(0, Math.min(fillWidth + 30, progressBarWidth));
            const indicatorY = progressBarY - progressBarHeight;
            this.add.image(indicatorX, indicatorY, 'progress-indicator')
                .setOrigin(0.5)
                .setDepth(21)
                .setScale(progressBarHeight / 32); // schaal aan op hoogte bar
        }
        bar.setDepth(20);



        this.add.image(this.scale.width / 2, 0, 'bg-gameover').setOrigin(0.5, 0).setDepth(1);
        this.title = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 300,
            'Game Over',
            {
                fontFamily: 'Bungee',
                fontSize: 80,
                color: '#' + SFEER_LABELS[0].colors.d.toString(16).padStart(6, '0').toUpperCase(),
            }
        )
            .setOrigin(0.5)
            .setDepth(10)
            .setShadow(0, 6, '#7D1D39', 0, false, true);

        this.description = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 150,
            'Oei... dat was een gekke landing.',
            {
                fontFamily: 'Space Grotesk',
                fontSize: 56,
                color: '#FFFFFF',
                fontStyle: 'bold'
            }
        )
            .setOrigin(0.5)
            .setDepth(10)

        const paddingX = 24;
        const paddingY = 16;
        const startText = this.add.text(0, 0, 'Opnieuw', {
            fontFamily: 'Bungee',
            fontSize: '54px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5).setDepth(1001);

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

        this.againButton = this.add.container(this.scale.width / 2, this.scale.height / 2, [
            shadow,
            bg,
            circle,
            startText
        ]);
        this.againButton.setSize(btnWidth, btnHeight);
        this.againButton.setDepth(1100); 
        this.againButton.setInteractive({ useHandCursor: true });

        this.againText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 100,
            'Opnieuw proberen?',
            {
                fontFamily: 'Space Grotesk',
                fontSize: 40,
                color: '#FFFFFF',
                fontStyle: '500'
            }
        )
            .setOrigin(0.5)
            .setDepth(10)
        const triggerButton = () => {
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
                    this.scene.start('Game');
                }
            });
        };
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
                triggerButton();
            }
        });
    }
}