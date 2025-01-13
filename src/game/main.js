import Game from './scenes/Game';
import StartScene from './scenes/Start';
import Phaser from 'phaser';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [StartScene, Game],
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

class MyGame extends Phaser.Game {
    constructor(config) {
        super(config);

        // Set global sound volume
        this.sound.volume = 1; // 50% volume
    }
}

// Initialize the Phaser game
const game = new Phaser.Game(config);

// Global resize logic
function resizeGame() {
    const { width, height } = game.scale.gameSize;

    // Adjust game elements for each scene
    game.scene.scenes.forEach((scene) => {
        scene.children.list.forEach((child) => {
            if (child.texture && child.texture.key === "pokerTable") {
                child.setDisplaySize(width, height); // Resize the background
            }

            // Recalculate positions and scales for other elements
            if (child.originalX !== undefined && child.originalY !== undefined) {
                child.x = (child.originalX / game.config.width) * width;
                child.y = (child.originalY / game.config.height) * height;
            }
        });
    });
}

// Listen for resize events
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    resizeGame();
});

export default game;
