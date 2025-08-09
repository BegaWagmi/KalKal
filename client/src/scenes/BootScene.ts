import Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, COLORS } from '../utils/Constants.ts';

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingProgress: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    console.log('🚀 BootScene: Starting asset loading...');
    
    // Create loading graphics
    this.createLoadingBar();
    
    // Setup loading event listeners
    this.setupLoadingEvents();
    
    // Load placeholder assets (for prototype)
    this.loadPlaceholderAssets();
    
    // Load game data
    this.loadGameData();
  }

  create(): void {
    console.log('✅ BootScene: Assets loaded, transitioning to menu...');
    
    // Create default animations
    this.createAnimations();
    
    // Setup audio system
    this.setupAudio();
    
    // Initialize global game systems
    this.initializeGameSystems();
    
    // Transition to menu scene
    this.time.delayedCall(1000, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private createLoadingBar(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.PRIMARY);
    
    // Title text
    this.add.text(width / 2, height / 2 - 100, 'CONVERGENCE TRIALS', {
      fontSize: '32px',
      color: '#00f5ff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Loading text
    this.add.text(width / 2, height / 2 + 50, 'Loading...', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // Loading bar background
    const barWidth = 400;
    const barHeight = 8;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 100;
    
    this.add.rectangle(barX + barWidth / 2, barY + barHeight / 2, barWidth, barHeight, COLORS.GRAY)
      .setOrigin(0.5);
    
    // Loading bar fill
    this.loadingBar = this.add.graphics();
    this.updateLoadingBar(0);
  }

  private updateLoadingBar(progress: number): void {
    this.loadingProgress = progress;
    const { width, height } = this.cameras.main;
    const barWidth = 400;
    const barHeight = 8;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 100;
    
    this.loadingBar.clear();
    this.loadingBar.fillStyle(COLORS.ACCENT_CYAN);
    this.loadingBar.fillRect(barX, barY, barWidth * progress, barHeight);
    
    // Add glow effect
    this.loadingBar.lineStyle(2, COLORS.ACCENT_CYAN, 0.3);
    this.loadingBar.strokeRect(barX, barY, barWidth * progress, barHeight);
  }

  private setupLoadingEvents(): void {
    this.load.on('progress', (progress: number) => {
      this.updateLoadingBar(progress);
      
      // Update HTML loading bar if still visible
      const htmlProgress = document.querySelector('.loading-progress') as HTMLElement;
      if (htmlProgress) {
        htmlProgress.style.width = `${progress * 100}%`;
      }
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      console.log('Loading:', file.key);
    });

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('Failed to load:', file.key, file.url);
    });

    this.load.on('complete', () => {
      console.log('✅ All assets loaded successfully');
    });
  }

  private loadPlaceholderAssets(): void {
    // Generate placeholder graphics programmatically
    this.createPlaceholderGraphics();
    
    // Load audio placeholders (empty for now)
    this.load.audio(ASSET_KEYS.BGM_MENU, []);
    this.load.audio(ASSET_KEYS.BGM_GAME, []);
    this.load.audio(ASSET_KEYS.BGM_BATTLE, []);
  }

  private createPlaceholderGraphics(): void {
    // Create player sprite placeholder
    this.load.image(ASSET_KEYS.PLAYER, this.generatePlayerTexture());
    
    // Create key sprites placeholders
    this.load.image('key_rock', this.generateKeyTexture(COLORS.ROCK_COLOR));
    this.load.image('key_paper', this.generateKeyTexture(COLORS.PAPER_COLOR));
    this.load.image('key_scissors', this.generateKeyTexture(COLORS.SCISSORS_COLOR));
    
    // Create door sprites placeholders
    this.load.image('door_rock', this.generateDoorTexture(COLORS.ROCK_COLOR));
    this.load.image('door_paper', this.generateDoorTexture(COLORS.PAPER_COLOR));
    this.load.image('door_scissors', this.generateDoorTexture(COLORS.SCISSORS_COLOR));
    
    // Create maze tile placeholders
    this.load.image('tile_floor', this.generateTileTexture(COLORS.SECONDARY));
    this.load.image('tile_wall', this.generateTileTexture(COLORS.GRAY));
    
    // Create particle texture
    this.load.image(ASSET_KEYS.PARTICLES, this.generateParticleTexture());
  }

  private generatePlayerTexture(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 32;
    canvas.height = 32;
    
    // Draw player as a simple circle
    ctx.fillStyle = '#00f5ff';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Add inner circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas.toDataURL();
  }

  private generateKeyTexture(color: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 24;
    canvas.height = 24;
    
    // Convert color from hex to CSS
    const cssColor = `#${color.toString(16).padStart(6, '0')}`;
    
    // Draw key as a diamond shape
    ctx.fillStyle = cssColor;
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(22, 12);
    ctx.lineTo(12, 22);
    ctx.lineTo(2, 12);
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.strokeStyle = cssColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    return canvas.toDataURL();
  }

  private generateDoorTexture(color: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 32;
    canvas.height = 32;
    
    const cssColor = `#${color.toString(16).padStart(6, '0')}`;
    
    // Draw door as a rectangle with symbol
    ctx.fillStyle = '#333333';
    ctx.fillRect(4, 4, 24, 24);
    
    // Draw symbol
    ctx.fillStyle = cssColor;
    ctx.fillRect(8, 8, 16, 16);
    
    // Add border
    ctx.strokeStyle = cssColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 24, 24);
    
    return canvas.toDataURL();
  }

  private generateTileTexture(color: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 32;
    canvas.height = 32;
    
    const cssColor = `#${color.toString(16).padStart(6, '0')}`;
    
    // Fill with base color
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 32, 32);
    
    // Add subtle pattern
    ctx.fillStyle = `#${(color + 0x111111).toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillRect(16, 16, 16, 16);
    
    return canvas.toDataURL();
  }

  private generateParticleTexture(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 8;
    canvas.height = 8;
    
    // Create a small glowing particle
    const gradient = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
    gradient.addColorStop(0, '#00f5ff');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 8);
    
    return canvas.toDataURL();
  }

  private loadGameData(): void {
    // Load maze layouts (placeholder data for now)
    const mazeLayouts = {
      spiral: {
        id: 'spiral',
        width: 20,
        height: 15,
        layout: this.generateSampleMaze(20, 15),
        spawnPoints: [
          { x: 1, y: 1 },
          { x: 18, y: 1 },
          { x: 1, y: 13 },
          { x: 18, y: 13 }
        ],
        keySpawns: [
          { x: 5, y: 5 },
          { x: 15, y: 5 },
          { x: 10, y: 10 },
          { x: 5, y: 12 }
        ],
        doorPositions: [
          { x: 8, y: 3 },
          { x: 12, y: 7 },
          { x: 8, y: 11 }
        ],
        exitPosition: { x: 18, y: 7 },
        theme: 'cyber'
      }
    };
    
    // Store maze data in cache
    this.cache.json.add(ASSET_KEYS.MAZE_LAYOUTS, mazeLayouts);
  }

  private generateSampleMaze(width: number, height: number): number[][] {
    // Generate a simple maze pattern
    const maze: number[][] = [];
    
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        // Border walls
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          maze[y][x] = 1; // Wall
        }
        // Interior pattern
        else if ((x % 3 === 0 && y % 3 === 0) || (x % 5 === 0 && y % 2 === 0)) {
          maze[y][x] = 1; // Wall
        }
        else {
          maze[y][x] = 2; // Floor
        }
      }
    }
    
    return maze;
  }

  private createAnimations(): void {
    // Player movement animations (placeholder)
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: ASSET_KEYS.PLAYER, frame: 0 }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk',
      frames: [{ key: ASSET_KEYS.PLAYER, frame: 0 }],
      frameRate: 8,
      repeat: -1
    });

    // Key collection animation
    this.anims.create({
      key: 'key_idle',
      frames: [
        { key: 'key_rock', frame: 0 },
        { key: 'key_paper', frame: 0 },
        { key: 'key_scissors', frame: 0 }
      ],
      frameRate: 2,
      repeat: -1
    });
  }

  private setupAudio(): void {
    // Initialize audio system with default settings
    if (this.sound) {
      this.sound.volume = 0.7;
    }
    
    console.log('🔊 Audio system initialized');
  }

  private initializeGameSystems(): void {
    // Initialize global game registries
    this.registry.set('playerData', null);
    this.registry.set('gameState', null);
    this.registry.set('networkManager', null);
    this.registry.set('settings', {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.5,
      showFPS: false
    });
    
    console.log('⚙️ Game systems initialized');
  }
}