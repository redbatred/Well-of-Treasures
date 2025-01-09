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
            this.drawCards(4, { x: this.scale.width / 2, y: this.scale.height / 2 });
        });
    }

    drawCards(numCards, centerPosition) {
        const suits = ["clubs", "diamonds", "hearts", "spades"];
        const targetY = this.scale.height - 10; // Touch the bottom of the screen

        // Get the existing cards in the hand to calculate their positions
        const handCards = this.children.list.filter(
            (child) => child.texture && child.texture.key.startsWith("card-")
        );

        // Calculate dynamic spacing based on the total number of cards in hand
        const totalCards = handCards.length + numCards;
        const maxSpacing = 50; // Maximum spacing between cards
        const minSpacing = 20; // Minimum spacing between cards
        const spacing = Math.max(minSpacing, maxSpacing - (totalCards - 1) * 2);

        // Calculate startX so the hand remains centered
        const startX = centerPosition.x - ((spacing * (totalCards - 1)) / 2);

        // Adjust positions of existing cards in the hand
        handCards.forEach((card, index) => {
            const targetX = startX + spacing * index;
            this.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 1.2,
                duration: 1000,
                ease: "Power2",
            });
        });

        // Draw the new cards
        for (let i = 0; i < numCards; i++) {
            const suit = Phaser.Math.RND.pick(suits);
            const rank = Phaser.Math.Between(1, 13);
            const cardKey = `card-${suit}-${rank}`;
			

            // Calculate the position of the new card based on its index
            const index = handCards.length + i;
            const targetX = startX + spacing * index;

            const card = this.add.image(centerPosition.x, centerPosition.y, cardKey).setScale(1).setDepth(10 + index);

            // Animate the card moving to its position in the hand
            this.tweens.add({
                targets: card,
                x: targetX,
                y: targetY,
                scale: 1.2,
                duration: 1000,
                ease: "Power2",
                onComplete: () => {
                    this.addCardInteractions(card, index, startX, spacing, targetY);
                },
            });
        }
    }

    addCardInteractions(card, index, startX, spacing, targetY) {
        let hoveredCard = null; // Track the currently hovered card

        card.setOrigin(0.5, 1); // Adjust origin for proper positioning
        card.setInteractive();

        // Hover effect
        card.on("pointerover", () => {
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
