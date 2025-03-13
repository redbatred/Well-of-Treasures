/**
 * GameAltar - Handles all altar-related logic for the card game
 * This class encapsulates the altar display, card stacking, and related animations
 */
class GameAltar {
    constructor(scene) {
        this.scene = scene;
        this.altar = null;
        this.altarShadow = null;
        this.glassEffect = null;
        this.lastCardOnAltar = null;
    }

    /**
     * Display the altar in the center of the screen
     */
    showAltar() {
        const holeX = this.scene.scale.width / 2;
        const holeY = this.scene.scale.height / 2;
        const holeRadius = Math.min(this.scene.scale.width, this.scene.scale.height) * 0.15;

        const altarWidth = holeRadius * 1.5;
        const altarHeight = holeRadius * 1.2;
        const shadowOffset = 10;

        let lastUpdateTime = 0;
        const updateInterval = 100; // Update shadow every 100ms

        // Create altar shadow
        this.altarShadow = this.scene.add.graphics()
            .fillStyle(0xffffff, 0.1)
            .fillRoundedRect(
                holeX - altarWidth / 2 - shadowOffset,
                holeY - altarHeight / 2,
                altarWidth + shadowOffset * 2,
                altarHeight,
                10
            )
            .setDepth(15);

        // Create altar image
        this.altar = this.scene.add.image(holeX, holeY, "altar")
            .setScale(0)
            .setAlpha(0)
            .setDepth(20);

        // Create the glass effect
        this.glassEffect = this.scene.add.graphics()
            .setDepth(19) // Ensure it is behind the altar but above the shadow
            .fillStyle(0xffffff, 0.2) // Semi-transparent white
            .fillCircle(holeX, holeY, 0); // Start with zero radius

        // Animate altar and glass effect appearance
        this.scene.tweens.add({
            targets: this.altar,
            alpha: 1, // Fade in the altar
            scale: holeRadius / this.altar.width, // Grow the altar
            duration: 2000,
            ease: "Power2",
            onUpdate: (tween, progress) => {
                const currentTime = this.scene.time.now;
                if (currentTime - lastUpdateTime > updateInterval) {
                    lastUpdateTime = currentTime;

                    const scale = tween.getValue();
                    this.altarShadow.clear();
                    this.altarShadow.fillStyle(0xffffff, 0.1);
                    this.altarShadow.fillRoundedRect(
                        holeX - (altarWidth * scale) / 2 - shadowOffset * scale,
                        holeY - (altarHeight * scale) / 2,
                        altarWidth * scale + shadowOffset * 2 * scale,
                        altarHeight * scale,
                        10 * scale
                    );

                    // Update glass effect
                    this.glassEffect.clear();
                    this.glassEffect.fillStyle(0xffffff, 0.2);
                    this.glassEffect.fillCircle(holeX, holeY, scale * holeRadius * 0.9); // Ensure it's slightly smaller than the card radius
                }
            }
        });
    }

    /**
     * Throw a card to the altar
     * @param {Object} card - The card object to throw
     * @param {string} cardKey - The key of the card (for CPU cards)
     * @param {boolean} isPlayerCard - Whether the card is a player card
     */
    throwCardToAltar(card, cardKey, isPlayerCard = true) {
        // Cancel any ongoing animations for this card
        this.scene.tweens.killTweensOf(card);
        
        // Set the isAnimating flag to prevent hover effects during animation
        card.isAnimating = true;
        
        // Set the card texture if provided (for CPU cards)
        if (cardKey && !isPlayerCard) {
            card.setTexture(cardKey);
        }
        
        // Use EXACTLY the same position for all cards
        const altarX = this.scene.scale.width / 2;
        
        // Use different Y positions for player and CPU cards
        // Player cards go to height/1.71, CPU cards go to height/2
        const altarY = isPlayerCard ? this.scene.scale.height / 1.71 : this.scene.scale.height / 2;
        
        // Determine the stacking depth consistently
        // Find the highest depth among all cards on the altar
        let highestDepth = 50; // Start with a base depth
        this.scene.children.list.forEach(child => {
            if (child && child.texture && 
            child.texture.key && child.texture.key.startsWith("card-") && 
                child.movedToAltar && child.depth > highestDepth) {
                highestDepth = child.depth;
            }
        });

        // Always set the new card's depth higher than any existing card
        const stackDepth = highestDepth + 10;
        console.log(`Setting card depth to ${stackDepth} (highest existing depth was ${highestDepth})`);
        
        // Set the card depth for proper stacking
        card.setDepth(stackDepth);
        
        // Mark the card as moved to the altar immediately to prevent multiple clicks
        card.movedToAltar = true;
        
        // If this is a player card, mark that they've thrown a card this turn
        if (isPlayerCard && this.scene.currentTurn === 'player') {
            this.scene.player.hasThrown = true;
            console.log("Player has thrown a card this turn");
            
            // Remove the card from the player's handCards array
            const cardIndex = this.scene.player.handCards.indexOf(card);
            if (cardIndex !== -1) {
                this.scene.player.handCards.splice(cardIndex, 1);
                console.log(`Removed card from player's handCards array, now contains ${this.scene.player.handCards.length} cards`);
            }
            
            // After throwing a card, disable the draw pile
            this.scene.player.disableDrawPileAfterCardPlay();
        }
        // If this is a CPU card, update the CPU controller
        else {
            this.scene.cpu.hasThrownCard = true;
            this.scene.cpu.hasPlayedAtLeastOne = true; // Mark that CPU has played at least one card
            console.log("CPU has played at least one card this turn - cannot draw anymore");
            
            // Remove the card from the CPU's handCards array if it exists
            if (this.scene.cpu.handCards) {
                const cardIndex = this.scene.cpu.handCards.indexOf(card);
                if (cardIndex !== -1) {
                    this.scene.cpu.handCards.splice(cardIndex, 1);
                    console.log(`Removed card from CPU's handCards array, now contains ${this.scene.cpu.handCards.length} cards`);
                }
            }
        }
        
        // Animate card to move to the altar - SAME animation for both player and CPU
        // First, immediately set the depth to ensure it appears on top right away
        card.setDepth(stackDepth);

        this.scene.tweens.add({
            targets: card,
            x: altarX,
            y: altarY,
            scale: 0.9, // Same scale for all cards
            duration: 500, // Faster animation
            ease: "Power2",
            onStart: () => {
                // Play the throw card sound
                this.scene.sound.play("throwCard");
            },
            onComplete: () => {
                // Ensure the card is marked as moved to the altar
                card.movedToAltar = true;
                
                // Reset the isAnimating flag
                card.isAnimating = false;
                
                // Ensure the card maintains its high depth
                card.setDepth(stackDepth);
                
                // NO random offset - keep cards perfectly stacked
                // This ensures all cards appear in the exact same position
                
                console.log(`Card ${card.texture.key} placed on altar at depth ${stackDepth}.`);
                
                // Update the last card on the altar
                this.lastCardOnAltar = card;
                
                // Ensure all cards on the altar are properly stacked
                this.ensureProperAltarStacking();
                
                // Handle post-throw logic based on player or CPU
                if (isPlayerCard) {
                    // Rearrange the player's hand to maintain proper formation
                    this.scene.player.rearrangeCards();
                    
                    // After player throws a card, check if they have any valid moves left
                    this.scene.player.checkValidMoves();
                    
                    // Win condition check is now handled in the Game class and GamePlayer class
                } else {
                    // Rearrange the CPU's hand to maintain proper formation
                    this.scene.cpu.rearrangeCards();
                    
                    // After CPU throws a card, check if it has any valid moves left
                    this.scene.cpu.checkValidMoves();
                }
            }
        });
    }

