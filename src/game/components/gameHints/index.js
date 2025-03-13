/**
 * GameHints - Handles all game messages and hints
 * This class encapsulates all text messages shown to the player during gameplay
 */
class GameHints {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Clear any existing messages to prevent overlapping
     */
    clearMessages() {
        this.scene.children.list.forEach(child => {
            if (child && child.type === 'Text' && child.messageType === 'gameMessage') {
                child.destroy();
            }
            if (child && child.messageBackground) {
                child.destroy();
            }
        });
    }

    /**
     * Show a generic message to the player
     * @param {string} text - The message text to display
     */
    showMessage(text) {
        const messageX = this.scene.scale.width / 2;
        const messageY = this.scene.scale.height / 4;
        
        // Clear any existing messages
        this.clearMessages();
        
        const message = this.scene.add.text(messageX, messageY, text, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000)  // Increase depth to 1000 to ensure it's on top of everything
        .setAlpha(0);  // Start with invisible text
        
        // Tag this as a game message for easy identification
        message.messageType = 'gameMessage';
        
        // Fade in and out animation
        this.scene.tweens.add({
            targets: message,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 1500,
            repeat: 0,
            onComplete: () => {
                message.destroy();
            }
        });
    }

    /**
     * Show a message prompting the player to end their turn
     */
    showEndTurnMessage() {
        const messageX = this.scene.scale.width / 2;
        const messageY = this.scene.scale.height / 4;
        
        // Clear any existing messages
        this.clearMessages();
        
        const message = this.scene.add.text(messageX, messageY, "Click 'End Turn' to pass turn to CPU", {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000).setAlpha(0); // Increase depth to 1000 to ensure it's on top of everything
        
        // Tag this as a game message for easy identification
        message.messageType = 'gameMessage';
        
        // Fade in and out animation
        this.scene.tweens.add({
            targets: message,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 1500,
            repeat: 0,
            onComplete: () => {
                message.destroy();
            }
        });
    }

    /**
     * Show a message when the player reaches the maximum hand size
     */
    showCardLimitMessage() {
        // Clear any existing messages
        this.clearMessages();

        // Create a message when the player reaches the maximum hand size
        const message = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, "Maximum hand size (10 cards) reached", {
            font: "20px Arial",
            fill: "#FF0000",
            backgroundColor: "#FFFFFF",
            padding: { x: 10, y: 5 },
            align: "center",
        })
        .setOrigin(0.5)
        .setDepth(1000)  // Increase depth to 1000 to ensure it's on top of everything
        .setAlpha(0);  // Start with invisible text
        
        // Tag this as a game message for easy identification
        message.messageType = 'gameMessage';

        // Tween the message to fade in and out after 1.5 seconds
        this.scene.tweens.add({
            targets: message,
            alpha: 1,  // Fade in
            duration: 500,
            ease: "Power2",
            onComplete: () => {
                // Fade out after 1.5 seconds
                this.scene.time.delayedCall(1000, () => {
                    this.scene.tweens.add({
                        targets: message,
                        alpha: 0,  // Fade out
                        duration: 500,
                        ease: "Power2",
                    });
                });
            }
        });
    }

