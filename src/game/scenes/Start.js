import Phaser from "phaser";

class StartScene extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    preload() {
        // Preload any assets required for the start screen
        this.load.image("pokerTable", "assets/table.jpg");
    }

    create() {
        // Add start screen content
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, "pokerTable").setDisplaySize(width, height);

        // "Start Game" Button
        const startText = this.add.text(width / 2, height / 2, "Start Game", {
            fontSize: "32px",
            color: "#ffffff",
        }).setOrigin(0.5);

        startText.setInteractive();

        // Hover effects
        startText.on("pointerover", () => {
            startText.setStyle({ color: "#ffcc00" });
            startText.setScale(1.1);
        });

        startText.on("pointerout", () => {
            startText.setStyle({ color: "#ffffff" });
            startText.setScale(1);
        });

        startText.on("pointerdown", () => {
            console.log("Starting the game...");
            this.scene.start("Game"); // Transition to Game scene
        });
    }
}

export default StartScene;
