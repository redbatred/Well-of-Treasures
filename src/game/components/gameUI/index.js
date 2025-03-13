/**
 * GameUI - Handles all UI elements for the card game
 * This class encapsulates the UI components, buttons, and related functionality
 */
class GameUI {
    constructor(scene) {
        this.scene = scene;
        this.endTurnButton = null;
        this.endTurnButtonText = null;
        this.turnText = null;
        this.buttonShadow = null;
        
        // Initialize score tracking
        // Use static properties to persist scores between game restarts
        if (GameUI.playerScore === undefined) {
            GameUI.playerScore = 0;
        }
        if (GameUI.cpuScore === undefined) {
            GameUI.cpuScore = 0;
        }
        
        // Score display elements
        this.scoreContainer = null;
        this.playerScoreText = null;
        this.cpuScoreText = null;
        this.scoreTitle = null;
        
        // Card arrangement buttons
        this.arrangeBySuitButton = null;
        this.arrangeByNumberButton = null;
        this.arrangementButtonElements = [];
    }

    /**
     * Create all UI elements
     */
    create() {
        this.createScoreDisplay();
        this.createEndTurnButton();
        this.createCardArrangementButtons();
        this.createTurnIndicator();
    }

    /**
     * Create the end turn button with enhanced styling
     */
    createEndTurnButton() {
        const buttonX = this.scene.scale.width - 120;
        const buttonY = this.scene.scale.height / 2;
        
        // Create a layered button effect
        const buttonBase = this.scene.add.rectangle(buttonX, buttonY, 140, 60, 0x1a3c5a)
            .setStrokeStyle(3, 0x4a8bbd)
            .setOrigin(0.5)
            .setDepth(100);

        const buttonMain = this.scene.add.rectangle(buttonX, buttonY, 134, 54, 0x2c5e8d)
            .setStrokeStyle(2, 0x7fb8e0)
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive();

        // Add inner glow effect
        const buttonGlow = this.scene.add.rectangle(buttonX, buttonY, 124, 44, 0x4a8bbd)
            .setAlpha(0.3)
            .setOrigin(0.5)
            .setDepth(102);

        // Create sophisticated text styling
        const buttonText = this.scene.add.text(buttonX, buttonY, 'END TURN', {
            fontSize: '22px',
            fontFamily: 'Impact, sans-serif',
            color: '#ffffff',
            stroke: '#1a3c5a',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(103);

        // Store references
        this.endTurnButton = buttonMain;
        this.endTurnButtonText = buttonText;
        this.buttonElements = [buttonBase, buttonMain, buttonGlow];

        // Add event listeners
        buttonMain.on('pointerdown', () => {
            // Press animation with rotation effect
            this.scene.tweens.add({
                targets: [buttonBase, buttonMain, buttonGlow, buttonText],
                y: '+=4',
                scale: 0.98,
                angle: 1,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    try {
                        if (this.scene.sound.get('buttonSound')) {
                            this.scene.sound.play("buttonSound");
                        }
                    } catch (error) {
                        console.warn("Error playing button sound:", error);
                    }
                    this.scene.endPlayerTurn();
                }
            });
        });

        buttonMain.on('pointerover', () => {
            // Hover animation with glow effect
            this.scene.tweens.add({
                targets: [buttonMain, buttonGlow],
                scale: 1.05,
                alpha: { value: 0.5, duration: 100 },
                duration: 200,
                ease: 'Sine.easeOut'
            });
            buttonText.setStyle({ color: '#ffd700', stroke: '#1a3c5a' });
        });

        buttonMain.on('pointerout', () => {
            // Reset animation
            this.scene.tweens.add({
                targets: [buttonMain, buttonGlow],
                scale: 1,
                alpha: { value: 0.3, duration: 100 },
                duration: 200,
                ease: 'Sine.easeOut'
            });
            buttonText.setStyle({ color: '#ffffff', stroke: '#1a3c5a' });
        });
    }

    /**
     * Create the turn indicator with modern styling
     */
    createTurnIndicator() {
        const bgWidth = 220;
        const bgHeight = 50;
        const bgX = 130;
        const bgY = 35;

        // Create a modern container with depth
        const bgBase = this.scene.add.rectangle(bgX, bgY, bgWidth, bgHeight, 0x1a3c5a)
            .setStrokeStyle(2, 0x4a8bbd)
            .setOrigin(0.5)
            .setDepth(98);

        const bgMain = this.scene.add.rectangle(bgX, bgY, bgWidth-8, bgHeight-8, 0x2c5e8d)
            .setStrokeStyle(2, 0x7fb8e0)
            .setOrigin(0.5)
            .setDepth(99);

        // Add animated shine effect with constrained boundaries
        const bgShine = this.scene.add.rectangle(
            bgX - bgWidth/2 + 20, // Start at left edge + padding
            bgY, 
            40, 
            bgHeight, 
            0xffffff
        ).setAlpha(0.1).setDepth(100);
        
        this.scene.tweens.add({
            targets: bgShine,
            x: bgX + bgWidth/2 - 20, // End at right edge - padding
            duration: 2000,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.inOut'
        });

        // Create sophisticated text styling
        this.turnText = this.scene.add.text(bgX, bgY, "PLAYER'S TURN", {
            font: "bold 22px 'Arial Black', sans-serif",
            color: '#ffd700',
            stroke: '#1a3c5a',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(101);

        // Store references
        this.turnIndicatorElements = [bgBase, bgMain, bgShine];
    }

    /**
     * Update the turn indicator text
     * @param {string} turn - The current turn ('player' or 'cpu')
     */
    updateTurnIndicator(turn) {
        if (this.turnText) {
            const newText = turn === 'player' ? "PLAYER'S TURN" : "CPU'S TURN";
            this.turnText.setText(newText);
            
            // Change color based on whose turn it is
            if (turn === 'player') {
                this.turnIndicatorElements[0].setFillStyle(0x2c5e8d);
                this.turnIndicatorElements[1].setFillStyle(0x7fb8e0);
            } else {
                this.turnIndicatorElements[0].setFillStyle(0x8d2c2c);
                this.turnIndicatorElements[1].setFillStyle(0xe07f7f);
            }
            
            // Add a flash effect when turn changes
            this.scene.tweens.add({
                targets: this.turnText,
                alpha: 0.7,
                duration: 100,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    this.turnText.setAlpha(1);
                }
            });
        }
    }

    /**
     * Enable the end turn button
     */
    enableEndTurnButton() {
        if (this.endTurnButton) {
            this.endTurnButton.setInteractive();
            this.endTurnButton.setAlpha(1.0);
            this.endTurnButtonText.setAlpha(1.0);
            this.buttonElements[0].setAlpha(1.0);
            this.buttonElements[1].setAlpha(1.0);
            this.buttonElements[2].setAlpha(1.0);
            console.log("End Turn button enabled");
        }
    }

    /**
     * Disable the end turn button
     */
    disableEndTurnButton() {
        if (this.endTurnButton) {
            this.endTurnButton.disableInteractive();
            this.endTurnButton.setAlpha(0.5);
            this.endTurnButtonText.setAlpha(0.5);
            this.buttonElements[0].setAlpha(0.5);
            this.buttonElements[1].setAlpha(0.5);
            this.buttonElements[2].setAlpha(0.5);
            console.log("End Turn button disabled");
        }
    }

    /**
     * Create a stylish play again button
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} The button object
     */
    createStylishButton(x, y, text, callback) {
        // Create layered button effect
        const buttonBase = this.scene.add.rectangle(x, y, 200, 70, 0x5a1a3c)
            .setStrokeStyle(3, 0xbd4a8b)
            .setOrigin(0.5)
            .setDepth(199);

        const buttonMain = this.scene.add.rectangle(x, y, 194, 64, 0x8d2c5e)
            .setStrokeStyle(2, 0xe07f7f)
            .setOrigin(0.5)
            .setDepth(200)
            .setInteractive();

        // Create particle emitter with strict containment
        const particles = this.scene.add.particles(x, y, 'cardBack', {
            speed: { min: 20, max: 30 },
            scale: { start: 0.15, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            emitting: false,
            bounds: {
                x: x - 97,  // Tight boundary with 3px padding
                y: y - 34,  // Tight boundary with 1px padding
                width: 194, // Match buttonMain width
                height: 64  // Match buttonMain height
            },
            bounce: 0.8,
            angle: { 
                min: -45, 
                max: 45 
            }
        }).setDepth(201);

        // Add masking shape that matches the button's visible area
        const maskShape = this.scene.add.graphics()
            .fillRect(x - 97, y - 34, 194, 64)
            .setVisible(false);
        
        particles.mask = new Phaser.Display.Masks.GeometryMask(this.scene, maskShape);

        // Create sophisticated text styling
        const buttonText = this.scene.add.text(x, y, text, {
            fontSize: '26px',
            fontFamily: "'Arial Black', sans-serif",
            color: '#ffffff',
            stroke: '#5a1a3c',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(202);

        // Add interactions
        buttonMain.on('pointerover', () => {
            particles.start();
            this.scene.tweens.add({
                targets: [buttonMain],
                scale: 1.05,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        buttonMain.on('pointerout', () => {
            particles.stop();
            this.scene.tweens.add({
                targets: [buttonMain],
                scale: 1,
                duration: 200,
                ease: 'Back.easeIn'
            });
        });

        // ... rest of button code remains functionally identical ...
    }

    /**
     * Resize UI elements based on screen size
     */
    resizeUI() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        // Resize turn indicator
        if (this.turnText) {
            const turnX = 130; // Keep it on the left side
            const turnY = 35;  // Keep it at the top
            
            this.turnText.setPosition(turnX, turnY);
            if (this.turnIndicatorElements && this.turnIndicatorElements.length) {
                this.turnIndicatorElements[0].setPosition(turnX, turnY);
                this.turnIndicatorElements[1].setPosition(turnX, turnY);
                this.turnIndicatorElements[2].setPosition(turnX - 80, turnY);
            }
        }

        // Resize score display
        if (this.scoreContainer) {
            const scoreY = 60; // Align with turn indicator at y=35
            
            // Update background position
            this.scoreContainer.background.setPosition(width - 150, scoreY);
            this.scoreContainer.shadow.setPosition(width - 150, scoreY + 5);
            this.scoreContainer.gradient.setPosition(width - 150, scoreY);
            
            // Update decorative elements
            this.scoreContainer.topDecoration.setPosition(width - 150, scoreY - 40);
            this.scoreContainer.bottomDecoration.setPosition(width - 150, scoreY + 40);
            
            // Update text positions
            this.scoreContainer.title.setPosition(width - 150, scoreY - 20);
            this.scoreContainer.playerScore.setPosition(width - 190, scoreY + 10);
            this.scoreContainer.cpuScore.setPosition(width - 110, scoreY + 10);
        }

        // Resize end turn button
        if (this.endTurnButton) {
            const buttonY = height - 60;
            const buttonX = width - 120;
            
            // Update all button elements
            this.endTurnButton.setPosition(buttonX, buttonY);
            this.endTurnButtonText.setPosition(buttonX, buttonY);
            
            if (this.buttonElements && this.buttonElements.length) {
                this.buttonElements.forEach(element => {
                    if (element) {
                        element.setPosition(buttonX, buttonY);
                    }
                });
            }
        }
        
        // Resize card arrangement buttons
        if (this.arrangeBySuitButton && this.arrangeByNumberButton) {
            const buttonY = height - 60;
            const baseX = 120;
            const buttonSpacing = 160;
            
            // Update positions of all arrangement button elements
            if (this.arrangementButtonElements && this.arrangementButtonElements.length >= 8) {
                // First 4 elements are for the suit button
                for (let i = 0; i < 4; i++) {
                    if (this.arrangementButtonElements[i]) {
                        this.arrangementButtonElements[i].setPosition(baseX, buttonY);
                    }
                }
                
                // Next 4 elements are for the number button
                for (let i = 4; i < 8; i++) {
                    if (this.arrangementButtonElements[i]) {
                        this.arrangementButtonElements[i].setPosition(baseX + buttonSpacing, buttonY);
                    }
                }
            }
        }
    }

    /**
     * Create a stylish score display
     */
    createScoreDisplay() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        
        // Position the score display in the top-right corner
        // Align with turn indicator (y=35)
        const scoreX = width - 150;
        const scoreY = 60; // Adjusted to align top with turn indicator
        
        // Create a container for the score display
        // Add a shadow for depth effect
        const scoreShadow = this.scene.add.rectangle(
            scoreX, 
            scoreY + 5, 
            200, 
            120, 
            0x000000, 
            0.5
        ).setOrigin(0.5).setDepth(95);
        
        // Create a stylish background with gradient
        const scoreBg = this.scene.add.rectangle(
            scoreX, 
            scoreY, 
            200, 
            120, 
            0x2c5e8d
        ).setStrokeStyle(3, 0xffd700).setOrigin(0.5).setDepth(96);
        
        // Add a gradient effect to the top of the score display
        const scoreGradient = this.scene.add.rectangle(
            scoreX, 
            scoreY, 
            190, 
            30, 
            0x4a8bbd
        ).setOrigin(0.5).setDepth(97);
        
        // Add decorative elements to the score display
        const topDecoration = this.scene.add.rectangle(
            scoreX, 
            scoreY - 40, 
            180, 
            5, 
            0xffd700
        ).setDepth(97);
        
        const bottomDecoration = this.scene.add.rectangle(
            scoreX, 
            scoreY + 40, 
            180, 
            5, 
            0xffd700
        ).setDepth(97);
        
        // Create the score title
        const scoreTitle = this.scene.add.text(
            scoreX, 
            scoreY - 20, 
            "SCORE", 
            {
                fontSize: "24px",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, fill: true }
            }
        ).setOrigin(0.5).setDepth(98);
        
        // Create player score text
        const playerScore = this.scene.add.text(
            scoreX - 40, 
            scoreY + 10, 
            `PLAYER: ${GameUI.playerScore}`, 
            {
                fontSize: "18px",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(98);
        
        // Create CPU score text
        const cpuScore = this.scene.add.text(
            scoreX + 40, 
            scoreY + 10, 
            `CPU: ${GameUI.cpuScore}`, 
            {
                fontSize: "18px",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(98);
        
        // Store references to all score elements
        this.scoreContainer = {
            background: scoreBg,
            shadow: scoreShadow,
            gradient: scoreGradient,
            topDecoration: topDecoration,
            bottomDecoration: bottomDecoration,
            title: scoreTitle,
            playerScore: playerScore,
            cpuScore: cpuScore
        };
        
        // Store individual references for backward compatibility
        this.scoreTitle = scoreTitle;
        this.playerScoreText = playerScore;
        this.cpuScoreText = cpuScore;
        
        // Add a subtle pulsing animation to the score title
        this.scene.tweens.add({
            targets: scoreTitle,
            scale: 1.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log("Score display created");
    }
    
    /**
     * Update the player score
     */
    updatePlayerScore() {
        // Change from increment operator to simple assignment
        GameUI.playerScore = GameUI.playerScore + 1;
        
        if (this.playerScoreText) {
            this.playerScoreText.setText(`PLAYER: ${GameUI.playerScore}`);
            
            // Also update the scoreContainer reference if it exists
            if (this.scoreContainer && this.scoreContainer.playerScore) {
                this.scoreContainer.playerScore.setText(`PLAYER: ${GameUI.playerScore}`);
            }
            
            // Add a highlight effect when score changes
            this.scene.tweens.add({
                targets: this.playerScoreText,
                scale: 1.3,
                duration: 300,
                yoyo: true,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Add a particle effect for winning
                    this.createScoreParticles(
                        this.playerScoreText.x, 
                        this.playerScoreText.y, 
                        0x00ff00
                    );
                }
            });
        }
        console.log(`Player score updated: ${GameUI.playerScore}`);
    }
    
    /**
     * Update the CPU score
     */
    updateCPUScore() {
        // Change from increment operator to simple assignment
        GameUI.cpuScore = GameUI.cpuScore + 1;
        
        if (this.cpuScoreText) {
            this.cpuScoreText.setText(`CPU: ${GameUI.cpuScore}`);
            
            // Also update the scoreContainer reference if it exists
            if (this.scoreContainer && this.scoreContainer.cpuScore) {
                this.scoreContainer.cpuScore.setText(`CPU: ${GameUI.cpuScore}`);
            }
            
            // Add a highlight effect when score changes
            this.scene.tweens.add({
                targets: this.cpuScoreText,
                scale: 1.3,
                duration: 300,
                yoyo: true,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Add a particle effect for losing
                    this.createScoreParticles(
                        this.cpuScoreText.x, 
                        this.cpuScoreText.y, 
                        0xff0000
                    );
                }
            });
        }
        console.log(`CPU score updated: ${GameUI.cpuScore}`);
    }
    
    /**
     * Create particles for score update effect
     */
    createScoreParticles(x, y, color) {
        const particles = this.scene.add.particles(x, y, 'cardBack', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.1, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            tint: color,
            quantity: 1,
            frequency: 50,
            maxParticles: 10
        });
        
        // Stop emitting after a short time
        this.scene.time.delayedCall(500, () => {
            particles.stop();
            
            // Destroy the particles after they've all expired
            this.scene.time.delayedCall(1000, () => {
                particles.destroy();
            });
        });
    }
    
    /**
     * Reset scores to zero
     */
    resetScores() {
        GameUI.playerScore = 0;
        GameUI.cpuScore = 0;
        
        if (this.playerScoreText) {
            this.playerScoreText.setText(`PLAYER: ${GameUI.playerScore}`);
        }
        
        if (this.cpuScoreText) {
            this.cpuScoreText.setText(`CPU: ${GameUI.cpuScore}`);
        }
        
        console.log("Scores reset to zero");
    }

    /**
     * Create card arrangement buttons for organizing player's hand
     */
    createCardArrangementButtons() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        
        // Position buttons at the bottom left
        const buttonSpacing = 160; // Space between buttons
        const baseX = 120; // Starting X position
        const buttonY = height - 60; // Y position (bottom of screen with margin)
        
        // Create "Arrange by Suit" button
        const suitButtonX = baseX;
        
        // Create layered button effect for Suit button
        const suitButtonBase = this.scene.add.rectangle(suitButtonX, buttonY, 140, 60, 0x1a3c5a)
            .setStrokeStyle(3, 0x4a8bbd)
            .setOrigin(0.5)
            .setDepth(100);

        const suitButtonMain = this.scene.add.rectangle(suitButtonX, buttonY, 134, 54, 0x2c5e8d)
            .setStrokeStyle(2, 0x7fb8e0)
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive();

        // Add inner glow effect
        const suitButtonGlow = this.scene.add.rectangle(suitButtonX, buttonY, 124, 44, 0x4a8bbd)
            .setAlpha(0.3)
            .setOrigin(0.5)
            .setDepth(102);

        // Create text styling
        const suitButtonText = this.scene.add.text(suitButtonX, buttonY, 'BY SUIT', {
            fontSize: '20px',
            fontFamily: 'Impact, sans-serif',
            color: '#ffffff',
            stroke: '#1a3c5a',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(103);

        // Create "Arrange by Number" button
        const numberButtonX = baseX + buttonSpacing;
        
        // Create layered button effect for Number button
        const numberButtonBase = this.scene.add.rectangle(numberButtonX, buttonY, 140, 60, 0x1a3c5a)
            .setStrokeStyle(3, 0x4a8bbd)
            .setOrigin(0.5)
            .setDepth(100);

        const numberButtonMain = this.scene.add.rectangle(numberButtonX, buttonY, 134, 54, 0x2c5e8d)
            .setStrokeStyle(2, 0x7fb8e0)
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive();

        // Add inner glow effect
        const numberButtonGlow = this.scene.add.rectangle(numberButtonX, buttonY, 124, 44, 0x4a8bbd)
            .setAlpha(0.3)
            .setOrigin(0.5)
            .setDepth(102);

        // Create text styling
        const numberButtonText = this.scene.add.text(numberButtonX, buttonY, 'BY NUMBER', {
            fontSize: '20px',
            fontFamily: 'Impact, sans-serif',
            color: '#ffffff',
            stroke: '#1a3c5a',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(103);

        // Store references
        this.arrangeBySuitButton = suitButtonMain;
        this.arrangeByNumberButton = numberButtonMain;
        this.arrangementButtonElements = [
            suitButtonBase, suitButtonMain, suitButtonGlow, suitButtonText,
            numberButtonBase, numberButtonMain, numberButtonGlow, numberButtonText
        ];

        // Add event listeners for Suit button
        suitButtonMain.on('pointerdown', () => {
            // Press animation with rotation effect
            this.scene.tweens.add({
                targets: [suitButtonBase, suitButtonMain, suitButtonGlow, suitButtonText],
                y: '+=4',
                scale: 0.98,
                angle: 1,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    try {
                        if (this.scene.sound.get('buttonSound')) {
                            this.scene.sound.play("buttonSound");
                        }
                    } catch (error) {
                        console.warn("Error playing button sound:", error);
                    }
                    this.arrangeCardsBySuit();
                }
            });
        });

        suitButtonMain.on('pointerover', () => {
            // Hover animation with glow effect
            this.scene.tweens.add({
                targets: [suitButtonMain, suitButtonGlow],
                scale: 1.05,
                alpha: { value: 0.5, duration: 100 },
                duration: 200,
                ease: 'Sine.easeOut'
            });
            suitButtonText.setStyle({ color: '#ffd700', stroke: '#1a3c5a' });
        });

        suitButtonMain.on('pointerout', () => {
            // Reset animation
            this.scene.tweens.add({
                targets: [suitButtonMain, suitButtonGlow],
                scale: 1,
                alpha: { value: 0.3, duration: 100 },
                duration: 200,
                ease: 'Sine.easeOut'
            });
            suitButtonText.setStyle({ color: '#ffffff', stroke: '#1a3c5a' });
        });

        // Add event listeners for Number button
        numberButtonMain.on('pointerdown', () => {
            // Press animation with rotation effect
            this.scene.tweens.add({
                targets: [numberButtonBase, numberButtonMain, numberButtonGlow, numberButtonText],
                y: '+=4',
                scale: 0.98,
                angle: 1,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    try {
                        if (this.scene.sound.get('buttonSound')) {
                            this.scene.sound.play("buttonSound");
                        }
                    } catch (error) {
                        console.warn("Error playing button sound:", error);
                    }
                    this.arrangeCardsByNumber();
                }
            });
        });

        numberButtonMain.on('pointerover', () => {
            // Hover animation with glow effect
            this.scene.tweens.add({
                targets: [numberButtonMain, numberButtonGlow],
                scale: 1.05,
                alpha: { value: 0.5, duration: 100 },
                duration: 200,
                ease: 'Sine.easeOut'
            });
            numberButtonText.setStyle({ color: '#ffd700', stroke: '#1a3c5a' });
        });

        numberButtonMain.on('pointerout', () => {
            // Reset animation
            this.scene.tweens.add({
                targets: [numberButtonMain, numberButtonGlow],
                scale: 1,
                alpha: { value: 0.3, duration: 100 },
                duration: 200,
                ease: 'Sine.easeOut'
            });
            numberButtonText.setStyle({ color: '#ffffff', stroke: '#1a3c5a' });
        });
    }

    /**
     * Arrange player cards by suit with animation
     * Hearts, Diamonds, Clubs, Spades
     */
    arrangeCardsBySuit() {
        console.log("Arranging cards by suit");
        
        // Find all player cards - these are cards in the player's hand area
        // They have card-* textures and aren't on the altar
        const playerCards = this.scene.children.list.filter(
            child => child && child.texture && 
            child.texture.key.startsWith("card-") &&
            !child.movedToAltar
        );
        
        if (playerCards.length === 0) {
            console.log("No player cards to arrange");
            return;
        }
        
        // Sort cards by suit: Hearts, Diamonds, Clubs, Spades
        const suitOrder = { 'hearts': 0, 'diamonds': 1, 'clubs': 2, 'spades': 3 };
        
        playerCards.sort((a, b) => {
            // Extract suit from card texture key (e.g., "card-clubs-1")
            const aSuit = a.texture.key.split('-')[1];
            const bSuit = b.texture.key.split('-')[1];
            
            // Sort by suit order
            return suitOrder[aSuit] - suitOrder[bSuit];
        });
        
        // Animate cards to their new positions using the player's card layout system
        this.animatePlayerCardsToNewPositions(playerCards);
    }

    /**
     * Arrange player cards by number with animation
     * Ace (1), 2-10, Jack (11), Queen (12), King (13)
     */
    arrangeCardsByNumber() {
        console.log("Arranging cards by number");
        
        // Find all player cards - these are cards in the player's hand area
        // They have card-* textures and aren't on the altar
        const playerCards = this.scene.children.list.filter(
            child => child && child.texture && 
            child.texture.key.startsWith("card-") &&
            !child.movedToAltar
        );
        
        if (playerCards.length === 0) {
            console.log("No player cards to arrange");
            return;
        }
        
        playerCards.sort((a, b) => {
            // Extract value from card texture key (e.g., "card-clubs-1")
            const aValue = parseInt(a.texture.key.split('-')[2], 10);
            const bValue = parseInt(b.texture.key.split('-')[2], 10);
            
            // Sort by numeric value
            return aValue - bValue;
        });
        
        // Animate cards to their new positions using the player's card layout system
        this.animatePlayerCardsToNewPositions(playerCards);
    }

    /**
     * Animate player cards to their new positions based on the sorted order
     * Uses the game's existing card layout system for consistency
     * @param {Array} sortedCards - Array of card sprites in the desired order
     */
    animatePlayerCardsToNewPositions(sortedCards) {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const cardCount = sortedCards.length;
        
        // Use the same spacing logic as the player's rearrangeCards method
        const spacing = 50; // Maximum spacing between cards
        const startX = width / 2 - (spacing * (cardCount - 1)) / 2;
        const targetY = height - 10;
        
        // Animate each card to its new position with a staggered effect
        sortedCards.forEach((card, index) => {
            const targetX = startX + (index * spacing);
            
            // Temporarily disable input during animation
            if (card.input) {
                card.input.enabled = false;
            }
            
            // Set the animating flag to prevent interactions during animation
            card.isAnimating = true;
            
            // Update the card's original depth based on its new index
            card.originalDepth = 10 + index;
            
            // Set the depth immediately
            card.setDepth(card.originalDepth);
            
            // Create a smooth animation to the new position
            this.scene.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                duration: 500,
                ease: 'Power2',
                delay: index * 50, // Stagger the animations
                onComplete: () => {
                    if (card) {
                        // Update the card's position references
                        card.currentX = targetX;
                        card.currentY = targetY;
                        
                        // Ensure the depth is set correctly
                        card.setDepth(card.originalDepth);
                        
                        // Reset the animating flag
                        card.isAnimating = false;
                        
                        // Only re-enable input if it's still the player's turn
                        if (this.scene.currentTurn === 'player' && card.input) {
                            card.input.enabled = true;
                        }
                        
                        // Play a subtle sound effect for the last card
                        if (index === sortedCards.length - 1) {
                            try {
                                if (this.scene.sound.get('buttonSound')) {
                                    this.scene.sound.play("buttonSound", { volume: 0.3 });
                                }
                            } catch (error) {
                                console.warn("Error playing card arrangement sound:", error);
                            }
                        }
                    }
                }
            });
        });
        
        // Check if player has any valid moves left after rearranging
        if (this.scene.player && typeof this.scene.player.checkValidMoves === 'function') {
            this.scene.time.delayedCall(500 + sortedCards.length * 50, () => {
                this.scene.player.checkValidMoves();
            });
        }
    }
}

export default GameUI;
