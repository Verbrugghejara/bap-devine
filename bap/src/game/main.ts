import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
// import { GameVictoryUI } from './ui/GameVictoryUI';
import { Preloader } from './scenes/Preloader';
import { Tutorial } from './scenes/TutorialBlue';
import { Tutorial as TutorialRed } from './scenes/TutorialRed';
import { GameOver } from './scenes/GameOver';
// If './scenes/GameVictory' has a default export:
import { GameVictory } from './scenes/GameVictory';
import { StoryTelling } from './scenes/StoryTelling';

// Or, if it exports a different named member, e.g. 'VictoryScene':
// import { VictoryScene } from './scenes/GameVictory';


// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: '100%',
    height: '100%',
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    // fps: {
    //     target: 60,
    //     forceSetTimeOut: false
    // },
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

    const game = new Game({ ...config, parent });
    
    // Add FPS display
    // const fpsText = document.createElement('div');
    // fpsText.style.position = 'absolute';
    // fpsText.style.top = '10px';
    // fpsText.style.left = '10px';
    // fpsText.style.color = '#00ff00';
    // fpsText.style.fontFamily = 'monospace';
    // fpsText.style.fontSize = '16px';
    // fpsText.style.zIndex = '10000';
    // fpsText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    // fpsText.style.padding = '5px 10px';
    // fpsText.style.borderRadius = '4px';
    // document.body.appendChild(fpsText);
    
    // function updateFPS() {
    //     if (game.loop) {
    //         fpsText.textContent = `FPS: ${Math.round(game.loop.actualFps)}`;
    //     }
    //     requestAnimationFrame(updateFPS);
    // }
    // updateFPS();
    
    return game;

}

export default StartGame;
