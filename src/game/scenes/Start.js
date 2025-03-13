import Phaser from "phaser";

class StartScene extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    preload() {
        // Preload any assets required for the start screen
        this.load.image("pokerTable", "assets/table.jpg");
        
        // Load card suit symbols for decoration
        this.load.image("cardBack", "assets/cards/card-back1.png");
        this.load.image("cardBack2", "assets/cards/card-back2.png");
        this.load.image("cardBack3", "assets/cards/card-back3.png");
        this.load.image("cardBack4", "assets/cards/card-back4.png");
    }

    create() {
        // Add start screen content
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, "pokerTable").setDisplaySize(width, height);
        
        // Create a decorative card layout in the background
        this.createCardDecoration(width, height);
        
        // Create a stylish title for the game
        this.createGameTitle(width, height);

        // Create a fancy container for the start button
        const buttonContainer = this.createButtonContainer(width, height);
        
        // "Play" Button with enhanced styling and larger font size
        const startText = this.add.text(width / 2, height / 2, "PLAY", {
            fontSize: "42px", // Increased font size
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 6, // Increased stroke thickness
            shadow: { offsetX: 3, offsetY: 3, color: "#000000", blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5).setDepth(105); // Increased depth to ensure it's on top

        // Add a subtle pulsing animation to the text
        this.tweens.add({
            targets: startText,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        startText.setInteractive();

        // Enhanced hover effects
        startText.on("pointerover", () => {
            startText.setStyle({ 
                fill: "#ffdd00",
                fontSize: "46px", // Increased font size on hover
                stroke: "#aa0000",
                strokeThickness: 6
            });
            
            // Brighten the button container on hover
            buttonContainer.bg.setFillStyle(0xa83770);
            buttonContainer.gradient.setFillStyle(0xd25a9e);
            buttonContainer.bg.setStrokeStyle(4, 0xffd700);
            
            // Replicate turn indicator shine effect
            const buttonWidth = 250;
            const buttonHeight = 80;
            const shineWidth = 40;
            const horizontalPadding = 20;

            // Store shine reference on button container
            buttonContainer.shine = this.add.rectangle(
                buttonContainer.bg.x - buttonWidth/2 + horizontalPadding,
                buttonContainer.bg.y,
                shineWidth,
                buttonHeight - 10,
                0xffffff
            )
            .setAlpha(0.1)
            .setDepth(101)
            .setOrigin(0.5, 0.5);

            // Store tween reference
            buttonContainer.shineTween = this.tweens.add({
                targets: buttonContainer.shine,
                x: buttonContainer.bg.x + buttonWidth/2 - horizontalPadding,
                duration: 2000,
                ease: "Sine.inOut",
                repeat: -1,
                yoyo: true
            });
        });

        startText.on("pointerout", () => {
            startText.setStyle({ 
                fill: "#ffffff",
                fontSize: "42px", // Maintain larger font size
                stroke: "#000000",
                strokeThickness: 6
            });
            
            // Reset the button container
            buttonContainer.bg.setFillStyle(0x8d2c5e);
            buttonContainer.gradient.setFillStyle(0xbd4a8b);
            buttonContainer.bg.setStrokeStyle(3, 0xffffff);

            // Clean up shine effect
            if (buttonContainer.shine) {
                buttonContainer.shine.destroy();
                buttonContainer.shine = null;
            }
            if (buttonContainer.shineTween) {
                buttonContainer.shineTween.remove();
                buttonContainer.shineTween = null;
            }
        });

        startText.on("pointerdown", () => {
            console.log("Starting the game...");
            
            // Add a press effect
            this.tweens.add({
                targets: [buttonContainer.bg, buttonContainer.gradient, startText],
                y: '+=5',
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    // Try to play a button sound if available
                    try {
                        if (this.sound.get('buttonSound')) {
                            this.sound.play("buttonSound");
                        }
                    } catch (error) {
                        console.warn("Button sound not available");
                    }
                    
                    // Transition to Game scene
                    this.scene.start("Game");
                }
            });
        });
    }
    
    createButtonContainer(width, height) {
        // Create button shadow for depth effect
        const buttonShadow = this.add.rectangle(width / 2 + 5, height / 2 + 5, 250, 80, 0x000000, 0.5)
            .setOrigin(0.5)
            .setDepth(98);
        
        // Create a stylish button background with rounded corners
        const buttonBg = this.add.rectangle(width / 2, height / 2, 250, 80, 0x8d2c5e)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5)
            .setDepth(99);
        
        // Add a gradient effect to the button
        const gradientOverlay = this.add.rectangle(width / 2, height / 2 - 20, 240, 30, 0xbd4a8b)
            .setOrigin(0.5)
            .setDepth(100);
            
        // Add decorative card suit corners to the button
        const suits = ['♠', '♥', '♦', '♣'];
        const cornerSize = 24;
        const cornerOffset = 15;
        
        // Top-left corner
        const topLeftCorner = this.add.text(
            width / 2 - 250/2 + cornerOffset, 
            height / 2 - 80/2 + cornerOffset, 
            '♠', 
            {
                fontSize: `${cornerSize}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Bottom-right corner
        const bottomRightCorner = this.add.text(
            width / 2 + 250/2 - cornerOffset, 
            height / 2 + 80/2 - cornerOffset, 
            '♠', 
            {
                fontSize: `${cornerSize}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Top-right corner
        const topRightCorner = this.add.text(
            width / 2 + 250/2 - cornerOffset, 
            height / 2 - 80/2 + cornerOffset, 
            '♥', 
            {
                fontSize: `${cornerSize}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Bottom-left corner
        const bottomLeftCorner = this.add.text(
            width / 2 - 250/2 + cornerOffset, 
            height / 2 + 80/2 - cornerOffset, 
            '♦', 
            {
                fontSize: `${cornerSize}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(100);
        
        return {
            bg: buttonBg,
            gradient: gradientOverlay,
            shadow: buttonShadow,
            topLeftCorner,
            topRightCorner,
            bottomLeftCorner,
            bottomRightCorner
        };
    }
    
    createCardDecoration(width, height) {
        // Create some decorative cards in the background
        const cardTextures = ["cardBack", "cardBack2", "cardBack3", "cardBack4"];
        
        // Create a fan of cards at the top
        for (let i = 0; i < 7; i++) {
            const texture = Phaser.Math.RND.pick(cardTextures);
            const angle = -30 + (i * 10); // Fan from -30 to +30 degrees
            const card = this.add.image(width / 2, height / 4, texture)
                .setOrigin(0.5, 1)
                .setScale(0.7)
                .setRotation(Phaser.Math.DegToRad(angle))
                .setDepth(10 + i);
                
            // Add a subtle floating animation
            this.tweens.add({
                targets: card,
                y: height / 4 - 5,
                duration: 2000 + (i * 300),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Create some scattered cards at the bottom
        for (let i = 0; i < 5; i++) {
            const texture = Phaser.Math.RND.pick(cardTextures);
            const x = width * 0.2 + (width * 0.6 * (i / 4));
            const y = height * 0.8;
            const angle = Phaser.Math.Between(-20, 20);
            
            const card = this.add.image(x, y, texture)
                .setOrigin(0.5)
                .setScale(0.5)
                .setRotation(Phaser.Math.DegToRad(angle))
                .setDepth(5 + i);
                
            // Add a subtle rotation animation
            this.tweens.add({
                targets: card,
                rotation: card.rotation + Phaser.Math.DegToRad(angle > 0 ? 5 : -5),
                duration: 3000 + (i * 500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createGameTitle(width, height) {
        // Create a fancy title for the game
        const titleShadow = this.add.text(width / 2 + 4, height / 4 + 4, "ALTAR", {
            fontSize: "64px",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            fill: "#000000",
            align: "center"
        }).setOrigin(0.5).setAlpha(0.7).setDepth(20);
        
        const title = this.add.text(width / 2, height / 4, "ALTAR", {
            fontSize: "64px",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            fill: "#ffffff",
            stroke: "#aa0000",
            strokeThickness: 6,
            align: "center",
            shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 5, fill: true }
        }).setOrigin(0.5).setDepth(21);
        
        // Add a subtle animation to the title
        this.tweens.add({
            targets: [title, titleShadow],
            scale: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
        
        // Add a subtitle
        this.add.text(width / 2, height / 4 + 50, "A game of skill and strategy", {
            fontSize: "24px",
            fontFamily: "Arial, sans-serif",
            fontStyle: "italic",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2,
            align: "center"
        }).setOrigin(0.5).setDepth(21);
    }
}

export default StartScene;
