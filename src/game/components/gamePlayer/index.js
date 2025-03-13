/**
 * GamePlayer - Handles all player logic for the card game
 * This class encapsulates the player's decision-making and actions
 */
class GamePlayer {
    constructor(scene) {
        this.scene = scene;
        this.hasDrawn = false; // Track if player has drawn a card this turn
        this.hasThrown = false; // Track if player has thrown a card this turn
        this.hasShownPlayMoreMessage = false; // Track if "You can play more cards" message has been shown
        this.handCards = []; // Array to track player's hand cards
    }

    /**
     * Reset player state for a new turn
     */
    resetState() {
        this.hasDrawn = false;
        this.hasThrown = false;
        this.hasShownPlayMoreMessage = false;
        
        // Update handCards array to match current cards in the scene
        this.updateHandCards();
    }
    
    /**
     * Update the handCards array to match the current cards in the scene
     */
    updateHandCards() {
        // Get all player cards from the scene
        this.handCards = this.scene.children.list.filter(
            (child) => child && child.texture && 
            child.texture.key && child.texture.key.startsWith("card-") &&
            child.y > this.scene.scale.height / 2 && // Only player cards (bottom half)
            !child.movedToAltar // Not already on altar
        );
        
        console.log(`Updated player handCards array, now contains ${this.handCards.length} cards`);
    }

    /**
     * End player turn and start CPU turn
     */
    endTurn() {
        if (this.scene.currentTurn !== 'player') {
            console.log("Not player's turn, can't end turn");
            return;
        }
        
        console.log("Ending player's turn");
        this.scene.currentTurn = 'cpu';
        this.scene.ui.updateTurnIndicator('cpu');
        this.resetState(); // Reset the flags for next turn
        console.log("Reset playerHasThrown to false for next turn");
        
        // Disable player card interactions during CPU turn
        this.disableCards();
        
        // Disable any draw pile interactions
        this.disableDrawPile();
        
        // Show a message that it's CPU's turn
        this.scene.hints.showMessage("CPU's Turn");
        
        // Give a short delay before CPU takes its turn
        this.scene.time.delayedCall(1000, () => {
            console.log("Starting CPU turn");
            try {
                // Use the CPU controller
                this.scene.cpu.takeTurn();
            } catch (error) {
                console.error("Error during CPU turn:", error);
                // If CPU turn fails, give control back to player
                this.scene.endCPUTurn();
            }
        });
    }

    /**
     * Disable the draw pile during CPU's turn
     */
    disableDrawPile() {
        console.log("Disabling draw pile");
        
        try {
            // Check if input and list are available
            if (!this.scene.input || !this.scene.input.list) {
                console.warn("Input list not available, skipping draw pile disable");
                return;
            }
            
            // Find all interactive objects that might be draw piles
            const interactiveObjects = this.scene.input.list.getAll();
            
            if (!interactiveObjects || !Array.isArray(interactiveObjects)) {
                console.warn("No interactive objects found, skipping draw pile disable");
                return;
            }
            
            interactiveObjects.forEach(obj => {
                try {
                    // If this is a card back (likely a draw pile)
                    if (obj && obj.gameObject && obj.gameObject.texture && 
                        (obj.gameObject.texture.key.includes('cardBack') || obj.gameObject.texture.key.includes('card-back'))) {
                        obj.enabled = false; // Disable interaction
                        // Remove the transparency effect - cards should always be fully visible
                        if (obj.gameObject) {
                            obj.gameObject.setAlpha(1.0); // Keep full opacity even when disabled
                        }
                    }
                } catch (error) {
                    console.warn("Error disabling interactive object:", error);
                }
            });
            
            // Also disable all player cards
            this.disableCards();
        } catch (error) {
            console.error("Error in disableDrawPile:", error);
        }
    }

