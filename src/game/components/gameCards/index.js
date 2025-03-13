/**
 * GameCards - Handles all card and deck logic for the card game
 * This class encapsulates the deck management, card interactions, and related functionality
 */
class GameCards {
    constructor(scene) {
        this.scene = scene;
        this.deck = [];
    }

    /**
     * Initialize the deck with all possible cards
     */
    initializeDeck() {
        this.deck = [];
        const suits = ["clubs", "diamonds", "hearts", "spades"];
        
        // Add all cards to the deck (1-13 for each suit)
        // This creates exactly one card of each kind (52 cards total)
        for (const suit of suits) {
            for (let rank = 1; rank <= 13; rank++) {
                this.deck.push({
                    suit,
                    rank,
                    key: `card-${suit}-${rank}`
                });
            }
        }
        
        console.log(`Created deck with ${this.deck.length} cards`);
    }

    /**
     * Shuffle the deck using Fisher-Yates algorithm
     */
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        console.log("Deck shuffled");
    }

    /**
     * Add interactions to a player card
     * @param {Object} card - The card object to add interactions to
     * @param {number} index - The index of the card in the hand
     * @param {number} startX - The starting X position for the hand
     * @param {number} spacing - The spacing between cards
     * @param {number} targetY - The Y position for the hand
     */
    addCardInteractions(card, index, startX, spacing, targetY) {
        let hoveredCard = null;

        // Store the original position and depth for hover effects
        card.currentX = startX + spacing * index;
        card.currentY = targetY;
        card.originalDepth = 10 + index; // Store the original depth based on index
        card.setDepth(card.originalDepth); // Set initial depth
        card.isAnimating = false; // Initialize the animation flag

        card.setOrigin(0.5, 1); // Adjust origin for proper positioning
        card.setInteractive();
        card.movedToAltar = false; // Add a flag to track if the card has been moved to the altar
        console.log(`Card ${card.texture.key} is now interactive with depth ${card.originalDepth}.`);

        // Hover effect
        card.on("pointerover", () => {
            // Check if it's the player's turn before allowing hover effect
            if (card.movedToAltar || !card.input.enabled || this.scene.currentTurn !== 'player' || card.isAnimating) {
                return; // Ignore hover if disabled, on altar, not player's turn, or currently animating
            }

            // Kill any ongoing tweens for this card to prevent animation conflicts
            this.scene.tweens.killTweensOf(card);

            if (hoveredCard && hoveredCard !== card) {
                hoveredCard.emit("pointerout"); // Reset the previously hovered card
            }
            hoveredCard = card;
            
            // Store the current depth before changing it
            card.previousDepth = card.depth;
            
            // Bring the card to the front (highest depth)
            card.setDepth(1000); // Use a very high depth to ensure it's above everything
            
            // Apply the hover effect immediately
            this.scene.tweens.add({
                targets: card,
                scale: 1.2, // Keep the same scale, don't increase it
                y: card.currentY - 25, // Move up less on hover (25px instead of 50px)
                duration: 100, // Faster animation
                ease: "Power1",
            });
        });

        // Reset on pointer out
        card.on("pointerout", () => {
            if (card.movedToAltar || !card.input.enabled || card.isAnimating) {
                return; // Ignore if disabled, on altar, or currently animating
            }

            // Kill any ongoing tweens for this card to prevent animation conflicts
            this.scene.tweens.killTweensOf(card);

            if (hoveredCard === card) {
                hoveredCard = null;
            }
            
            // Reset the card's depth to its original value based on its position in the hand
            if (card.originalDepth !== undefined) {
                card.setDepth(card.originalDepth);
            } else {
                // Fallback if originalDepth is not set
                card.setDepth(10);
            }
            
            // Reset the card's position and scale
            this.scene.tweens.add({
                targets: card,
                scale: 1.2,
                y: card.currentY, // Return to original Y position
                duration: 100, // Faster animation
                ease: "Power1",
            });
        });

        // Click to play the card
        card.on("pointerdown", () => {
            // Double-check that it's the player's turn
            if (this.scene.currentTurn !== 'player') {
                console.log("Not player's turn - cannot play card");
                this.scene.showMessage("It's not your turn!");
                return;
            }
            
            // If the card is already being animated, ignore the click
            if (card.isAnimating) {
                console.log("Card is already being animated, ignoring click");
                return;
            }
            
            // Check if the card can be placed on the altar
            if (this.scene.altar.lastCardOnAltar) {
                const [lastSuit, lastRank] = this.scene.altar.lastCardOnAltar.texture.key.split("-").slice(1);
                const [cardSuit, cardRank] = card.texture.key.split("-").slice(1);
                
                // Check if the card matches the suit or rank of the last card on the altar
                if (cardSuit !== lastSuit && cardRank !== lastRank) {
                    console.log("Card does not match the altar's last card.");
                    
                    // Show a message to the player
                    this.scene.hints.showMessage("Card must match the suit or rank of the last card");
                    
                    // Set the animating flag to prevent multiple animations
                    card.isAnimating = true;
                    
                    // Shake the card to indicate it can't be played
                    this.scene.tweens.add({
                        targets: card,
                        x: card.x + 10,
                        duration: 50,
                        yoyo: true,
                        repeat: 3,
                        onComplete: () => {
                            // Reset the card to its original position and scale
                            card.x = card.currentX;
                            card.y = card.currentY;
                            card.scale = 1.2; // Reset to normal card scale in hand
                            card.setDepth(card.originalDepth);
                            // Reset the animating flag
                            card.isAnimating = false;
                            console.log(`Card animation complete, reset to position: ${card.currentX}, ${card.currentY}`);
                        }
                    });
                    
                    return; // Don't allow the card to be played
                }
            }

            // Proceed with playing the card
            console.log(`Player playing card ${card.texture.key}`);
            card.removeAllListeners(); // Stop hover and other events
            
            // Set the isAnimating flag to prevent hover effects during animation
            card.isAnimating = true;
            
            // Set a flag that player has thrown a card this turn
            // This will prevent drawing cards after playing a card
            // But still allow playing more cards
            this.scene.player.hasThrown = true;
            console.log("Setting player hasThrown flag to prevent drawing but allow more card plays");
            
            // Disable the draw pile immediately
            this.scene.disableDrawPileAfterCardPlay();
            
            // Use the common method to throw the card to the altar
            this.scene.throwCardToAltar(card, null, true);
        });
    }

    /**
     * Update the rotating cards in the draw pile
     */
    updateRotatingCards() {
        try {
            // Find all cards in the rotating circle (draw pile)
            const drawPileCards = this.scene.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key === "cardBack" &&
                Math.abs(child.x - this.scene.scale.width / 2) < 100 && 
                Math.abs(child.y - this.scene.scale.height / 2) < 100
            );
            
            // Update the number of cards displayed in the draw pile
            console.log(`Updating ${drawPileCards.length} rotating cards in the draw pile`);
            
            // If it's the player's turn, make sure the cards are interactive
            if (this.scene.currentTurn === 'player') {
                const holeX = this.scene.scale.width / 2;
                const holeY = this.scene.scale.height / 2;
                
                drawPileCards.forEach(card => {
                    if (card.input) {
                        card.input.enabled = true;
                        card.setAlpha(1.0); // Full opacity for enabled cards
                    } else {
                        // If the card doesn't have input, make it interactive
                        card.setInteractive();
                        card.setAlpha(1.0);
                    }
                    
                    // Ensure the card maintains its proper scale
                    if (!card.isHovered) {
                        card.setScale(0.9); // Maintain the proper scale
                    }
                    
                    // Make sure the card is properly rotated to point towards the center
                    const newRotation = Math.atan2(card.y - holeY, card.x - holeX) + Math.PI / 2;
                    card.setRotation(newRotation);
                });
                console.log("Made rotating cards interactive for player's turn");
            }
        } catch (error) {
            console.error("Error in updateRotatingCards:", error);
        }
    }

    /**
     * Add rotating cards inside the hole (draw pile)
     * @param {Object} options - Options for the rotating cards
     */
    addRotatingCardsInsideHole(options) {
        const { holeX, holeY, holeRadius, numCards, cardTexture } = options;
        
        // Create a container for the rotating cards
        const rotatingCards = [];
        
        // Create the specified number of cards
        for (let i = 0; i < numCards; i++) {
            // Calculate a position within the hole in a circle formation
            const angle = (i / numCards) * Math.PI * 2; // Evenly distribute cards in a circle
            const distance = holeRadius * 0.9; // Make the circle smaller to fit within the glass effect
            const x = holeX + Math.cos(angle) * distance;
            const y = holeY + Math.sin(angle) * distance;
            
            // Create the card
            const card = this.scene.add.image(x, y, cardTexture || "cardBack")
                .setScale(0.9) // Slightly smaller scale to fit within the glass effect
                .setDepth(5) // Set depth to 5 to ensure it's below the altar but above the background
                .setOrigin(0.5, 0.5)
                .setInteractive(); // Make the card interactive
            
            // Set the initial rotation so bottom points to center
            const fixedRotation = Math.atan2(y - holeY, x - holeX) + Math.PI / 2;
            card.setRotation(fixedRotation);
            
            // Store the card's original position and angle for rotation
            card.originalX = x;
            card.originalY = y;
            card.angle = angle; // Initial angle based on position in circle
            card.rotationRadius = distance;
            card.fixedRotation = fixedRotation; // Store the fixed rotation
            card.initialIndex = i; // Store the initial index to maintain position
            
            // Add the card to the array
            rotatingCards.push(card);
            
            // Add hover effect
            card.on("pointerover", () => {
                // Only show hover effect during player's turn
                if (this.scene.currentTurn === 'player') {
                    card.setScale(1.1); // Enlarge on hover
                    card.isHovered = true; // Track that the card is being hovered
                }
            });
            
            card.on("pointerout", () => {
                card.setScale(0.9); // Return to normal size
                card.isHovered = false; // Track that the card is no longer being hovered
            });
            
            card.on("pointerdown", () => {
                // Only allow drawing during player's turn
                if (this.scene.currentTurn !== 'player') {
                    console.log("Not player's turn - cannot draw cards");
                    return;
                }
                
                // If player has already thrown a card this turn, they can't draw
                if (this.scene.player.hasThrown) {
                    console.log("Player has already thrown a card this turn - cannot draw");
                    this.scene.showMessage("You can't draw after playing a card, but you can play more cards or end your turn.");
                    return;
                }
                
                // Check if player's hand is full (10 cards)
                const playerCards = this.scene.children.list.filter(
                    (child) => child.texture && 
                    child.texture.key.startsWith("card-") &&
                    child.y > this.scene.scale.height / 2 && // Only player cards (bottom half)
                    !child.movedToAltar // Not already on altar
                );
                
                if (playerCards.length >= 10) {
                    console.log("Player hand is full, cannot draw more cards");
                    this.scene.showCardLimitMessage();
                    return;
                }
                
                // Check if there are any cards left in the deck
                if (this.deck.length === 0) {
                    console.log("Deck is empty, cannot draw more cards");
                    this.scene.showMessage("Deck is empty!");
                    return;
                }
                
                // Draw a card from the deck, starting the animation from the clicked card's position
                this.scene.drawCards(1, { x: card.x, y: card.y });
                
                // Update the rotating cards to reflect the new deck size
                this.updateRotatingCards();
            });
        }
        
        // Store the rotating cards in the scene for later reference
        this.scene.rotatingCards = rotatingCards;
        
        // Track the overall rotation of the circle
        this.circleRotation = 0; // Make it a property of the class so it persists
        
        // Create a direct update method that will be called every frame
        const updateFunction = (time, delta) => {
            // Use a moderate increment for visible rotation
            // Normalize delta to prevent large jumps
            const normalizedDelta = Math.min(delta, 16.67); // Cap at ~60fps equivalent
            const rotationIncrement = 0.0002 * normalizedDelta;
            
            // Update the overall circle rotation
            this.circleRotation += rotationIncrement;
            
            // Update all cards based on their original position in the circle
            rotatingCards.forEach(card => {
                // Calculate the new angle based on the initial position plus the circle rotation
                const newAngle = card.initialIndex / numCards * Math.PI * 2 + this.circleRotation;
                
                // Calculate the new position based on the angle
                card.x = holeX + Math.cos(newAngle) * card.rotationRadius;
                card.y = holeY + Math.sin(newAngle) * card.rotationRadius;
                
                // Update the card's rotation to always point bottom towards center
                const newRotation = Math.atan2(card.y - holeY, card.x - holeX) + Math.PI / 2;
                card.setRotation(newRotation);
            });
        };
        
        // Add the update function to the scene's update event
        this.scene.events.on('update', updateFunction);
        
        return rotatingCards;
    }
}

export default GameCards;
