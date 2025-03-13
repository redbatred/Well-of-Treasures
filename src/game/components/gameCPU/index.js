/**
 * GameCPU - Handles all CPU logic for the card game
 * This class encapsulates the CPU's decision-making and actions
 */
class GameCPU {
    constructor(scene) {
        this.scene = scene;
        this.hasThrownCard = false;
        this.hasPlayedAtLeastOne = false;
        this.needsPlayableCard = false;
        this.handCards = []; // Array to track CPU's hand cards
    }

    /**
     * Reset CPU state for a new turn
     */
    resetState() {
        this.hasThrownCard = false;
        this.hasPlayedAtLeastOne = false;
        this.needsPlayableCard = false;
        
        // Update handCards array to match current cards in the scene
        this.updateHandCards();
    }

    /**
     * Update the handCards array to match the current cards in the scene
     */
    updateHandCards() {
        // Get all CPU cards from the scene
        this.handCards = this.scene.children.list.filter(
            (child) => child && child.texture && 
            child.texture.key === "cardBack" && // CPU cards show the back
            child.y < 100 && // Only CPU cards (top of screen)
            !child.movedToAltar // Not already on altar
        );
        
        console.log(`Updated CPU handCards array, now contains ${this.handCards.length} cards`);
    }

    /**
     * CPU takes its turn
     */
    takeTurn() {
        // Double-check that it's actually the CPU's turn
        if (this.scene.currentTurn !== 'cpu') {
            console.log("Not CPU's turn, aborting cpuTakeTurn");
            return;
        }
        
        try {
            // Make sure player interactions are disabled
            this.scene.disablePlayerCards();
            
            // Reset the flags for tracking CPU's turn
            this.hasThrownCard = false;
            this.hasPlayedAtLeastOne = false;
            
            console.log("CPU taking turn...");
            
            // Make sure handCards is up to date
            this.updateHandCards();
            
            console.log(`CPU has ${this.handCards.length} cards`);
            
            // Show a "thinking" animation
            this.showThinking(() => {
                // Check if CPU has any valid moves
                const hasValidMove = this.checkValidMoves();
                
                if (hasValidMove) {
                    console.log("CPU has valid moves, playing a card");
                    this.throwCard();
                } else {
                    console.log("CPU has no valid moves, drawing a card");
                    this.drawCards();
                }
            });
        } catch (error) {
            console.error("Error in CPU takeTurn:", error);
            // End CPU turn if there's an error
            this.scene.endCPUTurn();
        }
    }

