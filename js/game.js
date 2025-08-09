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

// Utility functions
function getRandomKeyType() {
    return GAME_CONSTANTS.KEY_TYPES[Math.floor(Math.random() * GAME_CONSTANTS.KEY_TYPES.length)];
}

function canBeatDoor(playerKey, doorType) {
    return GAME_CONSTANTS.WINNING_COMBINATIONS[playerKey] === doorType;
}

function getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateUI() {
    const playerInfo = document.getElementById('player-info');
    const gameStatus = document.getElementById('game-status');
    
    if (gameState.currentPlayer) {
        const keys = gameState.currentPlayer.keys.length;
        const pos = gameState.currentPlayer.getPosition();
        playerInfo.textContent = `Keys: ${keys} | Position: (${Math.floor(pos.x)}, ${Math.floor(pos.y)})`;
    }
    
    if (gameState.battleInProgress) {
        gameStatus.textContent = 'Game Status: Battle in progress!';
    } else if (gameState.gameStarted) {
        gameStatus.textContent = 'Game Status: Playing';
    } else {
        gameStatus.textContent = 'Game Status: Waiting for players...';
    }
}