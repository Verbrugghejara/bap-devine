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
        this.load.image('background', 'bg.png');
        this.load.image('bg-troposfeer', 'bgSferen/bgTroposfeer.jpg');
        this.load.image('bg-stratosfeer', 'bgSferen/bgStratosfeer.jpg');
        this.load.image('bg-mesosfeer', 'bgSferen/bgMesosfeer.jpg');
        this.load.image('bg-thermosfeer', 'bgSferen/bgThermosfeer.jpg');
        this.load.image('bg-exosfeer', 'bgSferen/bgExosfeer.jpg');
        this.load.image('bg-gameover', 'bgGameOver.jpg');
        this.load.image('bg-gamevictory', 'bgGameVictory.jpg');
        this.load.image('aliens-gamevictory', 'aliensVictory.png');
        this.load.spritesheet('bird-walk', 'bird/birdFlying2.png', { frameWidth: 140, frameHeight: 125 });
        this.load.spritesheet('bird-death', 'bird/birdDeath.png', { frameWidth: 320, frameHeight: 375 });
        this.load.image('heart', 'heart.svg');
        this.load.image('active-blauw', 'activePropellorBlauw.png');
        this.load.image('active-rood', 'activePropellorRood.png');
        this.load.image('inactive', 'inactivePropellor.png');
        this.load.image('arrows-blue', 'arrowsBlue.png');
        this.load.image('arrows-red', 'arrowsRed.png');
        this.load.image('progress-indicator', 'progressIndicator.png');
        this.load.image('timer', 'timer.png');
        this.load.image('winner', 'winner.png');
        this.load.image('second', 'second.png');
        this.load.image('alien', 'alienHoofd.png');
        this.load.image('plane-freeze', 'planeFreeze.png');
        


        this.load.image('balloon', 'balloons/balloon.png');
        this.load.image('balloon-shield', 'balloons/balloonShield.png');
        this.load.image('balloon-freeze', 'balloons/balloonFreeze.png');
        this.load.image('balloon-health1', 'balloons/balloonHealth1.png');
        this.load.image('balloon-health2', 'balloons/balloonHealth2.png');


        // Obstacle images (will be replaced with spritesheets later)
        this.load.image('bird', 'bird.png');
        this.load.image('meteor', 'meteor.png');
        this.load.image('sattelite', 'sattelite.png');
        this.load.image('ufo', 'ufo.png');
        this.load.image('plane', 'plane.png');
        
        // Power ups
        this.load.image('heart-outline', 'powerUps/healthOutline.png');
        this.load.image('freeze-outline', 'powerUps/freezeOutline.png');
        this.load.image('shield-outline', 'powerUps/shieldOutline.png');
        this.load.image('time-outline', 'powerUps/timeOutline.png');
        this.load.image('freeze', 'powerUps/freeze.png');
        this.load.image('shield', 'powerUps/shield.png');

        
        // When spritesheets are ready, replace the above image loads with:
        // this.load.spritesheet('plane', 'plane/fly.png', { frameWidth: 32, frameHeight: 32 });
        // this.load.spritesheet('meteor', 'meteor/spin.png', { frameWidth: 32, frameHeight: 32 });
        // this.load.spritesheet('sattelite', 'sattelite/spin.png', { frameWidth: 32, frameHeight: 32 });
        // this.load.spritesheet('ufo', 'ufo/fly.png', { frameWidth: 32, frameHeight: 32 });
        
        this.load.spritesheet('ufo-breaking', 'ufo/ufoBreaking.png', { frameWidth: 950, frameHeight: 1000 });
        this.load.spritesheet('sattelite-flying', 'sattelite/satteliteFlying.png', { frameWidth: 380, frameHeight: 380 });
        this.load.spritesheet('sattelite-breaking', 'sattelite/satteliteBreaking.png', { frameWidth: 1100, frameHeight: 820 });
        this.load.spritesheet('meteor-falling', 'meteor/meteorFalling.png', { frameWidth: 216, frameHeight: 262 });
        this.load.spritesheet('meteor-breaking', 'meteor/meteorBreaking.png', { frameWidth: 407, frameHeight: 403 });
        this.load.spritesheet('plane-flying', 'plane/planeFlying.png', { frameWidth: 350, frameHeight: 143 });
        this.load.spritesheet('plane-crashing', 'plane/planeCrashing.png', { frameWidth: 621, frameHeight: 719 });
        this.load.spritesheet('propellor-blauw', 'propellors/propellorBlauw.png', { frameWidth: 28, frameHeight: 88 });
        this.load.spritesheet('propellor-rood', 'propellors/propellorRood.png', { frameWidth: 28, frameHeight: 88 });
        this.load.spritesheet('wind-blauw', 'wind/windBlue.png', { frameWidth: 200, frameHeight: 160 });
        this.load.spritesheet('wind-rood', 'wind/windRed.png', { frameWidth: 200, frameHeight: 160 });
        
        this.load.spritesheet('alien-tropo', 'aliens/alienTropo.png', { frameWidth: 1477.34, frameHeight: 1516.63 });
        this.load.spritesheet('alien-strato', 'aliens/alienStrato.png', { frameWidth: 1477, frameHeight: 1516 });
        this.load.spritesheet('alien-meso', 'aliens/alienMeso.png', { frameWidth: 1383.34, frameHeight: 1420.13 });
        this.load.spritesheet('alien-thermo', 'aliens/alienThermo.png', { frameWidth: 1840, frameHeight: 1898 });
        this.load.spritesheet('alien-exo', 'aliens/alienExo.png', { frameWidth: 1432, frameHeight: 1623 });
        
        this.load.video('home-animation','mainMenuVideo.mp4')
        this.load.video('storytelling-animation','storyTelling.mp4')
        
        this.load.audio('button-click', 'audio/buttonClick.mp3');
        this.load.audio('hit', 'audio/hit.mp3');
        this.load.audio('pick-up', 'audio/pickUp.mp3');
        this.load.audio('game-over', 'audio/gameOver.mp3');
        this.load.audio('game-victory', 'audio/gameVictory.mp3');
        this.load.audio('count-down', 'audio/countDown.mp3');
        this.load.audio('alien-happy', 'audio/alienHappy.mp3');
        this.load.audio('alien-sad', 'audio/alienSad.mp3');
        this.load.audio('alien-startled', 'audio/alienStartled.mp3');
        this.load.audio('alien-angry', 'audio/alienAngry.mp3');
        this.load.audio('alien-cheers', 'audio/alienCheers.mp3');
        this.load.audio('alien-scream', 'audio/alienScream.mp3');
        this.load.audio('hit-metal', 'audio/hitMetal.mp3');
        this.load.audio('troposfeer', 'audio/troposfeer.mp3');
        this.load.audio('stratosfeer', 'audio/stratosfeer.mp3');
        this.load.audio('space', 'audio/space.mp3');
    }
    create() {
        // Animaties pas aanmaken als alles geladen is
        // this.load.on('complete', () => {
            this.anims.create({
                key: 'alien-exo',
                frames: this.anims.generateFrameNumbers('alien-exo', { start: 0, end: 20 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'alien-thermo',
                frames: this.anims.generateFrameNumbers('alien-thermo', { start: 0, end: 20 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'alien-meso',
                frames: this.anims.generateFrameNumbers('alien-meso', { start: 0, end: 20 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'alien-strato',
                frames: this.anims.generateFrameNumbers('alien-strato', { start: 0, end: 20 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'alien-tropo',
                frames: this.anims.generateFrameNumbers('alien-tropo', { start: 0, end: 20 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'ufo-breaking',
                frames: this.anims.generateFrameNumbers('ufo-breaking', { start: 0, end: 11 }),
                frameRate: 15,
                repeat: 0
            });
            this.anims.create({
                key: 'sattelite-breaking',
                frames: this.anims.generateFrameNumbers('sattelite-breaking', { start: 0, end: 11 }),
                frameRate: 15,
                repeat: 0
            });
            this.anims.create({
                key: 'sattelite-flying',
                frames: this.anims.generateFrameNumbers('sattelite-flying', { start: 0, end: 8 }),
                frameRate: 4,
                repeat: -1
            });
            this.anims.create({
                key: 'plane-crashing',
                frames: this.anims.generateFrameNumbers('plane-crashing', { start: 0, end: 8 }),
                frameRate: 10,
                repeat: 0
            });
            this.anims.create({
                key: 'plane-flying',
                frames: this.anims.generateFrameNumbers('plane-flying', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'meteor-falling',
                frames: this.anims.generateFrameNumbers('meteor-falling', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'meteor-breaking',
                frames: this.anims.generateFrameNumbers('meteor-breaking', { start: 0, end: 8 }),
                frameRate: 10,
                repeat: 0
            });
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
                frames: this.anims.generateFrameNumbers('bird-walk', { start: 0, end: 6 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'bird-death',
                frames: this.anims.generateFrameNumbers('bird-death', { start: 0, end: 8 }),
                frameRate: 10,
                repeat: 0
            });

            // Future obstacle animations - uncomment when spritesheets are ready
            // if (this.textures.exists('plane')) {
            //     this.anims.create({
            //         key: 'plane-fly',
            //         frames: this.anims.generateFrameNumbers('plane', { start: 0, end: 3 }),
            //         frameRate: 10,
            //         repeat: -1
            //     });
            // }
            // if (this.textures.exists('meteor')) {
            //     this.anims.create({
            //         key: 'meteor-spin',
            //         frames: this.anims.generateFrameNumbers('meteor', { start: 0, end: 3 }),
            //         frameRate: 10,
            //         repeat: -1
            //     });
            // }
            // if (this.textures.exists('sattelite')) {
            //     this.anims.create({
            //         key: 'sattelite-spin',
            //         frames: this.anims.generateFrameNumbers('sattelite', { start: 0, end: 3 }),
            //         frameRate: 10,
            //         repeat: -1
            //     });
            // }
            // if (this.textures.exists('ufo')) {
            //     this.anims.create({
            //         key: 'ufo-fly',
            //         frames: this.anims.generateFrameNumbers('ufo', { start: 0, end: 3 }),
            //         frameRate: 10,
            //         repeat: -1
            //     });
            // }
            
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
