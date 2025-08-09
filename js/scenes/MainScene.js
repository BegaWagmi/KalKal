class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        log('MAIN_SCENE', 'Constructor', 'MainScene instance created');
        
        this.maze = [];
        this.player = null;
        this.doors = [];
        this.keys = [];
        this.otherPlayers = [];
        this.proximityTimer = 0;
        this.battleSystem = null;
        
        log('MAIN_SCENE', 'Constructor', 'MainScene properties initialized');
    }

    preload() {
        log('MAIN_SCENE', 'Preload', 'Starting asset preload');
        
        try {
            // Create simple colored rectangles for placeholder assets
            this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            this.load.image('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            this.load.image('door', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            this.load.image('key', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            
            log('MAIN_SCENE', 'Preload', 'All placeholder assets loaded successfully');
        } catch (error) {
            log('MAIN_SCENE', 'Preload', 'ERROR: Failed to load assets', error);
        }
    }

    create() {
        log('MAIN_SCENE', 'Create', 'Starting scene creation');
        
        try {
            this.battleSystem = new BattleSystem(this);
            log('MAIN_SCENE', 'Create', 'BattleSystem created');
            
            // Generate maze
            this.generateMaze();
            log('MAIN_SCENE', 'Create', 'Maze generated');
            
            // Create player
            this.player = new Player(this, 64, 64);
            gameState.currentPlayer = this.player;
            gameState.players.set('player1', this.player);
            log('MAIN_SCENE', 'Create', 'Main player created and added to game state', { playerId: 'player1', position: { x: 64, y: 64 } });
            
            // Create some AI players for testing
            this.createAIPlayers();
            log('MAIN_SCENE', 'Create', 'AI players created');
            
            // Create doors and keys
            this.createDoorsAndKeys();
            log('MAIN_SCENE', 'Create', 'Doors and keys created');
            
            // Set up camera
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(0, 0, this.maze[0].length * GAME_CONSTANTS.TILE_SIZE, this.maze.length * GAME_CONSTANTS.TILE_SIZE);
            log('MAIN_SCENE', 'Create', 'Camera setup complete', { bounds: { width: this.maze[0].length * GAME_CONSTANTS.TILE_SIZE, height: this.maze.length * GAME_CONSTANTS.TILE_SIZE } });
            
            // Set up input
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            log('MAIN_SCENE', 'Create', 'Input controls setup complete');
            
            // Start game
            gameState.gameStarted = true;
            updateUI();
            log('MAIN_SCENE', 'Create', 'Scene creation completed successfully');
            
        } catch (error) {
            log('MAIN_SCENE', 'Create', 'ERROR: Failed to create scene', error);
        }
    }

    update(time, delta) {
        if (!gameState.gameStarted || gameState.battleInProgress) {
            if (!gameState.gameStarted) {
                log('MAIN_SCENE', 'Update', 'Update skipped - game not started');
            } else {
                log('MAIN_SCENE', 'Update', 'Update skipped - battle in progress');
            }
            return;
        }
        
        try {
            // Update player movement
            this.player.update(this.cursors, this.wasd);
            
            // Update AI players
            this.otherPlayers.forEach(player => {
                try {
                    player.update();
                } catch (error) {
                    log('MAIN_SCENE', 'Update', `ERROR: Failed to update AI player ${player.id}`, error);
                }
            });
            
            // Check proximity for battles
            this.checkProximityBattles();
            
            // Update UI
            updateUI();
            
        } catch (error) {
            log('MAIN_SCENE', 'Update', 'ERROR: Failed to update scene', error);
        }
    }

    generateMaze() {
        log('MAIN_SCENE', 'GenerateMaze', 'Starting maze generation', { width: GAME_CONSTANTS.MAZE_WIDTH, height: GAME_CONSTANTS.MAZE_HEIGHT });
        
        try {
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
            
            log('MAIN_SCENE', 'GenerateMaze', 'Maze array generated', { 
                startArea: { x: 2, y: 2, clear: this.maze[2][2] === 0 },
                endArea: { x: GAME_CONSTANTS.MAZE_WIDTH - 3, y: GAME_CONSTANTS.MAZE_HEIGHT - 3, clear: this.maze[GAME_CONSTANTS.MAZE_HEIGHT - 3][GAME_CONSTANTS.MAZE_WIDTH - 3] === 0 }
            });
            
            // Render maze
            let wallCount = 0;
            for (let y = 0; y < this.maze.length; y++) {
                for (let x = 0; x < this.maze[y].length; x++) {
                    if (this.maze[y][x] === 1) {
                        try {
                            const wall = this.add.rectangle(
                                x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
                                y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
                                GAME_CONSTANTS.TILE_SIZE,
                                GAME_CONSTANTS.TILE_SIZE,
                                0x34495e
                            );
                            this.physics.add.existing(wall, true);
                            wallCount++;
                        } catch (error) {
                            log('MAIN_SCENE', 'GenerateMaze', `ERROR: Failed to create wall at (${x}, ${y})`, error);
                        }
                    }
                }
            }
            
            log('MAIN_SCENE', 'GenerateMaze', 'Maze rendering completed', { totalWalls: wallCount, mazeSize: { width: this.maze[0].length, height: this.maze.length } });
            
        } catch (error) {
            log('MAIN_SCENE', 'GenerateMaze', 'ERROR: Failed to generate maze', error);
        }
    }

    createAIPlayers() {
        log('MAIN_SCENE', 'CreateAIPlayers', 'Starting AI player creation');
        
        try {
            // Create 2 AI players for testing
            const aiPlayer1 = new Player(this, 128, 128, 'ai1');
            const aiPlayer2 = new Player(this, 192, 192, 'ai2');
            
            this.otherPlayers = [aiPlayer1, aiPlayer2];
            gameState.players.set('ai1', aiPlayer1);
            gameState.players.set('ai2', aiPlayer2);
            
            log('MAIN_SCENE', 'CreateAIPlayers', 'AI players created successfully', { 
                ai1: { id: 'ai1', position: { x: 128, y: 128 } },
                ai2: { id: 'ai2', position: { x: 192, y: 192 } }
            });
            
        } catch (error) {
            log('MAIN_SCENE', 'CreateAIPlayers', 'ERROR: Failed to create AI players', error);
        }
    }

    createDoorsAndKeys() {
        log('MAIN_SCENE', 'CreateDoorsAndKeys', 'Starting door and key creation');
        
        try {
            // Create some doors
            const door1 = new Door(this, 400, 200, 'single', 'rock');
            const door2 = new Door(this, 500, 300, 'double', ['rock', 'paper']);
            const door3 = new Door(this, 600, 400, 'triple', ['rock', 'paper', 'scissors']);
            
            this.doors = [door1, door2, door3];
            this.doors.forEach(door => gameState.doors.set(door.id, door));
            
            log('MAIN_SCENE', 'CreateDoorsAndKeys', 'Doors created', { 
                single: { id: door1.id, position: { x: 400, y: 200 }, type: 'single' },
                double: { id: door2.id, position: { x: 500, y: 300 }, type: 'double' },
                triple: { id: door3.id, position: { x: 600, y: 400 }, type: 'triple' }
            });
            
            // Create some keys
            const key1 = new Key(this, 300, 150, 'rock');
            const key2 = new Key(this, 450, 250, 'paper');
            const key3 = new Key(this, 550, 350, 'scissors');
            
            this.keys = [key1, key2, key3];
            this.keys.forEach(key => gameState.keys.set(key.id, key));
            
            log('MAIN_SCENE', 'CreateDoorsAndKeys', 'Keys created', { 
                rock: { id: key1.id, position: { x: 300, y: 150 }, type: 'rock' },
                paper: { id: key2.id, position: { x: 450, y: 250 }, type: 'paper' },
                scissors: { id: key3.id, position: { x: 550, y: 350 }, type: 'scissors' }
            });
            
        } catch (error) {
            log('MAIN_SCENE', 'CreateDoorsAndKeys', 'ERROR: Failed to create doors and keys', error);
        }
    }

    checkProximityBattles() {
        if (gameState.battleInProgress) {
            log('MAIN_SCENE', 'CheckProximityBattles', 'Battle already in progress, skipping proximity check');
            return;
        }
        
        try {
            this.otherPlayers.forEach(otherPlayer => {
                try {
                    const distance = getDistance(this.player.getPosition(), otherPlayer.getPosition());
                    
                    if (distance <= GAME_CONSTANTS.BATTLE_PROXIMITY) {
                        this.proximityTimer += 16; // Assuming 60fps
                        
                        log('MAIN_SCENE', 'CheckProximityBattles', `Player near ${otherPlayer.id}`, { 
                            distance: distance.toFixed(2), 
                            proximityTimer: this.proximityTimer, 
                            threshold: GAME_CONSTANTS.BATTLE_TRIGGER_TIME 
                        });
                        
                        if (this.proximityTimer >= GAME_CONSTANTS.BATTLE_TRIGGER_TIME) {
                            log('MAIN_SCENE', 'CheckProximityBattles', `Battle threshold reached with ${otherPlayer.id}`, { 
                                proximityTimer: this.proximityTimer, 
                                threshold: GAME_CONSTANTS.BATTLE_TRIGGER_TIME 
                            });
                            this.triggerBattle(this.player, otherPlayer);
                            this.proximityTimer = 0;
                        }
                    } else {
                        if (this.proximityTimer > 0) {
                            log('MAIN_SCENE', 'CheckProximityBattles', `Player moved away from ${otherPlayer.id}, resetting timer`, { 
                                distance: distance.toFixed(2), 
                                oldTimer: this.proximityTimer 
                            });
                        }
                        this.proximityTimer = 0;
                    }
                } catch (error) {
                    log('MAIN_SCENE', 'CheckProximityBattles', `ERROR: Failed to check proximity with ${otherPlayer.id}`, error);
                }
            });
            
        } catch (error) {
            log('MAIN_SCENE', 'CheckProximityBattles', 'ERROR: Failed to check proximity battles', error);
        }
    }

    triggerBattle(player1, player2) {
        log('MAIN_SCENE', 'TriggerBattle', 'Starting battle', { 
            player1: player1.id, 
            player2: player2.id,
            player1Keys: player1.keys.length,
            player2Keys: player2.keys.length
        });
        
        try {
            gameState.battleInProgress = true;
            this.battleSystem.startBattle(player1, player2);
            log('MAIN_SCENE', 'TriggerBattle', 'Battle triggered successfully');
        } catch (error) {
            log('MAIN_SCENE', 'TriggerBattle', 'ERROR: Failed to trigger battle', error);
            gameState.battleInProgress = false;
        }
    }

    isWallAt(x, y) {
        const gridX = Math.floor(x / GAME_CONSTANTS.TILE_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.TILE_SIZE);
        
        if (gridX < 0 || gridX >= GAME_CONSTANTS.MAZE_WIDTH || 
            gridY < 0 || gridY >= GAME_CONSTANTS.MAZE_HEIGHT) {
            log('MAIN_SCENE', 'IsWallAt', 'Position outside maze bounds', { x, y, gridX, gridY, bounds: { width: GAME_CONSTANTS.MAZE_WIDTH, height: GAME_CONSTANTS.MAZE_HEIGHT } });
            return true;
        }
        
        const isWall = this.maze[gridY][gridX] === 1;
        log('MAIN_SCENE', 'IsWallAt', 'Wall check result', { x, y, gridX, gridY, isWall, mazeValue: this.maze[gridY][gridX] });
        return isWall;
    }
}