    /**
     * Ensure all cards on the altar are properly stacked with the correct depths
     */
    ensureProperAltarStacking() {
        // Get all cards on the altar
        const altarCards = this.scene.children.list.filter(
            (child) => child && child.texture && 
            child.texture.key && child.texture.key.startsWith("card-") && 
            child.movedToAltar
        );
        
        // Sort them by their current depth
        altarCards.sort((a, b) => a.depth - b.depth);
        
        // Reassign depths starting from 50 and incrementing by 10
        altarCards.forEach((card, index) => {
            const newDepth = 50 + (index * 10);
            card.setDepth(newDepth);
            console.log(`Reassigned altar card ${card.texture.key} to depth ${newDepth}`);
        });
        
        // If there are any cards, set the last one as the lastCardOnAltar
        if (altarCards.length > 0) {
            this.lastCardOnAltar = altarCards[altarCards.length - 1];
            console.log(`Set lastCardOnAltar to ${this.lastCardOnAltar.texture.key} with depth ${this.lastCardOnAltar.depth}`);
        }
    }

    /**
     * Animate game over - return cards to circle and lower altar
     */
    animateGameOver() {
        console.log("Animating game over sequence");
        
        const holeX = this.scene.scale.width / 2;
        const holeY = this.scene.scale.height / 2;
        const holeRadius = Math.min(this.scene.scale.width, this.scene.scale.height) * 0.15;
        
        // Get all cards in the game (both player and CPU hands, and altar)
        const allCards = this.scene.children.list.filter(
            (child) => child && child.texture && 
            (child.texture.key.startsWith("card-") || child.texture.key === "cardBack")
        );
        
        // Animate all cards back to the center circle
        allCards.forEach((card, index) => {
            // Calculate a random position in the circle
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * holeRadius * 0.7; // Keep within 70% of hole radius
            const targetX = holeX + Math.cos(angle) * distance;
            const targetY = holeY + Math.sin(angle) * distance;
            
            // Calculate the rotation to point towards the center
            const rotationAngle = Math.atan2(targetY - holeY, targetX - holeX) + Math.PI / 2;
            
            // Animate the card
            this.scene.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 0.9, // Match the scale of the rotating cards
                alpha: 1.0, // Keep cards fully visible, not transparent
                rotation: rotationAngle, // Rotate to point towards the center
                duration: 1000,
                ease: "Power2",
                delay: index * 50, // Stagger the animations
                onComplete: () => {
                    // Mark the card as moved to the center
                    card.movedToCenter = true;
                }
            });
        });
        
        // Animate the altar going back down
        if (this.altar) {
            this.scene.tweens.add({
                targets: this.altar,
                alpha: 0, // Fade out
                scale: 0, // Shrink down
                duration: 2000,
                ease: "Power2",
                delay: 500, // Start after cards begin moving
                onUpdate: (tween) => {
                    // Also update the altar shadow and glass effect
                    if (this.altarShadow) {
                        this.altarShadow.alpha = 1 - tween.getValue(); // Fade out shadow
                    }
                    if (this.glassEffect) {
                        this.glassEffect.alpha = 1 - tween.getValue(); // Fade out glass effect
                    }
                }
            });
        }
    }
}

export default GameAltar;
