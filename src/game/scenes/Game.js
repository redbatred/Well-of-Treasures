class Game extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    preload() {
        console.log("Preloading assets...");
        this.load.image("pokerTable", "assets/table.jpg");
        this.load.image("cardBack", "assets/cards/card-back1.png");
        this.load.image("cardBack2", "assets/cards/card-back2.png");
        this.load.image("cardBack3", "assets/cards/card-back3.png");
        this.load.image("cardBack4", "assets/cards/card-back4.png");
        this.load.image("altar", "assets/altar.png");
        this.load.image("particle", "assets/particle.png");

        // Load all cards dynamically
        const suits = ["clubs", "diamonds", "hearts", "spades"];
        for (let suit of suits) {
            for (let rank = 1; rank <= 13; rank++) {
                this.load.image(`card-${suit}-${rank}`, `assets/cards/card-${suit}-${rank}.png`);
            }
        }
    }

    create() {
        console.log("Creating the scene...");
        this.editorCreate();

         // Enable input system (optional step for debugging or assurance)
        this.input.enabled = true;

        // Choose a random card back texture
        const cardTextures = ["cardBack", "cardBack2", "cardBack3", "cardBack4"];
        const selectedCardTexture = Phaser.Math.RND.pick(cardTextures);

        // Create rotating cards inside the hole
        this.addRotatingCardsInsideHole({
            holeX: this.scale.width / 2,
            holeY: this.scale.height / 2,
            holeRadius: Math.min(this.scale.width, this.scale.height) * 0.1,
            numCards: 10,
            rotationSpeed: 0.01,
            cardTexture: selectedCardTexture,
        });

        // Draw 4 random cards with animation
        this.time.delayedCall(500, () => {
            this.drawCards(4, { x: this.scale.width / 2, y: this.scale.height / 2 }, () => {
                this.showAltar();
            });
        });
    }

    drawCards(numCards, centerPosition, onComplete) {
        const suits = ["clubs", "diamonds", "hearts", "spades"];
        const targetY = this.scale.height - 10; // Touch the bottom of the screen

        // Get the existing cards in the hand
        const handCards = this.children.list.filter(
            (child) => child.texture && child.texture.key.startsWith("card-") &&
            Math.abs(child.y - targetY) < 10 && // Ensure it's in the hand's position
        child.depth < 50 // Exclude cards that have been thrown (higher depth indicates altar stack)
        );

        // Prevent drawing more cards if the hand already has 5 cards
        if (handCards.length >= 5) {
            this.showCardLimitMessage(); // Display the message when max cards are reached
            return;
        }

        // Calculate the total number of cards after adding new ones
        const totalCards = handCards.length + numCards;

        // Define spacing and calculate the starting X position for the new hand
        const maxSpacing = 50; // Maximum spacing between cards
        const minSpacing = 20; // Minimum spacing between cards
        const spacing = Math.max(minSpacing, maxSpacing - (totalCards - 1) * 2);
        const startX = centerPosition.x - ((spacing * (totalCards - 1)) / 2);

        // Animate existing cards to their new positions
        handCards.forEach((card, index) => {
            const targetX = startX + spacing * index;

            this.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 1.2,
                duration: 500,
                ease: "Power2",
            });
        });

        // Draw the new cards
        for (let i = 0; i < numCards; i++) {
            const suit = Phaser.Math.RND.pick(suits);
            const rank = Phaser.Math.Between(1, 13);
            const cardKey = `card-${suit}-${rank}`;

            // Calculate the position of the new card
            const index = handCards.length + i;
            const targetX = startX + spacing * index;

            const card = this.add.image(centerPosition.x, centerPosition.y, cardKey).setScale(1).setDepth(10 + index);

            // Animate the new card moving to its position
            this.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 1.2,
                duration: 1000,
                ease: "Power2",
                onComplete: () => {
                    this.addCardInteractions(card, index, startX, spacing, targetY);
                    if (i === numCards - 1 && onComplete) onComplete();
                },
            });
        }
    }

