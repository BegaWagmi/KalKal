// Game configuration and constants
const GAME_CONFIG = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MainScene]
};

// Game constants
const GAME_CONSTANTS = {
    TILE_SIZE: 32,
    MAZE_WIDTH: 25,
    MAZE_HEIGHT: 19,
    PLAYER_SPEED: 150,
    BATTLE_PROXIMITY: 64,
    BATTLE_TRIGGER_TIME: 3000, // 3 seconds in milliseconds
    MAX_KEYS: 3,
    KEY_TYPES: ['rock', 'paper', 'scissors'],
    DOOR_TYPES: ['single', 'double', 'triple'],
    WINNING_COMBINATIONS: {
        'rock': 'scissors',
        'paper': 'rock',
        'scissors': 'paper'
    }
};

// Global game state
let gameState = {
    players: new Map(),
    doors: new Map(),
    keys: new Map(),
    currentPlayer: null,
    battleInProgress: false,
    gameStarted: false
};

// Logging utility function
function log(component, action, details = '', data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${component}] ${action}${details ? ': ' + details : ''}`;
    
    if (data) {
        console.log(logMessage, data);
    } else {
        console.log(logMessage);
    }
}

// Utility functions
function getRandomKeyType() {
    const keyType = GAME_CONSTANTS.KEY_TYPES[Math.floor(Math.random() * GAME_CONSTANTS.KEY_TYPES.length)];
    log('UTILITY', 'getRandomKeyType', `Generated: ${keyType}`);
    return keyType;
}

function canBeatDoor(playerKey, doorType) {
    const canBeat = GAME_CONSTANTS.WINNING_COMBINATIONS[playerKey] === doorType;
    log('UTILITY', 'canBeatDoor', `${playerKey} vs ${doorType} = ${canBeat ? 'WIN' : 'LOSE'}`);
    return canBeat;
}

function getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    log('UTILITY', 'getDistance', `Distance: ${distance.toFixed(2)} between (${pos1.x.toFixed(1)}, ${pos1.y.toFixed(1)}) and (${pos2.x.toFixed(1)}, ${pos2.y.toFixed(1)})`);
    return distance;
}

function updateUI() {
    log('UI', 'updateUI', 'Starting UI update');
    
    try {
        const playerInfo = document.getElementById('player-info');
        const gameStatus = document.getElementById('game-status');
        
        if (!playerInfo || !gameStatus) {
            log('UI', 'updateUI', 'ERROR: UI elements not found', { playerInfo: !!playerInfo, gameStatus: !!gameStatus });
            return;
        }
        
        if (gameState.currentPlayer) {
            const keys = gameState.currentPlayer.keys.length;
            const pos = gameState.currentPlayer.getPosition();
            const newText = `Keys: ${keys} | Position: (${Math.floor(pos.x)}, ${Math.floor(pos.y)})`;
            playerInfo.textContent = newText;
            log('UI', 'updateUI', 'Updated player info', { keys, position: pos });
        } else {
            log('UI', 'updateUI', 'No current player to update');
        }
        
        let statusText = '';
        if (gameState.battleInProgress) {
            statusText = 'Game Status: Battle in progress!';
        } else if (gameState.gameStarted) {
            statusText = 'Game Status: Playing';
        } else {
            statusText = 'Game Status: Waiting for players...';
        }
        
        gameStatus.textContent = statusText;
        log('UI', 'updateUI', 'Updated game status', { status: statusText });
        
    } catch (error) {
        log('UI', 'updateUI', 'ERROR: Failed to update UI', error);
    }
}

// Log initial game state
log('GAME', 'Initialization', 'Game constants and state initialized', {
    constants: GAME_CONSTANTS,
    initialState: gameState
});