    /**
     * Draw cards for the CPU
     */
    drawCards() {
        try {
            // Make sure handCards is up to date
            this.updateHandCards();
            
            // If CPU has already thrown a card this turn, it can't draw
            if (this.hasThrownCard) {
                console.log("CPU has already thrown a card this turn - cannot draw");
                this.scene.endCPUTurn();
                return;
            }
            
            // Check if there are any cards left in the deck
            if (!this.scene.cards.deck || this.scene.cards.deck.length === 0) {
                console.log("Deck is empty, CPU cannot draw more cards");
                this.scene.endCPUTurn();
                return;
            }
            
            // If CPU's hand is full (10 cards), it can't draw more
            if (this.handCards.length >= 10) {
                console.log("CPU hand is full, cannot draw more cards");
                this.scene.endCPUTurn();
                return;
            }
            
            // Draw a card from the deck
            const cardData = this.scene.cards.deck.pop();
            console.log(`CPU drawing card ${cardData.key} from deck. ${this.scene.cards.deck.length} cards remaining.`);
            
            // Create the card with the back texture and set its initial position at the pile
            const pileX = this.scene.scale.width / 2;
            const pileY = this.scene.scale.height / 2;
            const cardDepth = 10 + this.handCards.length;
            const card = this.scene.add.image(pileX, pileY, "cardBack")
                .setScale(1)
                .setDepth(100 + cardDepth); // Higher depth during animation
            
            // Store the original depth for consistency
            card.originalDepth = cardDepth;
            
            // Set the animation flag during the initial animation
            card.isAnimating = true;
            
            // Store the actual card value for later use
            card.actualCardKey = cardData.key;
            console.log(`Assigned actualCardKey: ${card.actualCardKey} to CPU card`);
            
            // Add the card to the handCards array
            this.handCards.push(card);
            
            // Calculate the target position in the CPU hand row
            const spacing = 50; // Maximum spacing between cards
            const startX = this.scene.scale.width / 2 - (spacing * (this.handCards.length - 1)) / 2;
            const targetX = startX + spacing * (this.handCards.length - 1);
            const targetY = 50; // Top of the screen
            
            // Animate the card directly from the center to its position in the CPU hand
            this.scene.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 1.0, // Same scale as player cards for consistency
                duration: 600, // Faster animation
                ease: "Power2",
                onStart: () => {
                    // Play the draw sound
                    this.scene.sound.play("drawSound");
                },
                onComplete: () => {
                    // Set the final depth after animation completes
                    card.setDepth(cardDepth);
                    
                    // Reset the animation flag
                    card.isAnimating = false;
                    
                    // Ensure the card is visible but flipped (hidden face)
                    card.setAlpha(1); // Make the card visible
                    card.setTexture("cardBack"); // Ensure it shows the card back
                    
                    // Rearrange CPU cards to ensure proper spacing and form
                    this.rearrangeCards();
                    
                    // Check if the drawn card is playable
                    const hasValidMove = this.checkValidMoves();
                    
                    if (hasValidMove) {
                        console.log("CPU drew a playable card, playing it");
                        this.scene.time.delayedCall(1000, () => {
                            this.throwCard();
                        });
                    } else if (this.handCards.length < 10) {
                        console.log("CPU drew a card that isn't playable, drawing another");
                        this.scene.time.delayedCall(1000, () => {
                            this.drawCards();
                        });
                    } else {
                        console.log("CPU hand is full and no playable cards, ending turn");
                        this.scene.time.delayedCall(1000, () => {
                            this.scene.endCPUTurn();
                        });
                    }
                }
            });
        } catch (error) {
            console.error("Error in CPU drawCards:", error);
            // End CPU turn if there's an error
            this.scene.endCPUTurn();
        }
    }

    /**
     * Throw a card from the CPU's hand
     */
    throwCard() {
        try {
            // Make sure handCards is up to date
            this.updateHandCards();
            
            // If CPU has no cards, end turn
            if (this.handCards.length === 0) {
                console.log("CPU has no cards, ending turn");
                this.scene.endCPUTurn();
                return;
            }
            
            // Find a valid card to play
            let cardToPlay = null;
            let cardIndex = -1;
            
            if (this.scene.altar.lastCardOnAltar) {
                const [lastSuit, lastRank] = this.scene.altar.lastCardOnAltar.texture.key.split("-").slice(1);
                console.log(`Last card on altar: ${lastSuit}-${lastRank}`);
                
                // First, try to find a card with the same suit
                for (let i = 0; i < this.handCards.length; i++) {
                    if (this.handCards[i].actualCardKey) {
                        const [cardSuit, cardRank] = this.handCards[i].actualCardKey.split("-").slice(1);
                        if (cardSuit === lastSuit) {
                            cardToPlay = this.handCards[i];
                            cardIndex = i;
                            console.log(`CPU found matching suit card: ${cardSuit}-${cardRank}`);
                            break;
                        }
                    }
                }
                
                // If no matching suit, try to find a card with the same rank
                if (!cardToPlay) {
                    for (let i = 0; i < this.handCards.length; i++) {
                        if (this.handCards[i].actualCardKey) {
                            const [cardSuit, cardRank] = this.handCards[i].actualCardKey.split("-").slice(1);
                            if (cardRank === lastRank) {
                                cardToPlay = this.handCards[i];
                                cardIndex = i;
                                console.log(`CPU found matching rank card: ${cardSuit}-${cardRank}`);
                                break;
                            }
                        }
                    }
                }
            } else {
                // If no card on altar, play the first card
                cardToPlay = this.handCards[0];
                cardIndex = 0;
                console.log("No card on altar, CPU plays first card");
            }
            
            // If a valid card was found, play it
            if (cardToPlay) {
                const cardKey = cardToPlay.actualCardKey;
                console.log(`CPU throws card: ${cardKey}`);
                
                // Throw the card to the altar
                this.scene.throwCardToAltar(cardToPlay, cardKey, false);
                
                // Mark that CPU has thrown a card this turn
                this.hasThrownCard = true;
                this.hasPlayedAtLeastOne = true;
                
                // Check if CPU has any more valid moves after a delay
                this.scene.time.delayedCall(1000, () => {
                    // Check if CPU has won
                    if (this.handCards.length === 0) {
                        this.scene.gameOver.checkCPUWin();
                        return;
                    }
                    
                    // Check if CPU has any more valid moves
                    const hasMoreValidMoves = this.checkValidMoves();
                    
                    if (hasMoreValidMoves) {
                        console.log("CPU has more valid moves, throwing another card");
                        this.scene.time.delayedCall(1000, () => {
                            this.throwCard();
                        });
                    } else {
                        console.log("CPU has no more valid moves, ending turn");
                        this.scene.time.delayedCall(1000, () => {
                            this.scene.endCPUTurn();
                        });
                    }
                });
            } else {
                // If no valid card was found, draw a card or end turn
                if (!this.hasThrownCard) {
                    console.log("CPU has no valid card to play and hasn't thrown a card yet, drawing a card");
                    this.drawCards();
                } else {
                    console.log("CPU has no valid card to play and has already thrown a card, ending turn");
                    this.scene.endCPUTurn();
                }
            }
        } catch (error) {
            console.error("Error in CPU throwCard:", error);
            // End CPU turn if there's an error
            this.scene.endCPUTurn();
        }
    }

    /**
     * Show CPU thinking animation
     * @param {Function} callback - Function to call after thinking animation completes
     */
    showThinking(callback) {
        this.scene.hints.showThinking(callback);
    }

    /**
     * Rearrange CPU cards
     */
    rearrangeCards() {
        // Make sure handCards is up to date
        this.updateHandCards();
        
        // If CPU has no cards, check for win
        if (this.handCards.length === 0) {
            console.log("CPU has no cards left, checking for win");
            this.scene.gameOver.checkCPUWin();
            return;
        }

        const spacing = 50; // Maximum spacing between cards
        const startX = this.scene.scale.width / 2 - (spacing * (this.handCards.length - 1)) / 2;
        const targetY = 50; // Top of the screen

        // Sort cards by their x position to maintain left-to-right order
        this.handCards.sort((a, b) => a.x - b.x);

        this.handCards.forEach((card, newIndex) => {
            const newTargetX = startX + spacing * newIndex;

            // Animate the card to its new position
            this.scene.tweens.add({
                targets: card,
                x: newTargetX,
                y: targetY,
                duration: 300,
                ease: "Power2"
            });
        });
    }

    /**
     * Check if CPU has any valid moves
     * @returns {boolean} Whether CPU has any valid moves
     */
    checkValidMoves() {
        // Make sure handCards is up to date
        this.updateHandCards();
        
        console.log(`CPU has ${this.handCards.length} cards when checking valid moves`);
        
        // If CPU has no cards, it has no valid moves
        if (this.handCards.length === 0) {
            return false;
        }
        
        // Check if any card can be played (must match suit or rank)
        let hasValidMove = false;
        
        if (this.scene.altar.lastCardOnAltar) {
            const [lastSuit, lastRank] = this.scene.altar.lastCardOnAltar.texture.key.split("-").slice(1);
            console.log(`Last card on altar: ${lastSuit}-${lastRank}`);
            
            // Check each card in CPU's hand
            for (let i = 0; i < this.handCards.length; i++) {
                if (this.handCards[i].actualCardKey) {
                    const [cardSuit, cardRank] = this.handCards[i].actualCardKey.split("-").slice(1);
                    if (cardSuit === lastSuit || cardRank === lastRank) {
                        hasValidMove = true;
                        break;
                    }
                }
            }
            
            console.log(`CPU can play card: ${hasValidMove}`);
        } else {
            // If no card on altar, any card is valid
            hasValidMove = true;
            console.log("No card on altar, CPU can play any card");
        }
        
        return hasValidMove;
    }

    handleCPUTurn() {
        // ... existing code ...
        
        // If CPU hand is full (10 cards), skip drawing
        if (cpuCards.length >= 10) {
            console.log("CPU hand has reached maximum size of 10 cards, cannot draw more");
            this.scene.hints.showMessage("CPU hand is full");
            
            // Check if CPU has any valid moves
            // ... existing code ...
        }
        
        // ... existing code ...
    }
}

export default GameCPU;
