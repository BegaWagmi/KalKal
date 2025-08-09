import Phaser from 'phaser';
import { 
  SCENE_KEYS, 
  GAME_CONFIG, 
  GAMEPLAY_CONFIG, 
  COLORS, 
  KeyType,
  TileType,
  DEBUG_CONFIG 
} from '../utils/Constants.ts';
import { 
  MazeData, 
  PlayerData, 
  Vector2, 
  InputState, 
  GameState 
} from '../utils/Types.ts';
import { NetworkSystem } from '../systems/NetworkSystem.ts';
import { Player } from '../entities/Player.ts';

export class GameScene extends Phaser.Scene {
  // Core systems
  private networkSystem!: NetworkSystem;
  private players: Map<string, Player> = new Map();
  private localPlayer!: Player;
  private maze!: MazeData;
  
  // Game objects
  private mazeLayer!: Phaser.Tilemaps.TilemapLayer;
  private keysGroup!: Phaser.Physics.Arcade.Group;
  private doorsGroup!: Phaser.Physics.Arcade.Group;
  
  // Input and movement
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private currentInput: InputState = {
    movement: { x: 0, y: 0 },
    actions: new Set(),
    timestamp: 0
  };
  
  // UI elements
  private hudContainer!: Phaser.GameObjects.Container;
  private playerListText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  
  // Game state
  private gameStarted: boolean = false;
  private lastNetworkUpdate: number = 0;
  private networkUpdateRate: number = 1000 / 30; // 30Hz

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(data: any): void {
    console.log('🎮 GameScene: Initializing with data:', data);
    
    // Get match data from menu
    this.maze = data.maze;
    
    // Get network system
    this.networkSystem = this.registry.get('networkManager');
    
    // Clear existing players
    this.players.clear();
  }

  create(): void {
    console.log('🎮 GameScene: Creating game world...');
    
    // Create maze
    this.createMaze();
    
    // Setup physics
    this.setupPhysics();
    
    // Create initial players
    this.createPlayers();
    
    // Setup input
    this.setupInput();
    
    // Create HUD
    this.createHUD();
    
    // Setup camera
    this.setupCamera();
    
    // Setup network events
    this.setupNetworkEvents();
    
    // Start game
    this.startGame();
  }

  private createMaze(): void {
    // Create tilemap
    const map = this.make.tilemap({ 
      data: this.maze.layout, 
      tileWidth: GAME_CONFIG.TILE_SIZE, 
      tileHeight: GAME_CONFIG.TILE_SIZE 
    });
    
    // Add tileset
    const tileset = map.addTilesetImage('tiles', 'tile_floor');
    
    // Create layer
    this.mazeLayer = map.createLayer(0, tileset!, 0, 0)!;
    
    // Set collisions for walls
    this.mazeLayer.setCollisionByExclusion([0, 2]); // Only floor tiles are non-collidable
    
    // Create world bounds
    this.physics.world.setBounds(
      0, 0, 
      this.maze.width * GAME_CONFIG.TILE_SIZE, 
      this.maze.height * GAME_CONFIG.TILE_SIZE
    );
    
    console.log(`🗺️ Created maze: ${this.maze.width}x${this.maze.height}`);
  }

  private setupPhysics(): void {
    // Create groups for game objects
    this.keysGroup = this.physics.add.group();
    this.doorsGroup = this.physics.add.group();
    
    // Spawn keys
    this.spawnKeys();
    
    // Spawn doors
    this.spawnDoors();
  }

