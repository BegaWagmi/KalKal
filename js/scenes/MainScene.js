class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.maze = [];
        this.player = null;
        this.doors = [];
        this.keys = [];
        this.otherPlayers = [];
        this.proximityTimer = 0;
        this.battleSystem = null;
    }

    preload() {
        // Create simple colored rectangles for placeholder assets
        this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('door', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('key', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        this.battleSystem = new BattleSystem(this);
        
        // Generate maze
        this.generateMaze();
        
        // Create player
        this.player = new Player(this, 64, 64);
        gameState.currentPlayer = this.player;
        gameState.players.set('player1', this.player);
        
        // Create some AI players for testing
        this.createAIPlayers();
        
        // Create doors and keys
        this.createDoorsAndKeys();
        
        // Set up camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.maze[0].length * GAME_CONSTANTS.TILE_SIZE, this.maze.length * GAME_CONSTANTS.TILE_SIZE);
        
        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Start game
        gameState.gameStarted = true;
        updateUI();
    }

    update(time, delta) {
        if (!gameState.gameStarted || gameState.battleInProgress) return;
        
        // Update player movement
        this.player.update(this.cursors, this.wasd);
        
        // Update AI players
        this.otherPlayers.forEach(player => player.update());
        
        // Check proximity for battles
        this.checkProximityBattles();
        
        // Update UI
        updateUI();
    }

    generateMaze() {
        // Simple maze generation - walls around edges and some random internal walls
        this.maze = [];
        
        for (let y = 0; y < GAME_CONSTANTS.MAZE_HEIGHT; y++) {
            this.maze[y] = [];
            for (let x = 0; x < GAME_CONSTANTS.MAZE_WIDTH; x++) {
                if (x === 0 || x === GAME_CONSTANTS.MAZE_WIDTH - 1 || 
                    y === 0 || y === GAME_CONSTANTS.MAZE_HEIGHT - 1) {
                    this.maze[y][x] = 1; // Wall
                } else if (Math.random() < 0.1) {
                    this.maze[y][x] = 1; // Random internal wall
                } else {
                    this.maze[y][x] = 0; // Empty space
                }
            }
        }
        
        // Ensure start and end areas are clear
        this.maze[2][2] = 0; // Start area
        this.maze[GAME_CONSTANTS.MAZE_HEIGHT - 3][GAME_CONSTANTS.MAZE_WIDTH - 3] = 0; // End area
        
        // Render maze
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    const wall = this.add.rectangle(
                        x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
                        y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
                        GAME_CONSTANTS.TILE_SIZE,
                        GAME_CONSTANTS.TILE_SIZE,
                        0x34495e
                    );
                    this.physics.add.existing(wall, true);
                }
            }
        }
    }

    createAIPlayers() {
        // Create 2 AI players for testing
        const aiPlayer1 = new Player(this, 128, 128, 'ai1');
        const aiPlayer2 = new Player(this, 192, 192, 'ai2');
        
        this.otherPlayers = [aiPlayer1, aiPlayer2];
        gameState.players.set('ai1', aiPlayer1);
        gameState.players.set('ai2', aiPlayer2);
    }

    createDoorsAndKeys() {
        // Create some doors
        const door1 = new Door(this, 400, 200, 'single', 'rock');
        const door2 = new Door(this, 500, 300, 'double', ['rock', 'paper']);
        const door3 = new Door(this, 600, 400, 'triple', ['rock', 'paper', 'scissors']);
        
        this.doors = [door1, door2, door3];
        this.doors.forEach(door => gameState.doors.set(door.id, door));
        
        // Create some keys
        const key1 = new Key(this, 300, 150, 'rock');
        const key2 = new Key(this, 450, 250, 'paper');
        const key3 = new Key(this, 550, 350, 'scissors');
        
        this.keys = [key1, key2, key3];
        this.keys.forEach(key => gameState.keys.set(key.id, key));
    }

    checkProximityBattles() {
        if (gameState.battleInProgress) return;
        
        this.otherPlayers.forEach(otherPlayer => {
            const distance = getDistance(this.player.getPosition(), otherPlayer.getPosition());
            
            if (distance <= GAME_CONSTANTS.BATTLE_PROXIMITY) {
                this.proximityTimer += 16; // Assuming 60fps
                
                if (this.proximityTimer >= GAME_CONSTANTS.BATTLE_TRIGGER_TIME) {
                    this.triggerBattle(this.player, otherPlayer);
                    this.proximityTimer = 0;
                }
            } else {
                this.proximityTimer = 0;
            }
        });
    }

    triggerBattle(player1, player2) {
        gameState.battleInProgress = true;
        this.battleSystem.startBattle(player1, player2);
    }

    isWallAt(x, y) {
        const gridX = Math.floor(x / GAME_CONSTANTS.TILE_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.TILE_SIZE);
        
        if (gridX < 0 || gridX >= GAME_CONSTANTS.MAZE_WIDTH || 
            gridY < 0 || gridY >= GAME_CONSTANTS.MAZE_HEIGHT) {
            return true;
        }
        
        return this.maze[gridY][gridX] === 1;
    }
}