// Display the altar in the center of the screen
showAltar() {
    const holeX = this.scale.width / 2;
    const holeY = this.scale.height / 2;
    const holeRadius = Math.min(this.scale.width, this.scale.height) * 0.15;

    const altarWidth = holeRadius * 1.5;
    const altarHeight = holeRadius * 1.2;
    const shadowOffset = 10;

    let lastUpdateTime = 0;
    const updateInterval = 100; // Update shadow every 100ms

    // Create altar shadow
    this.altarShadow = this.add.graphics()
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
    this.altar = this.add.image(holeX, holeY, "altar")
        .setScale(0)
        .setAlpha(0)
        .setDepth(20);

    // Create the glass effect
    this.glassEffect = this.add.graphics()
        .setDepth(19) // Ensure it is behind the altar but above the shadow
        .fillStyle(0xffffff, 0.2) // Semi-transparent white
        .fillCircle(holeX, holeY, 0); // Start with zero radius

    // Animate altar and glass effect appearance
    this.tweens.add({
        targets: this.altar,
        alpha: 1, // Fade in the altar
        scale: holeRadius / this.altar.width, // Grow the altar
        duration: 2000,
        ease: "Power2",
        onUpdate: (tween, progress) => {
            const currentTime = this.time.now;
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



   addCardInteractions(card, index, startX, spacing, targetY) {
    let hoveredCard = null;

    card.setOrigin(0.5, 1); // Adjust origin for proper positioning
    card.setInteractive();
	card.movedToAltar = false; // Add a flag to track if the card has been moved to the altar
console.log(`Card ${card.texture.key} is now interactive.`);

    // Hover effect
    card.on("pointerover", () => {
		if (card.movedToAltar) return; // Ignore hover if the card is on the altar

        if (hoveredCard && hoveredCard !== card) {
            hoveredCard.emit("pointerout"); // Reset the previously hovered card
        }
        hoveredCard = card;
        card.setDepth(20); // Bring the card to the front
        this.tweens.add({
            targets: card,
            scale: 1.4,
            y: targetY - 50, // Move up on hover
            duration: 200,
            ease: "Power1",
        });
    });

    card.on("pointerout", () => {
		if (card.movedToAltar) return; // Ignore hover out if the card is on the altar

        if (hoveredCard === card) hoveredCard = null; // Clear the hovered card if it's this one
        this.tweens.killTweensOf(card); // Stop any ongoing tweens
        card.setDepth(10 + index); // Reset depth to original layer

        const targetX = startX + spacing * index; // Recalculate correct position
        this.tweens.add({
            targets: card,
            scale: 1.2, // Return to original size
            x: targetX, // Reset the position to its initial layout
            y: targetY, // Reset the position to its initial layout
            duration: 200,
            ease: "Power1",
        });
    });

    // Throw card to altar on click
    card.on("pointerdown", () => {
		card.removeAllListeners(); // Immediately stop hover and other events
    console.log(`Card ${card.texture.key} clicked.`);
    const altarX = this.scale.width / 2;
    const altarY = this.scale.height / 1.71;

    // Determine the stacking depth
    const altarCards = this.children.list.filter(
        (child) => child.texture && child.texture.key.startsWith("card-") && child.depth > 20
    );
    const stackDepth = 50 + altarCards.length;

    // Animate card to move to the altar
	card.setDepth(stackDepth); // Ensure stacking on the altar
    this.tweens.add({
        targets: card,
        x: altarX,
        y: altarY,
        scale: 0.9, // Shrink card as it reaches altar
        duration: 1000,
        ease: "Power2",
        onComplete: () => {
            card.movedToAltar = true; // Mark the card as moved to the altar
			card.x += Phaser.Math.Between(-4, 4); // Slight horizontal offset for stack effect
            card.y += Phaser.Math.Between(-4, 4); // Slight vertical offset for stack effect
            console.log(`Card ${card.texture.key} placed on altar at depth ${stackDepth}.`);
        },
    });
    });
}


    showCardLimitMessage() {
        // Check if the limit message is already shown, to avoid duplicates
        const existingMessage = this.children.list.find(child => child && child.type === 'Text' && child.text === "Maximum hand size reached");
        if (existingMessage) return;

        // Create a message when the player reaches the maximum hand size
        const message = this.add.text(this.scale.width / 2, this.scale.height / 2, "Maximum hand size reached", {
            font: "20px Arial",
            fill: "#FF0000",
            backgroundColor: "#FFFFFF",
            padding: { x: 10, y: 5 },
            align: "center",
        })
        .setOrigin(0.5)
        .setDepth(30)
        .setAlpha(0);  // Start with invisible text

        // Tween the message to fade in and out after 1.5 seconds
        this.tweens.add({
            targets: message,
            alpha: 1,  // Fade in
            duration: 500,
            ease: "Power2",
            onComplete: () => {
                // Fade out after 1.5 seconds
                this.time.delayedCall(1000, () => {
                    this.tweens.add({
                        targets: message,
                        alpha: 0,  // Fade out
                        duration: 500,
                        ease: "Power2",
                    });
                });
            }
        });
    }

    editorCreate() {
        const table = this.add.image(this.scale.width / 2, this.scale.height / 2, "pokerTable");
        table.setDisplaySize(this.scale.width, this.scale.height);

        const holeMask = this.make.graphics({ x: 0, y: 0, add: false });
        holeMask.fillStyle(0xffffff, 1);
        holeMask.fillRect(0, 0, this.scale.width, this.scale.height);
        holeMask.fillCircle(this.scale.width / 2, this.scale.height / 2, Math.min(this.scale.width, this.scale.height) * 0.1);

        const mask = holeMask.createGeometryMask();
        table.setMask(mask);

        const holeOverlay = this.add.graphics();
        holeOverlay.fillStyle(0x000000, 1);
        holeOverlay.fillCircle(this.scale.width / 2, this.scale.height / 2, Math.min(this.scale.width, this.scale.height) * 0.1);

        this.holeMask = mask;
    }

    addRotatingCardsInsideHole({ holeX, holeY, holeRadius, numCards, rotationSpeed, cardTexture }) {
        const cards = [];
        const angleStep = Phaser.Math.PI2 / numCards;

        for (let i = 0; i < numCards; i++) {
            const angle = angleStep * i;
            const x = holeX + Math.cos(angle) * holeRadius;
            const y = holeY + Math.sin(angle) * holeRadius;

            const card = this.add.image(x, y, cardTexture).setScale(0.6).setRotation(angle);
            card.setInteractive();

            card.on("pointerover", () => card.setScale(0.7));
            card.on("pointerout", () => card.setScale(0.6));

            card.on("pointerdown", () => {
                const suits = ["clubs", "diamonds", "hearts", "spades"];
                const suit = Phaser.Math.RND.pick(suits);
                const rank = Phaser.Math.Between(1, 13);
                const randomCardKey = `card-${suit}-${rank}`;

                const handCards = this.children.list.filter(
                    (child) => child.texture && child.texture.key.startsWith("card-")
                );

                // Prevent drawing more cards if the hand already has 5 cards
                if (handCards.length >= 5) {
                    console.log("Cannot draw more cards. Maximum hand size reached.");
                    this.showCardLimitMessage();
                    return;
                }

                const spacing = 50; // Same spacing as other cards in the hand
                const startX = this.scale.width / 2 - (spacing * handCards.length) / 2;
                const targetX = startX + spacing * handCards.length;
                const targetY = this.scale.height - 10; // Align with other cards in the hand

                const newCard = this.add.image(card.x, card.y, randomCardKey).setScale(0.6).setDepth(20);

                // Animate the card moving to the player's hand
                this.tweens.add({
                    targets: newCard,
                    x: targetX,
                    y: targetY,
                    scale: 1.2,
                    duration: 1000,
                    ease: "Power2",
                    onComplete: () => {
                        this.addCardInteractions(newCard, handCards.length, startX, spacing, targetY);
                    },
                });
            });

            cards.push({ card, angle });
        }

        this.events.on("update", () => {
            cards.forEach((item) => {
                item.angle += rotationSpeed;
                item.card.x = holeX + Math.cos(item.angle) * holeRadius;
                item.card.y = holeY + Math.sin(item.angle) * holeRadius;
                item.card.setRotation(item.angle);
            });
        });
    }
}

export default Game;
