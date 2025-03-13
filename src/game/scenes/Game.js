// Import the GameCPU class
import GameCPU from '../components/gameCPU/index.js';
// Import the GamePlayer class
import GamePlayer from '../components/gamePlayer/index.js';
// Import the GameCards class
import GameCards from '../components/gameCards/index.js';
// Import the GameOver class
import GameOver from './GameOver.js';
import GameHints from "../components/gameHints";
// Import the GameAltar class
import GameAltar from "../components/gameAltar";
// Import the GameUI class
import GameUI from "../components/gameUI";

class Game extends Phaser.Scene {
    constructor() {
        super("Game");
        this.currentTurn = 'player'; // Track whose turn it is
        // Player-related flags are now managed by the GamePlayer class
        // CPU-related flags are now managed by the GameCPU class
        // Card and deck-related logic is now managed by the GameCards class
        // Game ending logic is now managed by the GameOver class
        // Message-related logic is now managed by the GameHints class
        // Altar-related logic is now managed by the GameAltar class
        // UI-related logic is now managed by the GameUI class
        this.cards = null;     // Will hold the GameCards instance
        this.player = null;    // Will hold the GamePlayer instance
        this.cpu = null;       // Will hold the GameCPU instance
        this.gameOver = null;  // Will hold the GameOver instance
        this.hints = null;     // Will hold the GameHints instance
        this.altar = null;     // Will hold the GameAltar instance
        this.ui = null;        // Will hold the GameUI instance
        this.isPlayerTurn = true;
        this.hasDrawnCard = false;
        this.hasPlayedCard = false;
    }

    preload() {
        console.log("Preloading assets...");
        this.load.image("pokerTable", "assets/table.jpg");
        this.load.image("cardBack", "assets/cards/card-back1.png");
        this.load.image("cardBack2", "assets/cards/card-back2.png");
        this.load.image("cardBack3", "assets/cards/card-back3.png");
        this.load.image("cardBack4", "assets/cards/card-back4.png");
        this.load.image("altar", "assets/altar.png");
		this.load.image("playAgainButton", "assets/new-game.png");
        this.load.image("endTurnButton", "assets/new-game.png"); // Reusing the button image for end turn
		console.log("Loading Play Again button...");
		this.load.audio("throwCard", "assets/sounds/Throw_sound.mp3");
		this.load.audio("shuffleCards", "assets/sounds/GP_Shuffle.wav");
		this.load.audio("drawSound", "assets/sounds/Draw_sound.mp3");
		this.load.audio("buttonSound", "assets/sounds/Button_sound.mp3");
		this.load.audio("soundtrack1", "assets/sounds/soundtrack1.wav");
    this.load.audio("soundtrack2", "assets/sounds/soundtrack2.wav");
		

  // Dynamically load all explosion frames
    for (let i = 29; i <= 84; i++) {
        this.load.image(`explosion_red_${i}`, `assets/particles/explosion_red_${i}.png`);
    }


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
        
        // Initialize the CPU controller
        this.cpu = new GameCPU(this);
        
        // Initialize the Player controller
        this.player = new GamePlayer(this);
        
        // Initialize the Cards controller
        this.cards = new GameCards(this);
        
        // Initialize the GameOver controller
        this.gameOver = new GameOver(this);
        
        // Initialize the GameHints controller
        this.hints = new GameHints(this);
        
        // Initialize the GameAltar controller
        this.altar = new GameAltar(this);
        
        // Initialize the GameUI controller
        this.ui = new GameUI(this);
        
        // Always initialize a fresh deck at the start of each game
        this.cards.initializeDeck();
        this.cards.shuffleDeck();
        console.log(`Initialized deck with ${this.cards.deck.length} cards at game start`);
        
        this.editorCreate();

        // Make sure all sounds are loaded
        try {
            // Add all sounds to the sound manager
            if (!this.sound.get("shuffleCards")) {
                this.sound.add("shuffleCards");
            }
            if (!this.sound.get("throwCard")) {
                this.sound.add("throwCard");
            }
            if (!this.sound.get("drawSound")) {
                this.sound.add("drawSound");
            }
            if (!this.sound.get("buttonSound")) {
                this.sound.add("buttonSound");
            }
            
            // Play shuffle sound
            this.sound.play("shuffleCards");
        } catch (error) {
            console.warn("Error setting up sounds:", error);
        }
        
        // Reset player state for a new game
        this.player.resetState();
        this.currentTurn = 'player'; // Ensure turn is set to player at start
        
        // Reset the last card on altar to ensure a clean start
        this.altar.lastCardOnAltar = null;
        
        console.log("Game initialized with player's turn");
        console.log("Altar reset for new game");

        // Randomly choose a soundtrack
        const soundtrackKey = Phaser.Math.RND.pick(["soundtrack1", "soundtrack2"]);

        // Add and play the chosen soundtrack
        try {
            // Stop any existing background music
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
            
            // Create and play the new background music
            this.backgroundMusic = this.sound.add(soundtrackKey, {
                volume: 0.5, // Set volume to 50%
                loop: true,  // Enable looping
            });

            this.backgroundMusic.play();
            console.log(`Playing ${soundtrackKey}`);
        } catch (error) {
            console.warn("Error playing background music:", error);
        }

        // Create all UI elements (end turn button, turn indicator, score display, and card arrangement buttons)
        this.ui.create();

        // Create the CPU's hand
        this.animateCPUHand(4); // Deal cards to the CPU's hand
        this.cpuCards = []; // Track CPU cards

        // Adjust the game scale dynamically
        this.scale.on("resize", this.resizeGame, this);
        this.resizeGame(this.scale.gameSize);

        // Create the explosion animation
        const frames = [];
        for (let i = 29; i <= 84; i++) {
            frames.push({ key: `explosion_red_${i}` });
        }

        this.anims.create({
            key: "explosion",
            frames: frames,
            frameRate: 30, // Adjust to control animation speed (frames per second)
            repeat: 0, // No repeat
        });

        // Show a message to start the game
        console.log("Starting the game with player's turn");
        this.hints.showMessage("Your Turn - Play a card or draw");
    }

