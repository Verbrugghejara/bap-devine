import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Tutorial } from './scenes/TutorialBlue';
import { Tutorial as TutorialRed } from './scenes/TutorialRed';
import { GameOver } from './scenes/GameOver';
import { GameVictory } from './scenes/GameVictory';
import { StoryTelling } from './scenes/StoryTelling';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#000000',

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 1920
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    fps: {
        target: 60,
        forceSetTimeOut: true
    },

    audio: {
        disableWebAudio: false,
        noAudio: false
    },

    render: {
        pixelArt: false,
        antialias: true
    },

    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        Tutorial,
        TutorialRed,
        GameOver,
        GameVictory,
        StoryTelling
    ]
};

const StartGame = (parent: string) => {
    return new Game({
        ...config,
        parent
    });
};

export default StartGame;
