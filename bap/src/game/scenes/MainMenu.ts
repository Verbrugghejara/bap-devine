
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
    private wasButtonPressed: boolean = false;

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
            shadow.fillStyle(0xB68302, 1);
            shadow.fillRoundedRect(
                -btnWidth/2,
                -btnHeight/2 + shadowOffsetY,
                btnWidth,
                btnHeight,
                16
            );

        const bg = this.add.graphics();
        bg.fillStyle(0xFFB703);
        bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 16);

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

        this.startButton = this.add.container(this.scale.width / 2, this.scale.height - 200, [
            shadow,
            bg,
            shineTopLeft,
            shineTopLeft2,
            shineBottomRight,
            circle,
            startText
        ]);
        this.startButton.setSize(btnWidth, btnHeight);
        this.startButton.setDepth(1100); 
        this.startButton.setInteractive({ useHandCursor: true });

        const triggerButton = () => {
            const bg = this.startButton.list[1];
            const shineTopLeft = this.startButton.list[2];
            const shineTopLeft2 = this.startButton.list[3];
            const shineBottomRight = this.startButton.list[4];
            const circle = this.startButton.list[5];
            const startText = this.startButton.list[6];
            console.log('Start button clicked');
            // Speel button-click audio af
            // if (this.sound && this.sound.context && this.sound.locked === false && this.sound.get('button-click')) {
                this.sound.play('button-click');
            // }

            this.tweens.add({
                targets: [bg, shineTopLeft, shineTopLeft2, shineBottomRight, circle, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    this.changeScene();
                }
            });
        };

        this.startButton.on('pointerdown', triggerButton);

        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }
        EventBus.emit("current-scene-ready", this);
    }

    update() {
        // Check hardware button press
        const buttonPressed = this.rotary?.buttonPressed || false;
        
        if (buttonPressed && !this.wasButtonPressed) {
            const bg = this.startButton.list[1];
            const shineTopLeft = this.startButton.list[2];
            const shineTopLeft2 = this.startButton.list[3];
            const shineBottomRight = this.startButton.list[4];
            const circle = this.startButton.list[5];
            const startText = this.startButton.list[6];

            // Play button-click sound when hardware button is pressed
            this.sound.play('button-click');

            this.tweens.add({
                targets: [bg, shineTopLeft, shineTopLeft2, shineBottomRight, circle, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    this.changeScene();
                }
            });
        }

        this.wasButtonPressed = buttonPressed;
    }

    changeScene() {

        this.scene.start('StoryTelling');

    }

}
