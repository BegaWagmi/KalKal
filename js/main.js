// Global function for battle UI choices
function chooseMove(move) {
    try {
        log('MAIN', 'ChooseMove', `Player chose move: ${move}`, { move });
        
        if (gameState.battleSystem && gameState.battleSystem.isActive) {
            gameState.battleSystem.chooseMove(move);
            log('MAIN', 'ChooseMove', `Move ${move} processed by battle system`);
        } else {
            log('MAIN', 'ChooseMove', 'No active battle system to process move', { move });
        }
        
    } catch (error) {
        log('MAIN', 'ChooseMove', `ERROR: Failed to process move ${move}`, error);
    }
}

// Initialize the game
try {
    log('MAIN', 'GameInit', 'Starting game initialization');
    
    // Create game configuration
    const config = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
        parent: 'game-container',
        backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: MainScene
    };
    
    log('MAIN', 'GameInit', 'Game configuration created', { 
        width: config.width, 
        height: config.height,
        physicsType: config.physics.default
    });
    
    // Create game instance
    const game = new Phaser.Game(config);
    
    // Make game globally accessible
    window.game = game;
    
    log('MAIN', 'GameInit', 'Phaser game instance created and made global', { 
        gameInstance: !!game,
        sceneCount: game.scene.scenes.length
    });
    
    // Set up global debug commands
    window.gameDebug = {
        showKeys: () => {
            try {
                log('MAIN', 'DebugShowKeys', 'Debug command: showKeys executed');
                const player = gameState.players.get('player1');
                if (player) {
                    console.log('Player keys:', player.keys);
                    log('MAIN', 'DebugShowKeys', 'Player keys displayed', { keys: player.keys });
                } else {
                    log('MAIN', 'DebugShowKeys', 'No player found to show keys for');
                }
            } catch (error) {
                log('MAIN', 'DebugShowKeys', 'ERROR: Failed to execute showKeys debug command', error);
            }
        },
        
        addKey: (type) => {
            try {
                log('MAIN', 'DebugAddKey', `Debug command: addKey executed with type ${type}`, { type });
                const player = gameState.players.get('player1');
                if (player && ['rock', 'paper', 'scissors'].includes(type)) {
                    player.addKey(type);
                    log('MAIN', 'DebugAddKey', `Key ${type} added to player via debug command`);
                } else {
                    log('MAIN', 'DebugAddKey', 'Invalid key type or no player found', { type, playerExists: !!player });
                }
            } catch (error) {
                log('MAIN', 'DebugAddKey', `ERROR: Failed to execute addKey debug command for type ${type}`, error);
            }
        },
        
        showState: () => {
            try {
                log('MAIN', 'DebugShowState', 'Debug command: showState executed');
                console.log('Game State:', gameState);
                log('MAIN', 'DebugShowState', 'Game state displayed in console');
            } catch (error) {
                log('MAIN', 'DebugShowState', 'ERROR: Failed to execute showState debug command', error);
            }
        },
        
        resetGame: () => {
            try {
                log('MAIN', 'DebugResetGame', 'Debug command: resetGame executed');
                // Reset game state
                gameState.players.clear();
                gameState.doors.clear();
                gameState.keys.clear();
                gameState.currentPlayer = null;
                gameState.battleInProgress = false;
                gameState.gameStarted = false;
                
                // Restart the scene
                if (game.scene.isActive('MainScene')) {
                    game.scene.restart('MainScene');
                }
                
                log('MAIN', 'DebugResetGame', 'Game reset successfully via debug command');
            } catch (error) {
                log('MAIN', 'DebugResetGame', 'ERROR: Failed to execute resetGame debug command', error);
            }
        }
    };
    
    log('MAIN', 'GameInit', 'Debug commands set up successfully', { 
        debugCommands: Object.keys(window.gameDebug)
    });
    
    log('MAIN', 'GameInit', 'Game initialization completed successfully');
    
} catch (error) {
    log('MAIN', 'GameInit', 'ERROR: Failed to initialize game', error);
    console.error('Failed to initialize game:', error);
}

// Add error handling for unhandled errors
window.addEventListener('error', (event) => {
    log('MAIN', 'GlobalError', 'Unhandled error occurred', { 
        message: event.message, 
        filename: event.filename, 
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    log('MAIN', 'GlobalError', 'Unhandled promise rejection', { 
        reason: event.reason,
        promise: event.promise
    });
});

log('MAIN', 'ScriptLoad', 'Main.js script loaded and executed successfully');