    // End player turn and start CPU turn - now delegates to the player controller
    endPlayerTurn() {
        this.player.endTurn();
    }

    // End CPU turn and start player turn
    endCPUTurn() {
        if (this.currentTurn !== 'cpu') {
            console.log("Not CPU's turn, can't end turn");
            return;
        }
        
        console.log("Ending CPU's turn");
        this.currentTurn = 'player';
        this.ui.updateTurnIndicator('player');
        
        // Reset CPU state for next turn
        this.cpu.resetState();
        
        // Enable player card interactions for player's turn
        this.player.enableCards();
        
        // Show a message that it's player's turn
        this.hints.showMessage("Your Turn");
    }

    // Delegate to player controller
    disableDrawPile() {
        this.player.disableDrawPile();
    }

    // Delegate to player controller
    enableDrawPile() {
        this.player.enableDrawPile();
    }

    // Delegate to player controller
    disablePlayerCards() {
        this.player.disableCards();
    }

    // Delegate to player controller
    enablePlayerCards() {
        this.player.enableCards();
    }

    // Delegate to player controller
    drawCards(numCards, centerPosition, onComplete) {
        this.player.drawCards(numCards, centerPosition, onComplete);
    }

    // Update throwCardToAltar to use altar controller
    throwCardToAltar(card, cardKey, isPlayerCard = true) {
        this.altar.throwCardToAltar(card, cardKey, isPlayerCard);
        
        // Add win check here instead of rearrangeCards
        if (isPlayerCard && this.player.handCards.length === 0) {
            this.checkPlayerWin();
        }
    }

    // Delegate to player controller
    rearrangePlayerCards() {
        this.player.rearrangeCards();
    }

    // Delegate to player controller
    disableDrawPileAfterCardPlay() {
        this.player.disableDrawPileAfterCardPlay();
    }

    // Delegate to player controller
    checkPlayerMoves() {
        return this.player.checkValidMoves();
    }