  private spawnKeys(): void {
    const keyTypes = [KeyType.ROCK, KeyType.PAPER, KeyType.SCISSORS];
    
    this.maze.keySpawns.forEach((spawn, index) => {
      const keyType = keyTypes[index % keyTypes.length];
      const keySprite = this.getKeyTexture(keyType);
      
      const key = this.physics.add.sprite(
        spawn.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        spawn.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        keySprite
      );
      
      key.setData('keyType', keyType);
      key.setData('keyId', `key_${index}`);
      
      // Add glow effect
      key.setTint(this.getKeyColor(keyType));
      
      // Floating animation
      this.tweens.add({
        targets: key,
        y: key.y - 5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.keysGroup.add(key);
    });
    
    console.log(`🔑 Spawned ${this.keysGroup.children.size} keys`);
  }

  private spawnDoors(): void {
    const doorTypes = [KeyType.ROCK, KeyType.PAPER, KeyType.SCISSORS];
    
    this.maze.doorPositions.forEach((doorPos, index) => {
      const doorType = doorTypes[index % doorTypes.length];
      const doorSprite = this.getDoorTexture(doorType);
      
      const door = this.physics.add.sprite(
        doorPos.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        doorPos.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        doorSprite
      );
      
      door.setData('doorType', doorType);
      door.setData('doorId', `door_${index}`);
      door.setData('isOpen', false);
      
      // Make doors immovable
      door.body!.setImmovable(true);
      
      this.doorsGroup.add(door);
    });
    
    console.log(`🚪 Spawned ${this.doorsGroup.children.size} doors`);
  }

  private createPlayers(): void {
    const matchData = this.registry.get('matchData');
    if (!matchData || !matchData.players) return;
    
    const localPlayerId = this.networkSystem.getPlayerId();
    
    matchData.players.forEach((playerData: PlayerData, index: number) => {
      const spawnPoint = this.maze.spawnPoints[index % this.maze.spawnPoints.length];
      const isLocal = playerData.id === localPlayerId;
      
      const player = new Player(
        this,
        spawnPoint.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        spawnPoint.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        playerData,
        isLocal
      );
      
      this.players.set(playerData.id, player);
      
      if (isLocal) {
        this.localPlayer = player;
      }
    });
    
    console.log(`👥 Created ${this.players.size} players`);
  }

  private setupInput(): void {
    // Cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // WASD keys
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    
    // Additional keys
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.currentInput.actions.add('interact');
    });
    
    this.input.keyboard!.on('keydown-ESC', () => {
      this.pauseGame();
    });
  }

