import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image('ballon', 'ballon.png');
        this.load.image('background', 'bg.png');
        this.load.image('bg-troposfeer', 'bgSferen/bgTroposfeer.jpg');
        this.load.image('bg-stratosfeer', 'bgSferen/bgStratosfeer.jpg');
        this.load.image('bg-mesosfeer', 'bgSferen/bgMesosfeer.jpg');
        this.load.image('bg-thermosfeer', 'bgSferen/bgThermosfeer.jpg');
        this.load.image('bg-exosfeer', 'bgSferen/bgExosfeer.jpg');
        this.load.image('bg-gameover', 'bgGameOver.jpg');
        this.load.image('bg-gamevictory', 'bgGameVictory.jpg');
        this.load.spritesheet('bird-walk', 'bird/Walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('bird-death', 'bird/Death.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('heart', 'heart.svg');
        this.load.image('balloon', 'balloon.png');
        this.load.image('active-blauw', 'activePropellorBlauw.png');
        this.load.image('active-rood', 'activePropellorRood.png');
        this.load.image('inactive', 'inactivePropellor.png');
        this.load.image('arrows', 'arrows.png');
        this.load.image('progress-indicator', 'progressIndicator.png');
        this.load.image('timer', 'timer.png');
        this.load.spritesheet('propellor-blauw', 'propellors/propellorBlauw.png', { frameWidth: 28, frameHeight: 88 });
        this.load.spritesheet('propellor-rood', 'propellors/propellorRood.png', { frameWidth: 28, frameHeight: 88 });
        this.load.spritesheet('wind-blauw', 'wind/windBlue.png', { frameWidth: 200, frameHeight: 160 });
        this.load.spritesheet('wind-rood', 'wind/windRed.png', { frameWidth: 200, frameHeight: 160 });
        this.load.video('home-animation','mainMenuVideo.mp4')
        // Vogel walk spritesheet (gebruik 128x128 en 8 frames als test)
        // this.load.spritesheet('bird-walk', 'bird/Walk.png', { frameWidth: 128, frameHeight: 128 });

        // for (let i = 0; i <= 449; i++) {
        //     const key = `home-animation${i.toString().padStart(3, '0')}`;
        //     this.load.image(key, `assets/homeAnimation/${key}.png`);
        // }
    }
    create() {
        // Animaties pas aanmaken als alles geladen is
        // this.load.on('complete', () => {
            this.anims.create({
                key: 'wind-blauw',
                frames: this.anims.generateFrameNumbers('wind-blauw', { start: 0, end: 9 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'wind-rood',
                frames: this.anims.generateFrameNumbers('wind-rood', { start: 0, end: 9 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'propellor-rood',
                frames: this.anims.generateFrameNumbers('propellor-rood', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'propellor-blauw',
                frames: this.anims.generateFrameNumbers('propellor-blauw', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'bird-walk',
                frames: this.anims.generateFrameNumbers('bird-walk', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'bird-death',
                frames: this.anims.generateFrameNumbers('bird-death', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: 0
            });
            this.scene.start('MainMenu');

            // Animatie van home-animation PNGs
            // let homeAnimationFrames = [];
            // for (let i = 0; i <= 449; i++) {
            //     const frameKey = Phaser.Utils.String.Pad(i, 3, '0', 1);
            //     homeAnimationFrames.push({ key: 'home-animation' + frameKey });
            // }
            // this.anims.create({
            //     key: 'home-animation',
            //     frames: homeAnimationFrames,
            //     frameRate: 24,
            //     repeat: -1
            // });

            // this.scene.start('MainMenu');
        // });
    }
}
