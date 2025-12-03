import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { emit } from "process";

export class GameVictory extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;

    constructor() {
        super('GameVictory');
    }

    create() {
        this.add.image(this.scale.width / 2, 0, 'bg-gamevictory').setOrigin(0.5, 0).setDepth(1);
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

        // Toon de tijd die nodig was om te winnen
        let durationMs = 0;
        if (typeof window !== 'undefined' && (window as any).gameDurationMs) {
            durationMs = (window as any).gameDurationMs;
        }
        // Gebruik de tijd direct, geen correctie meer nodig
        // Format mm:ss:ms:ms
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = durationMs % 1000;
        // Toon 2 cijfers voor ms (honderdsten)
        const msHundredths = Math.floor(ms / 10).toString().padStart(2, '0');
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${msHundredths}`;

        // Timer icoon links naast de tijd
        const iconKey = 'timer'; // Zorg dat deze sprite is geladen in de preload
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
        // Bepaal startpositie zodat geheel gecentreerd is
        const groupX = this.scale.width / 2 - groupWidth / 2;
        const groupY = this.scale.height / 4+100;
        if (iconSprite) {
            iconSprite.setPosition(groupX, groupY);
                timeText.setPosition(groupX + iconSprite.displayWidth + timeIconMargin, groupY);
        } else {
            timeText.setPosition(this.scale.width / 2 - timeText.width / 2, groupY);
        }

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
            -btnWidth / 2,
            -btnHeight / 2 + shadowOffsetY,
            btnWidth,
            btnHeight,
            16
        );

        // Achtergrond tekenen met padding
        const bg = this.add.graphics();
        bg.fillStyle(Number('0x' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0')), 1);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 16);

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
        this.againButton = this.add.container(this.scale.width / 2, this.scale.height / 2 - 100, [
            shadow,
            bg,
            circle,
            startText
        ]);
        this.againButton.setSize(btnWidth, btnHeight);
        this.againButton.setDepth(1100); // Zorg dat de button boven de video staat
        this.againButton.setInteractive({ useHandCursor: true });
        this.againButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
                this.scene.start('Game');
            }
        });
        this.againText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 200,
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
                    // Reset relevante game data
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