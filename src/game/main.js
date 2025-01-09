import Game from './scenes/Game';
import StartScene from './scenes/Start'; 
import Phaser from 'phaser';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [StartScene, Game], // Add both scenes
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

// Dynamically resize the game when the window is resized
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

// Initialize the Phaser game
const game = new Phaser.Game(config);
export default game;