    /**
     * Show CPU thinking animation
     * @param {Function} callback - Function to call after thinking animation completes
     */
    showThinking(callback) {
        console.log("Showing CPU thinking animation");
        const thinkingX = this.scene.scale.width / 2;
        const thinkingY = 80;
        
        const thinkingText = this.scene.add.text(thinkingX, thinkingY, "Thinking...", {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);
        
        // Animate the thinking text
        this.scene.tweens.add({
            targets: thinkingText,
            alpha: { from: 1, to: 0 },
            duration: 1200,
            onComplete: () => {
                thinkingText.destroy();
                if (callback) callback();
            }
        });
    }

    /**
     * Show player win message with animation
     * @returns {Object} The message container with all elements
     */
    showPlayerWinMessage() {
        // Clear any existing messages
        this.clearMessages();
        
        // Center position
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        
        // Create a dark overlay for the entire screen
        const overlay = this.scene.add.rectangle(
            centerX, 
            centerY, 
            this.scene.scale.width, 
            this.scene.scale.height, 
            0x000000, 
            0.7
        ).setDepth(998).setAlpha(0);
        
        // Create decorative card suits in the background
        const suits = ['♠', '♥', '♦', '♣'];
        const suitObjects = [];
        
        for (let i = 0; i < 20; i++) {
            const suit = suits[Math.floor(Math.random() * suits.length)];
            const x = Math.random() * this.scene.scale.width;
            const y = Math.random() * this.scene.scale.height;
            const size = Math.random() * 30 + 20;
            const rotation = Math.random() * Math.PI;
            const color = suit === '♥' || suit === '♦' ? '#ff0000' : '#ffffff';
            
            const suitText = this.scene.add.text(x, y, suit, {
                fontSize: `${size}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: color,
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(998.5).setAlpha(0).setRotation(rotation);
            
            suitObjects.push(suitText);
        }
        
        // Create a fancy background for the win message
        const bgWidth = 500;
        const bgHeight = 200;
        
        // Add a shadow for depth effect
        const bgShadow = this.scene.add.rectangle(
            centerX + 8, 
            centerY + 8, 
            bgWidth, 
            bgHeight, 
            0x000000, 
            0.7
        ).setOrigin(0.5).setDepth(999).setAlpha(0);
        
        // Create a card-like background with rounded corners
        const bg = this.scene.add.rectangle(
            centerX, 
            centerY, 
            bgWidth, 
            bgHeight, 
            0x2c8d2c // Green for win
        ).setStrokeStyle(6, 0xffd700).setOrigin(0.5).setDepth(999).setAlpha(0);
        
        // Add decorative card suit corners to the background
        const cornerSize = 40;
        const cornerOffset = 20;
        
        // Top-left corner
        const topLeftCorner = this.scene.add.text(
            centerX - bgWidth/2 + cornerOffset, 
            centerY - bgHeight/2 + cornerOffset, 
            '♠', 
            {
                fontSize: `${cornerSize}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(999.1).setAlpha(0);
        
        // Bottom-right corner
        const bottomRightCorner = this.scene.add.text(
            centerX + bgWidth/2 - cornerOffset, 
            centerY + bgHeight/2 - cornerOffset, 
            '♠', 
            {
                fontSize: `${cornerSize}px`,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(999.1).setAlpha(0);
        
        // Create a container object to hold all elements for proper cleanup
        let message, subtitle;
        const messageContainer = {
            overlay: overlay,
            background: bg,
            shadow: bgShadow,
            corners: [topLeftCorner, bottomRightCorner],
            suits: suitObjects,
            get message() { return message; },
            get subtitle() { return subtitle; },
            destroy: function() {
                this.overlay.destroy();
                this.background.destroy();
                this.shadow.destroy();
                if (message) message.destroy();
                if (subtitle) subtitle.destroy();
                this.corners.forEach(corner => corner.destroy());
                this.suits.forEach(suit => suit.destroy());
            }
        };
        
        // Fade in the overlay first
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // Animate in the background elements
                this.scene.tweens.add({
                    targets: [bgShadow, bg, topLeftCorner, bottomRightCorner],
                    alpha: 1,
                    y: { from: centerY - 50, to: centerY },
                    duration: 600,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Create the main win message with card-themed styling AFTER background is visible
                        message = this.scene.add.text(centerX, centerY - 20, "CONGRATULATIONS", {
                            fontSize: '54px',
                            fontFamily: 'Arial Black, sans-serif',
                            fontStyle: 'bold',
                            fill: '#ffffff',
                            stroke: '#ffd700', // Gold stroke for more visibility
                            strokeThickness: 12, // Thicker stroke
                            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 6, stroke: true, fill: true }
                        }).setOrigin(0.5).setDepth(5000).setAlpha(1); // Extremely high depth to ensure it's on top of everything
                        
                        // Add a subtitle
                        subtitle = this.scene.add.text(centerX, centerY + 40, "You've played your cards right!", {
                            fontSize: '28px',
                            fontFamily: 'Arial, sans-serif',
                            fontStyle: 'italic',
                            fill: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 4, // Slightly thicker stroke
                            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, stroke: true, fill: true }
                        }).setOrigin(0.5).setDepth(5000).setAlpha(1); // Extremely high depth and visible immediately
                        
                        // Tag these as game messages for easy identification
                        message.messageType = 'gameMessage';
                        subtitle.messageType = 'gameMessage';
                        
                        // Add a shine effect to the background
                        const shine = this.scene.add.rectangle(
                            centerX - bgWidth/2, 
                            centerY, 
                            30, 
                            bgHeight, 
                            0xffffff, 
                            0.3
                        ).setOrigin(0.5).setDepth(999.2).setAlpha(0);
                        
                        this.scene.tweens.add({
                            targets: shine,
                            alpha: 0.5,
                            x: centerX + bgWidth/2,
                            duration: 1000,
                            ease: 'Sine.easeInOut',
                            repeat: -1,
                            delay: 500
                        });
                        
                        // Add a glow effect to the message immediately
                        const glowTween = this.scene.tweens.add({
                            targets: message,
                            strokeThickness: { from: 12, to: 18 },
                            duration: 800,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        // Add a scale effect to the message
                        this.scene.tweens.add({
                            targets: message,
                            scale: { from: 0.9, to: 1.1 },
                            duration: 1000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        // Animate the subtitle with a bounce effect
                        this.scene.tweens.add({
                            targets: subtitle,
                            scale: { from: 0.8, to: 1 },
                            duration: 800,
                            ease: 'Elastic.easeOut',
                            onComplete: () => {
                                // Make sure subtitle stays fully visible
                                subtitle.setAlpha(1);
                                
                                // Animate in the suit decorations
                                this.scene.tweens.add({
                                    targets: suitObjects,
                                    alpha: 0.7,
                                    duration: 1000,
                                    delay: (target, index) => index * 50,
                                    onComplete: () => {
                                        // Add floating animation to the suits
                                        suitObjects.forEach((suit, index) => {
                                            this.scene.tweens.add({
                                                targets: suit,
                                                y: suit.y + (index % 2 ? 20 : -20),
                                                rotation: suit.rotation + (index % 2 ? 0.2 : -0.2),
                                                duration: 2000 + Math.random() * 1000,
                                                yoyo: true,
                                                repeat: -1,
                                                ease: 'Sine.easeInOut'
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        
        // Return the message container for proper cleanup
        return messageContainer;
    }

    /**
     * Show game over message for CPU win
     * @returns {Object} The message container with all elements
     */
    showCPUWinMessage() {
        // Clear any existing messages
        this.clearMessages();
        
        // Center position
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        
        // Create a dark overlay for the entire screen
        const overlay = this.scene.add.rectangle(
            centerX, 
            centerY, 
            this.scene.scale.width, 
            this.scene.scale.height, 
            0x000000, 
            0.7
        ).setDepth(998).setAlpha(0);
        
        // Create torn/broken card pieces in the background
        const cardPieces = [];
        
        for (let i = 0; i < 15; i++) {
            // Create a card piece (rectangle with card-like appearance)
            const x = Math.random() * this.scene.scale.width;
            const y = Math.random() * this.scene.scale.height;
            const width = Math.random() * 60 + 20;
            const height = Math.random() * 80 + 30;
            const rotation = Math.random() * Math.PI;
            
            const cardPiece = this.scene.add.rectangle(
                x, y, width, height, 0xffffff
            ).setStrokeStyle(2, 0x888888)
            .setOrigin(0.5)
            .setDepth(998.5)
            .setAlpha(0)
            .setRotation(rotation);
            
            // Add a suit or rank to some pieces
            if (Math.random() > 0.5) {
                const suits = ['♠', '♥', '♦', '♣'];
                const ranks = ['A', 'K', 'Q', 'J', '10'];
                const symbol = Math.random() > 0.5 ? 
                    suits[Math.floor(Math.random() * suits.length)] : 
                    ranks[Math.floor(Math.random() * ranks.length)];
                
                const color = symbol === '♥' || symbol === '♦' ? '#ff0000' : '#000000';
                
                const symbolText = this.scene.add.text(
                    x, y, symbol, {
                        fontSize: `${Math.min(width, height) * 0.7}px`,
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        fill: color
                    }
                ).setOrigin(0.5).setDepth(998.6).setAlpha(0).setRotation(rotation);
                
                cardPieces.push(symbolText);
            }
            
            cardPieces.push(cardPiece);
        }
        
        // Create a fancy background for the game over message
        const bgWidth = 500;
        const bgHeight = 200;
        
        // Add a shadow for depth effect
        const bgShadow = this.scene.add.rectangle(
            centerX + 8, 
            centerY + 8, 
            bgWidth, 
            bgHeight, 
            0x000000, 
            0.7
        ).setOrigin(0.5).setDepth(999).setAlpha(0);
        
        // Create a card-like background with torn edges effect
        const bg = this.scene.add.rectangle(
            centerX, 
            centerY, 
            bgWidth, 
            bgHeight, 
            0x8d2c2c // Red for loss
        ).setStrokeStyle(6, 0x333333).setOrigin(0.5).setDepth(999).setAlpha(0);
        
        // Add decorative torn card edges
        const edgeCount = 8;
        const edgeObjects = [];
        
        for (let i = 0; i < edgeCount; i++) {
            const angle = (i / edgeCount) * Math.PI * 2;
            const distance = bgWidth * 0.5;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const edge = this.scene.add.rectangle(
                x, y, 20, 40, 0x666666
            ).setOrigin(0.5)
            .setDepth(999.1)
            .setAlpha(0)
            .setRotation(angle);
            
            edgeObjects.push(edge);
        }
        
        // Create the main game over message with card-themed styling
        const message = this.scene.add.text(centerX, centerY - 20, "GAME OVER", {
            fontSize: '72px',
            fontFamily: 'Arial Black, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#ff0000', // Red stroke for game over
            strokeThickness: 10,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5).setDepth(1000).setAlpha(0); // Start invisible to animate with box
        
        // Add a subtitle
        const subtitle = this.scene.add.text(centerX, centerY + 40, "The CPU has the winning hand!", {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1000).setAlpha(0);
        
        // Tag these as game messages for easy identification
        message.messageType = 'gameMessage';
        subtitle.messageType = 'gameMessage';
        
        // Create a container object to hold all elements for proper cleanup
        const messageContainer = {
            overlay: overlay,
            background: bg,
            shadow: bgShadow,
            message: message,
            subtitle: subtitle,
            cardPieces: cardPieces,
            edgeObjects: edgeObjects,
            destroy: function() {
                this.overlay.destroy();
                this.background.destroy();
                this.shadow.destroy();
                this.message.destroy();
                this.subtitle.destroy();
                this.cardPieces.forEach(piece => piece.destroy());
                this.edgeObjects.forEach(edge => edge.destroy());
            }
        };
        
        // Fade in the overlay first
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // Animate in the background elements with a shaking effect
                this.scene.tweens.add({
                    targets: [bgShadow, bg, ...edgeObjects],
                    alpha: 1,
                    y: { from: centerY - 50, to: centerY },
                    duration: 600,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Make sure the message and subtitle are visible and at the correct position
                        message.setPosition(centerX, centerY - 20);
                        subtitle.setPosition(centerX, centerY + 40);
                        
                        // Add a shake effect to the background
                        this.scene.tweens.add({
                            targets: [bg, bgShadow],
                            x: { from: centerX - 5, to: centerX + 5 },
                            duration: 50,
                            yoyo: true,
                            repeat: 5,
                            onComplete: () => {
                                // Reset position
                                bg.x = centerX;
                                bgShadow.x = centerX + 8;
                            }
                        });
                        
                        // Animate in the text with a dramatic effect
                        this.scene.tweens.add({
                            targets: [message, subtitle],
                            alpha: 1, // Fade in
                            scale: { from: 1.5, to: 1 },
                            duration: 800,
                            ease: 'Back.easeOut',
                            onComplete: () => {
                                // Ensure the message and subtitle are fully visible
                                message.setAlpha(1);
                                subtitle.setAlpha(1);
                                
                                // Add a glow effect to the message
                                const glowTween = this.scene.tweens.add({
                                    targets: message,
                                    strokeThickness: { from: 10, to: 15 },
                                    duration: 800,
                                    yoyo: true,
                                    repeat: -1,
                                    ease: 'Sine.easeInOut'
                                });
                                
                                // Animate in the card pieces with physics-like motion
                                this.scene.tweens.add({
                                    targets: cardPieces,
                                    alpha: 0.9,
                                    duration: 1000,
                                    delay: (target, index) => index * 50,
                                    onComplete: () => {
                                        // Add floating/falling animation to the card pieces
                                        cardPieces.forEach((piece, index) => {
                                            this.scene.tweens.add({
                                                targets: piece,
                                                y: piece.y + 100,
                                                x: piece.x + (Math.random() * 40 - 20),
                                                rotation: piece.rotation + (Math.random() * 0.5 - 0.25),
                                                alpha: 0.5,
                                                duration: 3000 + Math.random() * 2000,
                                                ease: 'Sine.easeIn'
                                            });
                                        });
                                        
                                        // Add a subtle pulsing effect to the message
                                        this.scene.tweens.add({
                                            targets: message,
                                            scale: 1.05,
                                            duration: 1000,
                                            yoyo: true,
                                            repeat: -1,
                                            ease: 'Sine.easeInOut'
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        
        // Return the message container for proper cleanup
        return messageContainer;
    }
}

export default GameHints;
