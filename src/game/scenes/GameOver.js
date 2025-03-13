/**
 * GameOver - Handles all game ending logic for the card game
 * This class encapsulates the win/lose conditions and end game animations
 */
export default class GameOver {
    constructor(scene) {
        this.scene = scene;
        this.playerWinProcessed = false;
        this.cpuWinProcessed = false;
        this.messageBox = null;
        this.playAgainButton = null;
    }

    /**
     * Reset win flags when starting a new game
     */
    resetWinFlags() {
        this.playerWinProcessed = false;
        this.cpuWinProcessed = false;
        
        // Clean up any existing message box
        if (this.messageBox) {
            this.messageBox.destroy();
            this.messageBox = null;
            console.log('Win flags and message box reset');
        }
    }

    /**
     * Check if the player has won
     * @returns {boolean} True if the player has won
     */
    checkPlayerWin() {
        // If player win has already been processed, don't process it again
        if (this.playerWinProcessed) {
            console.log('Player win already processed, skipping');
            return true;
        }

        // Check if the player has no cards left
        if (this.scene.player.handCards.length === 0) {
            console.log('Player has won!');
            this.playerWinProcessed = true;

            // Update the player's score
            this.scene.ui.updatePlayerScore();

            // Show a win message
            this.messageBox = this.scene.hints.showPlayerWinMessage();

            // Animate game over sequence - cards return to circle and altar goes down
            this.scene.animateGameOver();

            // Show the play again button after a delay
            this.scene.time.delayedCall(2000, () => {
                this.showPlayAgainButton();
            });

            return true;
        }

        return false;
    }

    /**
     * Check if the CPU has won
     * @returns {boolean} True if the CPU has won
     */
    checkCPUWin() {
        // If CPU win has already been processed, don't process it again
        if (this.cpuWinProcessed) {
            console.log('CPU win already processed, skipping');
            return true;
        }

        // Check if the CPU has no cards left
        if (this.scene.cpu.handCards.length === 0) {
            console.log('CPU has won!');
            this.cpuWinProcessed = true;

            // Update the CPU's score
            this.scene.ui.updateCPUScore();

            // Show a game over message
            this.messageBox = this.scene.hints.showCPUWinMessage();

            // Animate game over sequence - cards return to circle and altar goes down
            this.scene.animateGameOver();

            // Show the play again button after a delay
            this.scene.time.delayedCall(2000, () => {
                this.showPlayAgainButton();
            });

            return true;
        }

        return false;
    }

    /**
     * Show the play again button
     */
    showPlayAgainButton() {
        // Clean up any previous button
        if (this.playAgainButton) {
            if (this.playAgainButton.destroy && typeof this.playAgainButton.destroy === 'function') {
                this.playAgainButton.destroy();
            }
            this.playAgainButton = null;
        }

        // Center position
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2 + 150;

        // Create button shadow for depth effect
        const buttonShadow = this.scene.add.rectangle(
            centerX + 5, 
            centerY + 5, 
            200, 
            60, 
            0x000000, 
            0.7
        ).setOrigin(0.5).setDepth(1001);

        // Create stylish button background
        const buttonBg = this.scene.add.rectangle(
            centerX, 
            centerY, 
            200, 
            60, 
            0x3366cc
        ).setStrokeStyle(4, 0x1a3366)
        .setOrigin(0.5)
        .setDepth(1001)
        .setInteractive({ useHandCursor: true });

        // Add gradient overlay to button
        const buttonGradient = this.scene.add.rectangle(
            centerX, 
            centerY - 15, 
            190, 
            25, 
            0x66aaff, 
            0.3
        ).setOrigin(0.5).setDepth(1002);

        // Add button text
        const buttonText = this.scene.add.text(
            centerX, 
            centerY, 
            'PLAY AGAIN', 
            {
                fontSize: '24px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(1002);

        // Store button components
        this.playAgainButton = {
            shadow: buttonShadow,
            background: buttonBg,
            gradient: buttonGradient,
            text: buttonText,
            destroy: function() {
                this.shadow.destroy();
                this.background.destroy();
                this.gradient.destroy();
                this.text.destroy();
            }
        };

        // Add click event
        buttonBg.on('pointerdown', () => {
            // Disable interaction to prevent multiple clicks
            buttonBg.disableInteractive();
            
            // Reset win flags
            this.resetWinFlags();
            
            // Play button sound
            if (this.scene.sound.get('buttonClick')) {
                this.scene.sound.play('buttonClick');
            }
            
            // Add press effect
            this.scene.tweens.add({
                targets: [buttonBg, buttonGradient, buttonText],
                y: '+=5',
                duration: 100,
                onComplete: () => {
                    // Clean up any cards on the altar
                    if (this.scene.altar && this.scene.altar.lastCard) {
                        this.scene.altar.lastCard = null;
                    }
                    
                    // Restart the scene after a short delay
                    this.scene.time.delayedCall(300, () => {
                        this.scene.scene.restart();
                    });
                }
            });
        });

        // Add hover effects
        buttonBg.on('pointerover', () => {
            this.scene.tweens.add({
                targets: buttonBg,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
            
            this.scene.tweens.add({
                targets: [buttonGradient, buttonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        buttonBg.on('pointerout', () => {
            this.scene.tweens.add({
                targets: buttonBg,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
            
            this.scene.tweens.add({
                targets: [buttonGradient, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
    }
}
