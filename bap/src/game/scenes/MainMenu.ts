
import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { getRotaryClient } from '../utils/rotaryClientSingleton';
// import { transform } from "typescript"; // Niet gebruikt, dus verwijderd
import { SFEER_LABELS } from "../utils/sfeerLabels";


export class MainMenu extends Scene {
    rotary: any;
    title: GameObjects.Text;
    title2: GameObjects.Text;
    balloon: GameObjects.Image;
    startButton: GameObjects.Container;

    constructor() {
        super({ key: "MainMenu", physics: { arcade: {} } });
    }


    create() {
            // Zet direct de WebSocket connectie op
            this.rotary = getRotaryClient();
        this.cameras.main.setBackgroundColor('#' + SFEER_LABELS[0].colors.a.toString(16).padStart(6, '0').toUpperCase());
        this.title = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 300,
            'Reis naar de',
            {
                fontFamily: 'Bungee',
                fontSize: 74,
                color: '#' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0').toUpperCase(),
            }
        )
            .setOrigin(0.5)
            .setDepth(1)
            .setShadow(0, 6, '#BC7F36', 0, false, true);
        this.title2 = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 -200,
            'Bovenwereld',
            {
                fontFamily: 'Bungee',
                fontSize: 96,
                color: '#' + SFEER_LABELS[0].colors.d.toString(16).padStart(6, '0').toUpperCase(),
            }
        )
            .setOrigin(0.5)
            .setDepth(1)
            .setShadow(0, 6, '#860000', 0, false, true);
        this.balloon = this.add.image(this.scale.width / 2, this.scale.height / 2, 'balloon')
            .setOrigin(0.5)
            .setDepth(1)
            .setScale(1.5);
        // Padding instellen
        const paddingX = 24;
        const paddingY = 16;
        // Maak eerst de tekst om breedte/hoogte te meten
        const startText = this.add.text(0, 0, 'Start', {
            fontFamily: 'Bungee',
            fontSize: '54px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5);

        // Rocket icon afmetingen
        const rocketSize = 44;
        const iconMargin = 12;

        // Totale breedte: rocket + margin + tekst + padding
        const btnContentWidth = rocketSize + iconMargin + startText.width;
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
        const circleRadius = rocketSize / 3;
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
        this.startButton = this.add.container(this.scale.width / 2, this.scale.height - 200, [
            shadow,
            bg,
            circle,
            startText
        ]);

        this.startButton.setSize(btnWidth, btnHeight);
        this.startButton.setInteractive({ useHandCursor: true });

        // Button animatie en scene-wissel functie
        const triggerButton = () => {
            const bg = this.startButton.list[1];
            const circle = this.startButton.list[2];
            const startText = this.startButton.list[3];
            this.tweens.add({
                targets: [bg, circle, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    this.changeScene();
                }
            });
        };

        this.startButton.on('pointerdown', triggerButton);

        // Keyboard: Enter of Space activeert ook de knop
            this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
                if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
                    triggerButton();
                }
            });
        window.addEventListener('keydown', (event) => {
//   console.log('GLOBAL KEY:', event.code, event.key, event);
});

        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        EventBus.emit("current-scene-ready", this);
    }

    update() {
    }

    changeScene() {

        this.scene.start('Tutorial');

    }

}