  private createHUD(): void {
    const { width, height } = this.cameras.main;
    
    this.hudContainer = this.add.container(0, 0);
    
    // Top bar background
    const topBar = this.add.rectangle(width / 2, 30, width, 60, COLORS.BLACK, 0.8);
    
    // Player list
    this.playerListText = this.add.text(20, 20, 'Players: Loading...', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Timer
    this.timerText = this.add.text(width - 20, 20, 'Time: --:--', {
      fontSize: '14px',
      color: '#00f5ff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(1, 0);
    
    // Debug info
    if (DEBUG_CONFIG.SHOW_FPS) {
      this.debugText = this.add.text(20, height - 60, '', {
        fontSize: '12px',
        color: '#00f5ff',
        fontFamily: 'monospace'
      });
    }
    
    this.hudContainer.add([topBar, this.playerListText, this.timerText]);
    
    if (this.debugText) {
      this.hudContainer.add(this.debugText);
    }
    
    // Keep HUD on top
    this.hudContainer.setScrollFactor(0);
    this.hudContainer.setDepth(1000);
  }

  private setupCamera(): void {
    if (this.localPlayer) {
      // Follow local player
      this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
      
      // Set camera bounds to maze
      this.cameras.main.setBounds(
        0, 0,
        this.maze.width * GAME_CONFIG.TILE_SIZE,
        this.maze.height * GAME_CONFIG.TILE_SIZE
      );
    }
  }

  private setupNetworkEvents(): void {
    this.networkSystem.on('gameStateUpdate', this.handleGameStateUpdate, this);
    this.networkSystem.on('battleStarted', this.handleBattleStarted, this);
    this.networkSystem.on('playerEliminated', this.handlePlayerEliminated, this);
    this.networkSystem.on('gameEnded', this.handleGameEnded, this);
  }

  private startGame(): void {
    this.gameStarted = true;
    
    // Setup collision detection
    this.setupCollisions();
    
    // Start network updates
    this.startNetworkUpdates();
    
    console.log('🚀 Game started!');
  }

  private setupCollisions(): void {
    if (!this.localPlayer) return;
    
    // Player vs maze walls
    this.physics.add.collider(this.localPlayer, this.mazeLayer);
    
    // Player vs keys
    this.physics.add.overlap(this.localPlayer, this.keysGroup, this.collectKey, undefined, this);
    
    // Player vs doors
    this.physics.add.overlap(this.localPlayer, this.doorsGroup, this.interactWithDoor, undefined, this);
  }

  private collectKey(player: Player, keySprite: Phaser.Physics.Arcade.Sprite): void {
    const keyType = keySprite.getData('keyType') as KeyType;
    const keyId = keySprite.getData('keyId') as string;
    
    // Add key to player
    player.addKey(keyType);
    
    // Remove key from world
    keySprite.destroy();
    
    // Send to server
    // this.networkSystem.sendKeyCollection(keyId);
    
    console.log(`🔑 Collected ${keyType} key`);
  }

  private interactWithDoor(player: Player, doorSprite: Phaser.Physics.Arcade.Sprite): void {
    const doorType = doorSprite.getData('doorType') as KeyType;
    const isOpen = doorSprite.getData('isOpen') as boolean;
    
    if (isOpen) return; // Already open
    
    if (player.hasKey(doorType)) {
      // Open door
      player.removeKey(doorType);
      doorSprite.setData('isOpen', true);
      doorSprite.setAlpha(0.5);
      doorSprite.body!.setEnable(false); // Disable collision
      
      // Visual effect
      this.createDoorOpenEffect(doorSprite.x, doorSprite.y);
      
      console.log(`🚪 Opened ${doorType} door`);
    } else {
      console.log(`🔒 Need ${doorType} key to open door`);
    }
  }

  private createDoorOpenEffect(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particles', {
      scale: { start: 0.2, end: 0 },
      speed: { min: 50, max: 100 },
      lifespan: 500,
      quantity: 10,
      tint: COLORS.ACCENT_CYAN
    });
    
    // Remove particles after animation
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  private startNetworkUpdates(): void {
    // Send input updates at regular intervals
    this.time.addEvent({
      delay: this.networkUpdateRate,
      callback: this.sendNetworkUpdate,
      callbackScope: this,
      loop: true
    });
  }

  private sendNetworkUpdate(): void {
    if (!this.localPlayer || !this.gameStarted) return;
    
    // Send current input state
    this.networkSystem.sendPlayerInput(this.currentInput);
  }

  private handleGameStateUpdate(data: any): void {
    // Update all players with server data
    if (data.deltaState && data.deltaState.players) {
      data.deltaState.players.forEach((playerData: PlayerData) => {
        const player = this.players.get(playerData.id);
        if (player) {
          player.updateFromServer(playerData);
        }
      });
    }
  }

  private handleBattleStarted(data: any): void {
    console.log('⚔️ Battle started!', data);
    
    // Pause current scene and start battle scene
    this.scene.pause();
    this.scene.launch(SCENE_KEYS.BATTLE, {
      battleData: data.battleData,
      opponentName: data.opponentName
    });
  }

  private handlePlayerEliminated(data: any): void {
    const player = this.players.get(data.playerId);
    if (player) {
      player.playerData.status = 'eliminated';
      console.log(`💀 Player eliminated: ${player.playerName}`);
    }
  }

  private handleGameEnded(data: any): void {
    console.log('🏁 Game ended!', data);
    this.gameStarted = false;
    
    // Show end game screen
    this.showEndGameScreen(data);
  }

  private showEndGameScreen(data: any): void {
    const { width, height } = this.cameras.main;
    
    const endContainer = this.add.container(width / 2, height / 2);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 300, COLORS.BLACK, 0.9);
    bg.setStrokeStyle(3, COLORS.ACCENT_CYAN);
    
    // Title
    const title = this.add.text(0, -100, data.winner ? 'VICTORY!' : 'GAME OVER', {
      fontSize: '32px',
      color: data.winner ? '#00ff87' : '#ff006e',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Winner info
    const winnerText = this.add.text(0, -50, `Winner: ${data.winner || 'None'}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // Back to menu button
    const menuButton = this.add.rectangle(0, 50, 200, 40, COLORS.SECONDARY);
    menuButton.setStrokeStyle(2, COLORS.ACCENT_CYAN);
    menuButton.setInteractive({ useHandCursor: true });
    
    const menuLabel = this.add.text(0, 50, 'BACK TO MENU', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    menuButton.on('pointerdown', () => {
      this.returnToMenu();
    });
    
    endContainer.add([bg, title, winnerText, menuButton, menuLabel]);
    endContainer.setScrollFactor(0);
    endContainer.setDepth(2000);
  }

  private pauseGame(): void {
    // Show pause menu or return to main menu
    this.returnToMenu();
  }

  private returnToMenu(): void {
    // Disconnect from network
    this.networkSystem.disconnect();
    
    // Clean up
    this.cleanup();
    
    // Return to menu
    this.scene.start(SCENE_KEYS.MENU);
  }

  // Utility methods
  private getKeyTexture(keyType: KeyType): string {
    switch (keyType) {
      case KeyType.ROCK: return 'key_rock';
      case KeyType.PAPER: return 'key_paper';
      case KeyType.SCISSORS: return 'key_scissors';
      default: return 'key_rock';
    }
  }

  private getDoorTexture(doorType: KeyType): string {
    switch (doorType) {
      case KeyType.ROCK: return 'door_rock';
      case KeyType.PAPER: return 'door_paper';
      case KeyType.SCISSORS: return 'door_scissors';
      default: return 'door_rock';
    }
  }

  private getKeyColor(keyType: KeyType): number {
    switch (keyType) {
      case KeyType.ROCK: return COLORS.ROCK_COLOR;
      case KeyType.PAPER: return COLORS.PAPER_COLOR;
      case KeyType.SCISSORS: return COLORS.SCISSORS_COLOR;
      default: return COLORS.WHITE;
    }
  }

  update(time: number, delta: number): void {
    if (!this.gameStarted || !this.localPlayer) return;
    
    // Update input state
    this.updateInput();
    
    // Apply input to local player
    this.localPlayer.handleInput(this.currentInput);
    
    // Update all players
    this.players.forEach(player => {
      player.update(time, delta);
    });
    
    // Update HUD
    this.updateHUD();
    
    // Check for proximity battles
    this.checkProximityBattles();
  }

  private updateInput(): void {
    const movement = { x: 0, y: 0 };
    
    // Arrow keys
    if (this.cursors.left.isDown) movement.x -= 1;
    if (this.cursors.right.isDown) movement.x += 1;
    if (this.cursors.up.isDown) movement.y -= 1;
    if (this.cursors.down.isDown) movement.y += 1;
    
    // WASD keys
    if (this.wasdKeys.A.isDown) movement.x -= 1;
    if (this.wasdKeys.D.isDown) movement.x += 1;
    if (this.wasdKeys.W.isDown) movement.y -= 1;
    if (this.wasdKeys.S.isDown) movement.y += 1;
    
    // Normalize diagonal movement
    if (movement.x !== 0 && movement.y !== 0) {
      movement.x *= 0.707; // 1/sqrt(2)
      movement.y *= 0.707;
    }
    
    this.currentInput = {
      movement,
      actions: new Set(this.currentInput.actions), // Copy previous actions
      timestamp: Date.now()
    };
    
    // Clear actions after processing
    this.currentInput.actions.clear();
  }

  private updateHUD(): void {
    // Update player list
    const alivePlayers = Array.from(this.players.values())
      .filter(p => p.playerData.status === 'alive');
    this.playerListText.setText(`Players: ${alivePlayers.length}/${this.players.size}`);
    
    // Update timer (placeholder)
    const gameTime = Math.floor(this.time.now / 1000);
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    
    // Update debug info
    if (this.debugText) {
      const fps = Math.round(this.game.loop.actualFps);
      const ping = this.networkSystem.getPing();
      this.debugText.setText(`FPS: ${fps}\nPing: ${ping}ms\nPlayers: ${this.players.size}`);
    }
  }

  private checkProximityBattles(): void {
    if (!this.localPlayer) return;
    
    // Check distance to other players
    this.players.forEach(otherPlayer => {
      if (otherPlayer === this.localPlayer) return;
      
      const distance = this.localPlayer.getDistanceTo(otherPlayer);
      const inProximity = distance <= (GAMEPLAY_CONFIG.BATTLE_PROXIMITY_RANGE * GAME_CONFIG.TILE_SIZE);
      
      // Show/hide proximity warning
      this.localPlayer.showProximityWarning(inProximity);
    });
  }

  private cleanup(): void {
    // Remove network listeners
    this.networkSystem.off('gameStateUpdate', this.handleGameStateUpdate, this);
    this.networkSystem.off('battleStarted', this.handleBattleStarted, this);
    this.networkSystem.off('playerEliminated', this.handlePlayerEliminated, this);
    this.networkSystem.off('gameEnded', this.handleGameEnded, this);
    
    // Clean up players
    this.players.forEach(player => {
      player.destroy();
    });
    this.players.clear();
  }

  destroy(): void {
    this.cleanup();
    super.destroy();
  }
}