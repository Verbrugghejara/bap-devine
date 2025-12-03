
import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { getRotaryClient } from '../utils/rotaryClientSingleton';
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
            this.rotary = getRotaryClient();
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'home-animation')
            .setOrigin(0.5)
            .setDepth(1000)
        console.log('Video object:', video);
        video.on('play', () => {
            console.log('Video started playing!');
        });
        video.setMute(true);
        video.play(true);
        // this.title = this.add.text(
        //     this.scale.width / 2,
        //     this.scale.height / 4 - 300,
        //     'Reis naar de',
        //     {
        //         fontFamily: 'Bungee',
        //         fontSize: 74,
        //         color: '#' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0').toUpperCase(),
        //     }
        // )
        //     .setOrigin(0.5)
        //     .setDepth(1)
        //     .setShadow(0, 6, '#BC7F36', 0, false, true);
        // this.title2 = this.add.text(
        //     this.scale.width / 2,
        //     this.scale.height / 4 -200,
        //     'Bovenwereld',
        //     {
        //         fontFamily: 'Bungee',
        //         fontSize: 96,
        //         color: '#' + SFEER_LABELS[0].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        //     }
        // )
        //     .setOrigin(0.5)
        //     .setDepth(1)
        //     .setShadow(0, 6, '#860000', 0, false, true);
        // this.balloon = this.add.image(this.scale.width / 2, this.scale.height / 2, 'balloon')
        //     .setOrigin(0.5)
        //     .setDepth(1)
        //     .setScale(1.5);
        // Padding instellen
        const paddingX = 24;
        const paddingY = 16;
        const startText = this.add.text(0, 0, 'Start', {
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
                -btnWidth/2,
                -btnHeight/2 + shadowOffsetY,
                btnWidth,
                btnHeight,
                16
            );

        const bg = this.add.graphics();
        bg.fillStyle(Number('0x' + SFEER_LABELS[0].colors.c.toString(16).padStart(6, '0')), 1);
        bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 16);

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

        this.startButton = this.add.container(this.scale.width / 2, this.scale.height - 200, [
            shadow,
            bg,
            circle,
            startText
        ]);
        this.startButton.setSize(btnWidth, btnHeight);
        this.startButton.setDepth(1100); 
        this.startButton.setInteractive({ useHandCursor: true });

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

            this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
                if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
                    triggerButton();
                }
            });
        window.addEventListener('keydown', (event) => {
});

        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        EventBus.emit("current-scene-ready", this);
    }

    update() {
    }

    changeScene() {

        this.scene.start('TutorialBlue');

    }

}