    /**
     * Enable the draw pile during player's turn
     */
    enableDrawPile() {
        try {
            console.log("Enabling draw pile");
            
            // Find all cards in the rotating circle (draw pile)
            const drawPileCards = this.scene.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key === "cardBack" &&
                Math.abs(child.x - this.scene.scale.width / 2) < 100 && 
                Math.abs(child.y - this.scene.scale.height / 2) < 100
            );
            
            console.log(`Found ${drawPileCards.length} cards in the draw pile`);
            
            // Enable all draw pile cards
            drawPileCards.forEach(card => {
                if (card.input) {
                    card.input.enabled = true;
                    card.setAlpha(1.0); // Full opacity for enabled cards
                } else {
                    // If the card doesn't have input, make it interactive
                    card.setInteractive();
                    card.setAlpha(1.0);
                }
            });
            
            // Also check interactive objects if available
            if (this.scene.input && this.scene.input.list) {
                const interactiveObjects = this.scene.input.list.getAll();
                
                // Enable interaction for the draw pile
                interactiveObjects.forEach(obj => {
                    if (obj.gameObject && obj.gameObject.texture && 
                        obj.gameObject.texture.key === "cardBack" && 
                        Math.abs(obj.gameObject.x - this.scene.scale.width / 2) < 100 && 
                        Math.abs(obj.gameObject.y - this.scene.scale.height / 2) < 100) {
                        obj.enabled = true;
                    }
                });
            } else {
                console.log("Input list not available, skipping interactive objects check");
            }
            
            console.log("Draw pile enabled");
        } catch (error) {
            console.error("Error in enableDrawPile:", error);
        }
    }

    /**
     * Disable player card interactions
     */
    disableCards() {
        console.log("Disabling player cards");
        
        try {
            // Check if children list is available
            if (!this.scene.children || !this.scene.children.list) {
                console.warn("Children list not available, skipping player cards disable");
                return;
            }
            
            const playerCards = this.scene.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key && child.texture.key.startsWith("card-") &&
                child.y > this.scene.scale.height / 2 && // Only player cards (bottom half)
                !child.movedToAltar // Not already on altar
            );
            
            playerCards.forEach(card => {
                try {
                    if (card.input) {
                        card.input.enabled = false;
                    }
                } catch (error) {
                    console.warn("Error disabling player card:", error);
                }
            });
            
            // Also disable the end turn button during CPU's turn
            try {
                if (this.scene.ui && this.scene.ui.endTurnButton) {
                    this.scene.ui.disableEndTurnButton();
                    console.log("End Turn button disabled");
                }
            } catch (error) {
                console.warn("Error disabling end turn button:", error);
            }
        } catch (error) {
            console.error("Error in disablePlayerCards:", error);
        }
    }

    /**
     * Enable player card interactions
     */
    enableCards() {
        console.log("Enabling player cards");
        
        try {
            // Check if children list is available
            if (!this.scene.children || !this.scene.children.list) {
                console.warn("Children list not available, skipping player cards enable");
                return;
            }
            
            const playerCards = this.scene.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key && child.texture.key.startsWith("card-") &&
                child.y > this.scene.scale.height / 2 && // Only player cards (bottom half)
                !child.movedToAltar // Not already on altar
            );
            
            playerCards.forEach(card => {
                try {
                    if (card.input) {
                        card.input.enabled = true;
                    }
                } catch (error) {
                    console.warn("Error enabling player card:", error);
                }
            });
            
            // Re-enable the draw pile
            try {
                this.enableDrawPile();
            } catch (error) {
                console.warn("Error enabling draw pile:", error);
            }
            
            // Re-enable the end turn button
            try {
                if (this.scene.ui && this.scene.ui.endTurnButton) {
                    this.scene.ui.enableEndTurnButton();
                    console.log("End Turn button enabled");
                }
            } catch (error) {
                console.warn("Error enabling end turn button:", error);
            }
        } catch (error) {
            console.error("Error in enablePlayerCards:", error);
        }
    }

    /**
     * Draw cards for the player
     * @param {number} numCards - Number of cards to draw
     * @param {Object} centerPosition - Position to start drawing from
     * @param {Function} onComplete - Callback after drawing is complete
     */
    drawCards(numCards, centerPosition, onComplete) {
        // Only allow drawing during player's turn
        // Skip this check only for initial setup (when onComplete is provided)
        if (this.scene.currentTurn !== 'player' && !onComplete) {
            console.log("Not player's turn - cannot draw cards");
            return;
        }
        
        // If player has already thrown a card this turn, they can't draw
        if (this.scene.currentTurn === 'player' && this.hasThrown && !onComplete) {
            console.log("Player has already thrown a card this turn - cannot draw");
            this.scene.hints.showMessage("You can't draw after playing a card, but you can play more cards or end your turn.");
            return;
        }
        
        // Check if there are any cards left in the deck
        if (!this.scene.cards.deck || this.scene.cards.deck.length === 0) {
            console.log("Deck is empty, cannot draw more cards");
            this.scene.hints.showMessage("Deck is empty!");
            return;
        }
        
        const suits = ["clubs", "diamonds", "hearts", "spades"];
        const targetY = this.scene.scale.height - 10; // Position at the bottom of the screen
        
        // Make sure handCards is up to date
        this.updateHandCards();

        // If player's hand is full (10 cards), show message and don't draw
        if (this.handCards.length >= 10) {
            console.log("Player hand is full, cannot draw more cards");
            this.scene.hints.showCardLimitMessage(); // Display the message when max cards are reached
            return;
        }

        // If this is a player action (not initial setup), mark that they've drawn
        // This is just for tracking purposes, not to restrict drawing
        if (this.scene.currentTurn === 'player' && !onComplete) {
            this.hasDrawn = true;
            console.log("Player has drawn a card this turn");
        }

        // Calculate the total number of cards after adding new ones
        const totalCards = this.handCards.length + numCards;

        // Define spacing and calculate the starting X position for the new hand
        const maxSpacing = 50; // Maximum spacing between cards
        const minSpacing = 20; // Minimum spacing between cards
        const spacing = Math.max(minSpacing, maxSpacing - (totalCards - 1) * 2);
        const startX = this.scene.scale.width / 2 - ((spacing * (totalCards - 1)) / 2);

        // Animate existing cards to their new positions
        this.handCards.forEach((card, index) => {
            const targetX = startX + spacing * index;

            this.scene.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 1.2,
                duration: 500,
                ease: "Power2",
                onComplete: () => {
                    card.currentX = targetX; // Update the card's currentX
                    card.currentY = targetY; // Update the card's currentY
                    this.scene.addCardInteractions(card, index, startX, spacing, targetY);
                },
            });
        });

        // Draw the new cards
        for (let i = 0; i < numCards; i++) {
            // Check if there are any cards left in the deck
            if (!this.scene.cards.deck || this.scene.cards.deck.length === 0) {
                console.log("Deck is empty or not initialized, cannot draw more cards");
                this.scene.hints.showMessage("Deck is empty!");
                break;
            }
            
            // Draw a card from the deck
            const cardData = this.scene.cards.deck.pop();
            console.log(`Drawing card ${cardData.key} from deck. ${this.scene.cards.deck.length} cards remaining.`);

            // Calculate the position of the new card
            const index = this.handCards.length;
            const targetX = startX + spacing * index;

            // Set a higher depth for the new card during animation to ensure it appears on top
            const animationDepth = 100 + index; // High depth during animation
            const finalDepth = 10 + index; // Final depth after animation
            
            // Create the card at the center position (draw pile)
            const card = this.scene.add.image(centerPosition.x, centerPosition.y, cardData.key)
                .setScale(1)
                .setDepth(animationDepth); // Higher depth during animation

            // Store the original depth for hover effects
            card.originalDepth = finalDepth;
            card.isAnimating = true; // Set the animation flag during the initial animation

            // Add the new card to the handCards array
            this.handCards.push(card);

            // Animate the card directly from the center to its position at the end of the hand
            this.scene.tweens.add({
                targets: card,
                x: targetX, // Move horizontally to the end of the hand row
                y: targetY, // Move to the player's hand row
                scale: 1.2,
                duration: 600, // Faster animation (was 1000ms)
                ease: "Power2",
                onStart: () => {
                    // Play the throw card sound
                    this.scene.sound.play("drawSound");
                },
                onComplete: () => {
                    // Set the final depth after animation completes
                    card.setDepth(finalDepth);
                    card.isAnimating = false; // Reset the animation flag
                    this.scene.addCardInteractions(card, index, startX, spacing, targetY);
                    if (i === numCards - 1) {
                        // If this is the last card and we're in player's turn (not initial setup)
                        if (this.scene.currentTurn === 'player' && !onComplete) {
                            // Rearrange all player cards to ensure proper spacing and form
                            this.rearrangeCards();
                        }
                        
                        // Call the completion callback if provided (for initial setup)
                        if (onComplete) onComplete();
                    }
                },
            });
        }
    }

    /**
     * Rearrange player cards in hand
     */
    rearrangeCards() {
        // Use the handCards property directly instead of filtering the scene's children
        if (this.handCards.length === 0) {
            console.log("Player has no cards left, checking for win");
            this.scene.checkPlayerWin();
            return;
        }

        const spacing = 50; // Maximum spacing between cards
        const startX = this.scene.scale.width / 2 - (spacing * (this.handCards.length - 1)) / 2;
        const targetY = this.scene.scale.height - 10;

        // Sort cards by their x position to maintain left-to-right order
        this.handCards.sort((a, b) => a.x - b.x);

        this.handCards.forEach((handCard, newIndex) => {
            const newTargetX = startX + spacing * newIndex;
            
            // Set the originalDepth property based on the card's position
            // Cards on the left have lower depth values than cards on the right
            handCard.originalDepth = 10 + newIndex;
            handCard.setDepth(handCard.originalDepth);
            
            // Update the card's current position for reference
            handCard.currentX = newTargetX;
            handCard.currentY = targetY;

            // Temporarily disable input
            if (handCard.input) {
                handCard.disableInteractive();
            }

            // Animate the card to its new position
            this.scene.tweens.add({
                targets: handCard,
                x: newTargetX,
                y: targetY,
                duration: 300,
                ease: "Power2",
                onComplete: () => {
                    // Re-enable input after animation
                    if (this.scene.currentTurn === 'player') {
                        handCard.setInteractive({ draggable: true });
                    }
                }
            });
        });
    }

    /**
     * Disable the draw pile specifically after playing a card
     */
    disableDrawPileAfterCardPlay() {
        try {
            console.log("Checking if draw pile should be disabled after card play");
            
            // Only disable if it's the player's turn
            if (this.scene.currentTurn !== 'player') {
                return;
            }
            
            // Get player cards
            const playerCards = this.scene.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key.startsWith("card-") && // Player cards show the front
                child.y > this.scene.scale.height / 2 && // Only player cards (bottom half)
                !child.movedToAltar // Not already on altar
            );
            
            // Check if any card can be played (must match suit or rank)
            let hasValidMove = false;
            
            if (this.scene.altar.lastCardOnAltar) {
                const [lastSuit, lastRank] = this.scene.altar.lastCardOnAltar.texture.key.split("-").slice(1);
                
                // Check each card in player's hand
                for (let i = 0; i < playerCards.length; i++) {
                    const [cardSuit, cardRank] = playerCards[i].texture.key.split("-").slice(1);
                    if (cardSuit === lastSuit || cardRank === lastRank) {
                        hasValidMove = true;
                        break;
                    }
                }
            } else {
                // If no card on altar, any card is valid
                hasValidMove = playerCards.length > 0;
            }
            
            // If player has thrown a card this turn, disable drawing
            if (this.hasThrown) {
                console.log("Player has thrown a card this turn, disabling draw pile");
                this.disableDrawPile();
            }
            // If player has no valid moves, keep draw pile enabled
            else if (!hasValidMove) {
                console.log("Player has no valid moves, keeping draw pile enabled");
                this.enableDrawPile();
                this.scene.updateRotatingCards();
            }
        } catch (error) {
            console.error("Error in disableDrawPileAfterCardPlay:", error);
        }
    }

    /**
     * Check if player has any valid moves left
     * @returns {boolean} Whether player has any valid moves
     */
    checkValidMoves() {
        try {
            // Only check during player's turn
            if (this.scene.currentTurn !== 'player') {
                return;
            }
            
            console.log("Checking if player has any valid moves");
            
            // Get player cards
            const playerCards = this.scene.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key.startsWith("card-") && // Player cards show the front
                child.y > this.scene.scale.height / 2 && // Only player cards (bottom half)
                !child.movedToAltar // Not already on altar
            );
            
            console.log(`Player has ${playerCards.length} cards in hand when checking valid moves`);
            
            // Check if any card can be played (must match suit or rank)
            let hasValidMove = false;
            
            if (this.scene.altar.lastCardOnAltar) {
                const [lastSuit, lastRank] = this.scene.altar.lastCardOnAltar.texture.key.split("-").slice(1);
                console.log(`Checking if player has a match for ${lastSuit}-${lastRank}`);
                
                // Check each card in player's hand
                for (let i = 0; i < playerCards.length; i++) {
                    const [cardSuit, cardRank] = playerCards[i].texture.key.split("-").slice(1);
                    if (cardSuit === lastSuit || cardRank === lastRank) {
                        hasValidMove = true;
                        break;
                    }
                }
            } else {
                // If no card on altar, any card is valid
                hasValidMove = playerCards.length > 0;
            }
            
            // If player has no valid moves and has already drawn, show message
            if (!hasValidMove && this.hasThrown) {
                console.log("Player has no valid moves and has already thrown a card");
                this.scene.hints.showMessage("No valid moves left. End your turn.");
                
                // Show the end turn message after a delay
                this.scene.time.delayedCall(1000, () => {
                    this.showEndTurnMessage();
                });
            }
            // If player has no valid moves but hasn't drawn yet, make sure draw pile is enabled
            else if (!hasValidMove && !this.hasThrown) {
                console.log("Player has no valid moves but can still draw cards");
                this.scene.hints.showMessage("No matching cards. Draw from the deck or end your turn.");
                
                // Make sure the draw pile is enabled
                this.enableDrawPile();
                this.scene.updateRotatingCards();
            }
            
            return hasValidMove;
        } catch (error) {
            console.error("Error checking player moves:", error);
            return false;
        }
    }

    /**
     * Show end turn message
     */
    showEndTurnMessage() {
        this.scene.hints.showEndTurnMessage();
    }
}

export default GamePlayer;
