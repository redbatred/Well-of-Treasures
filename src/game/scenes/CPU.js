export default class CPU {
    constructor(scene) {
        this.scene = scene; // Reference to the Phaser scene
        this.hand = []; // Cards in the CPU's hand
        this.handY = 10; // Y position for the CPU's hand
        this.maxHandSize = 5; // Maximum cards the CPU can hold
        console.log("CPU class initialized");
    }

    // Draw cards with a randomized delay
    drawCardsRandomly() {
        const numCards = Phaser.Math.Between(1, this.maxHandSize - this.hand.length);
        if (numCards > 0) {
            console.log(`CPU drawing ${numCards} cards...`);
            this.scene.drawHand(this.hand, numCards, { x: this.scene.scale.width / 2, y: this.handY }, false);

            // Randomly decide to throw a card after drawing
            if (Phaser.Math.Between(0, 1)) {
                this.scene.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
                    this.throwCardToAltar();
                });
            }
        }
    }

    // Throw a card to the altar
    throwCardToAltar() {
        const card = this.hand.pop(); // Get the last card in the hand
        if (!card) return;

        console.log("CPU throwing card...");
        const altarX = this.scene.scale.width / 2;
        const altarY = this.scene.scale.height / 1.71;

        this.scene.moveCardToAltar(card, altarX, altarY);
    }

    // Smarter decision-making for the CPU
    decideNextAction(gameState) {
        if (this.hand.length === 0) {
            console.log("CPU has no cards, deciding to draw...");
            this.drawCardsRandomly();
        } else if (this.hand.length >= this.maxHandSize) {
            console.log("CPU hand is full, deciding to throw...");
            this.throwCardToAltar();
        } else {
            // Use the game state to decide (e.g., altar cards or random)
            if (gameState.shouldThrow || Phaser.Math.Between(0, 1)) {
                this.throwCardToAltar();
            } else {
                this.drawCardsRandomly();
            }
        }
    }
}