    // Create and animate the CPU's hand
    animateCPUHand(numCards) {
        try {
            // Define the target position for CPU cards
            const targetY = 50; // Top of the screen
            
            // Define the suits for generating random cards
            const suits = ["clubs", "diamonds", "hearts", "spades"];

            // Get existing CPU cards
            const existingCpuCards = this.children.list.filter(
                (child) => child && child.texture && 
                child.texture.key === "cardBack" && 
                child.y < 100 && 
                !child.movedToAltar
            );
            
            console.log(`CPU already has ${existingCpuCards.length} cards`);
            
            // Check if CPU hand is already at max capacity (10 cards)
            if (existingCpuCards.length >= 10) {
                console.log("CPU already has maximum number of cards (10), cannot draw more");
                return;
            }
            
            // Limit the number of cards to draw to not exceed 10 total
            const maxCardsToAdd = 10 - existingCpuCards.length;
            const actualNumCards = Math.min(numCards, maxCardsToAdd);
            console.log(`Adding ${actualNumCards} cards to CPU hand (limited by max hand size of 10)`);
            
            if (actualNumCards <= 0) {
                console.log("No cards to add to CPU hand");
                return;
            }

            // Define spacing and calculate the starting X position for the CPU's hand
            // Use the same spacing logic as the player's hand for consistency
            const totalCards = existingCpuCards.length + actualNumCards;
            const maxSpacing = 50; // Maximum spacing between cards (same as player)
            const minSpacing = 10; // Minimum spacing between cards (smaller than player to fit more cards)
            // Adjust spacing based on number of cards - the more cards, the smaller the spacing
            const spacing = Math.max(minSpacing, maxSpacing - (totalCards - 1) * 2);
            const startX = this.scale.width / 2 - ((spacing * (totalCards - 1)) / 2);

            // First, rearrange existing cards if needed
            existingCpuCards.forEach((card, index) => {
                const targetX = startX + spacing * index;
                
                this.tweens.add({
                    targets: card,
                    x: targetX,
                    y: targetY,
                    duration: 500,
                    ease: "Power2"
                });
            });

            // Create and animate the new cards
            for (let i = 0; i < actualNumCards; i++) {
                // Check if there are any cards left in the deck
                if (!this.cards.deck || this.cards.deck.length === 0) {
                    console.log("Deck is empty or not initialized, cannot draw more cards for CPU");
                    break;
                }
                
                // Draw a card from the deck
                const cardData = this.cards.deck.pop();
                console.log(`CPU drawing card ${cardData.key} from deck. ${this.cards.deck.length} cards remaining.`);

                // Create the card with the back texture and set its initial position at the pile
                const pileX = this.scale.width / 2;
                const pileY = this.scale.height / 2;
                const cardDepth = 10 + existingCpuCards.length + i;
                const card = this.add.image(pileX, pileY, "cardBack")
                    .setScale(1)
                    .setDepth(100 + cardDepth); // Higher depth during animation
                
                // Store the original depth for consistency
                card.originalDepth = cardDepth;
                
                // Set the animation flag during the initial animation
                card.isAnimating = true;
                
                // Store the actual card value for later use
                card.actualCardKey = cardData.key;
                console.log(`Assigned actualCardKey: ${card.actualCardKey} to CPU card`);

                // Calculate the target position in the CPU hand row
                const targetX = startX + spacing * (existingCpuCards.length + i);
                
                // Animate the card directly from the center to its position in the CPU hand
                this.tweens.add({
                    targets: card,
                    x: targetX,
                    y: targetY,
                    scale: 1.0, // Same scale as player cards for consistency
                    duration: 600, // Faster animation (was 1000ms)
                    ease: "Power2",
                    onStart: () => {
                        // Play the draw sound
                        this.sound.play("drawSound");
                    },
                    onComplete: () => {
                        // Set the final depth after animation completes
                        card.setDepth(cardDepth);
                        
                        // Reset the animation flag
                        card.isAnimating = false;
                        
                        // Ensure the card is visible but flipped (hidden face)
                        card.setAlpha(1); // Make the card visible
                        card.setTexture("cardBack"); // Ensure it shows the card back
                        console.log(`Card ${cardData.key} dealt to CPU's hand.`);
                        
                        // If this is the last card, update the cpuCards array
                        if (i === actualNumCards - 1) {
                            // Update the cpuCards array
                            this.cpuCards = this.children.list.filter(
                                (child) => child && child.texture && 
                                child.texture.key === "cardBack" && 
                                child.y < 100 && 
                                !child.movedToAltar
                            );
                            console.log(`CPU now has ${this.cpuCards.length} cards`);
                            
                            // Rearrange CPU cards to ensure proper spacing and form
                            this.cpu.rearrangeCards();
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error in animateCPUHand:", error);
        }
    }

    // Delegate to altar controller
    showAltar() {
        this.altar.showAltar();
    }

    // Delegate to cards controller
    addCardInteractions(card, index, startX, spacing, targetY) {
        this.cards.addCardInteractions(card, index, startX, spacing, targetY);
    }

    // Delegate to gameOver controller
    showWinEffect() {
        this.gameOver.showWinEffect();
    }

    // Delegate to gameOver controller
    showPlayAgainButton() {
        this.gameOver.showPlayAgainButton();
    }

    // Delegate to gameOver controller
    checkPlayerWin() {
        return this.gameOver.checkPlayerWin();
    }

    // Delegate to altar controller
    animateGameOver() {
        this.altar.animateGameOver();
    }

    resizeGame(gameSize) {
        const { width, height } = gameSize;

        // Adjust the background
        const background = this.children.list.find(child => child.texture && child.texture.key === "pokerTable");
        if (background) {
            background.setDisplaySize(width, height);
        }

        // Adjust other game objects if necessary
        this.children.list.forEach(child => {
            if (child.originalX !== undefined && child.originalY !== undefined) {
                child.x = (child.originalX / this.scale.width) * width;
                child.y = (child.originalY / this.scale.height) * height;
            }
        });
        
        // Resize UI elements
        if (this.ui) {
            this.ui.resizeUI();
        }
    }

    showCardLimitMessage() {
        this.hints.showCardLimitMessage();
    }

    showEndTurnMessage() {
        this.hints.showEndTurnMessage();
    }

    showMessage(text) {
        this.hints.showMessage(text);
    }

    editorCreate() {
        // Create the background
        const table = this.add.image(this.scale.width / 2, this.scale.height / 2, "pokerTable");
        table.setDisplaySize(this.scale.width, this.scale.height);

        // Create the hole mask
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
            cardTexture: selectedCardTexture,
        });
        
        // Show the altar
        this.showAltar();
        
        // Draw initial player cards
        this.time.delayedCall(500, () => {
            this.drawCards(4, { x: this.scale.width / 2, y: this.scale.height / 2 }, () => {
                console.log("Initial player cards dealt");
            });
        });
    }

    // Delegate to cards controller
    addRotatingCardsInsideHole(options) {
        return this.cards.addRotatingCardsInsideHole(options);
    }

    // Delegate to altar controller
    ensureProperAltarStacking() {
        this.altar.ensureProperAltarStacking();
    }

    // Delegate to cards controller
    updateRotatingCards() {
        this.cards.updateRotatingCards();
    }
}

export default Game;


