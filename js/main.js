// Global function for battle UI
function chooseMove(move) {
    if (gameState.battleInProgress && gameState.currentPlayer) {
        // Find the current scene's battle system
        const currentScene = game.scene.getScene('MainScene');
        if (currentScene && currentScene.battleSystem) {
            currentScene.battleSystem.chooseMove(move);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Create the Phaser game instance
        const game = new Phaser.Game(GAME_CONFIG);
        
        // Make game globally accessible
        window.game = game;
        
        console.log('RockPaperScissors game initialized successfully!');
        
        // Add some helpful console commands for debugging
        window.gameDebug = {
            showKeys: () => {
                if (gameState.currentPlayer) {
                    console.log('Current player keys:', gameState.currentPlayer.keys);
                }
            },
            showDoors: () => {
                console.log('Active doors:', Array.from(gameState.doors.values()));
            },
            showKeys: () => {
                console.log('Available keys:', Array.from(gameState.keys.values()));
            },
            addKey: (type) => {
                if (gameState.currentPlayer && ['rock', 'paper', 'scissors'].includes(type)) {
                    gameState.currentPlayer.addKey(type);
                    console.log(`Added ${type} key to player`);
                }
            }
        };
        
        console.log('Debug commands available: gameDebug.showKeys(), gameDebug.showDoors(), gameDebug.addKey(type)');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.getElementById('game-status').textContent = 'Game Status: Failed to load';
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.game) {
        window.game.scale.refresh();
    }
});