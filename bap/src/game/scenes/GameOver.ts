import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";

export class GameOver extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        // Sfeer progression bar (zelfde stijl als in Tutorial)
        const progressBarWidth = this.scale.width * 0.6;
        const progressBarHeight = 32;
        const progressBarX = this.scale.width / 2 - progressBarWidth / 2;
        const progressBarY = this.scale.height /2 -400;
        let sfeerProgress = 1; // fallback
        if (window && (window as any).sfeerProgress !== undefined) {
            sfeerProgress = (window as any).sfeerProgress;
        }
        // Achtergrond (wit, semi-transparant)
        const bar = this.add.graphics();
        bar.clear();
        bar.fillStyle(0xffffff, 0.25);
        bar.fillRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 16);
        // Meters berekenen en tonen
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
        // Vulling (blauw, afgerond rechts)
        let fillWidth = (progressBarWidth - 30) * sfeerProgress;
        if (sfeerProgress > 0) {
            const radius = 16;
            // Draw fill
            bar.fillStyle(Number('0x' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0')), 1);
            bar.fillRoundedRect(progressBarX, progressBarY, fillWidth + 30, progressBarHeight, { tl: radius, tr: radius, bl: radius, br: radius });
            // Draw glossy bar ONLY on the fill, not on the background
            if (fillWidth + 30 > 60) {
                const highlightWidth = Math.max(60, (fillWidth) );
                const highlightHeight = 8;
                const highlightX = progressBarX + (fillWidth + 30)/2 - highlightWidth/2;
                const highlightY = progressBarY + 4;
                bar.save();
                bar.beginPath();
                bar.fillStyle(0xffffff, 0.1);
                bar.fillRoundedRect(highlightX, highlightY, highlightWidth, highlightHeight, 4);
                bar.closePath();
                bar.restore();
            }
            // Progress indicator toevoegen
            const indicatorX = progressBarX + Math.max(0, Math.min(fillWidth + 30, progressBarWidth));
            const indicatorY = progressBarY - progressBarHeight;
            this.add.image(indicatorX, indicatorY, 'progress-indicator')
                .setOrigin(0.5)
                .setDepth(21)
                .setScale(progressBarHeight / 32); // schaal aan op hoogte bar
        }
        // bar.strokeRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 16);
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
        // Maak eerst de tekst om breedte/hoogte te meten
        const startText = this.add.text(0, 0, 'Opnieuw', {
            fontFamily: 'Bungee',
            fontSize: '54px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5).setDepth(1001);

        // Rocket icon afmetingen
        const circleSize = 44;
        const iconMargin = 12;

        // Totale breedte: rocket + margin + tekst + padding
        const btnContentWidth = circleSize + iconMargin + startText.width;
        const btnWidth = btnContentWidth + 2 * paddingX;
        const btnHeight = startText.height + 2 * paddingY;


        // Shadow onder de knop tekenen
            const shadowOffsetY = 8;
            const shadow = this.add.graphics();
            shadow.fillStyle(0xBC7F36, 1);
            shadow.fillRoundedRect(
                -btnWidth/2,
                -btnHeight/2 + shadowOffsetY,
                btnWidth,
                btnHeight,
                16
            );

        // Achtergrond tekenen met padding
        const bg = this.add.graphics();
        bg.fillStyle(Number('0x' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0')), 1);
        bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 16);

        // Zet rocket en tekst netjes naast elkaar gecentreerd
        const circleRadius = circleSize / 3;
        // Bepaal totale content breedte (cirkel + margin + tekst)
        const contentWidth = circleRadius * 2 + iconMargin + startText.width;
        // Startpositie zodat geheel gecentreerd is
        const contentStartX = -contentWidth / 2;
        // Verticaal centreren: y=0 is het midden van de button-container
        const circleY = 0;
        const circleX = contentStartX + circleRadius;
        const textX = circleX + circleRadius + iconMargin + startText.width / 2;
        const circle = this.add.graphics();
        circle.lineStyle(6, 0xffffff, 1);
        circle.strokeCircle(circleX, circleY, circleRadius);
        startText.setX(textX);
        startText.setY(0);

        // Container als button
        this.againButton = this.add.container(this.scale.width / 2, this.scale.height / 2, [
            shadow,
            bg,
            circle,
            startText
        ]);
        this.againButton.setSize(btnWidth, btnHeight);
        this.againButton.setDepth(1100); // Zorg dat de button boven de video staat
        this.againButton.setInteractive({ useHandCursor: true });
        this.againText = this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 -100,
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

    }
}