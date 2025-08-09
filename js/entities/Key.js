class Key {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.id = `key_${Date.now()}_${Math.random()}`;
        this.type = type; // 'rock', 'paper', or 'scissors'
        this.x = x;
        this.y = y;
        this.isActive = true;
        this.isCollected = false;
        
        // Create sprite with different colors for each type
        const colors = {
            'rock': 0x8b4513,    // Brown
            'paper': 0xf5f5dc,   // Beige
            'scissors': 0x4169e1  // Blue
        };
        
        this.sprite = scene.add.rectangle(x, y, GAME_CONSTANTS.TILE_SIZE - 8, GAME_CONSTANTS.TILE_SIZE - 8, colors[type]);
        this.sprite.setStrokeStyle(2, 0x000000);
        
        // Add physics
        scene.physics.add.existing(this.sprite, true);
        
        // Add to scene
        scene.add.existing(this.sprite);
        
        // Add text label
        this.label = scene.add.text(x, y, type.charAt(0).toUpperCase(), {
            fontSize: '16px',
            fill: '#000000',
            stroke: '#ffffff',
            strokeThickness: 1
        });
        this.label.setOrigin(0.5);
        
        // Add to game state
        gameState.keys.set(this.id, this);
        
        // Add floating animation
        this.startFloatingAnimation();
    }

    startFloatingAnimation() {
        this.scene.tweens.add({
            targets: [this.sprite, this.label],
            y: this.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect() {
        if (this.isActive && !this.isCollected) {
            this.isActive = false;
            this.isCollected = true;
            
            // Hide sprite and label
            this.sprite.setVisible(false);
            this.label.setVisible(false);
            
            // Remove from physics
            this.sprite.body.enable = false;
            
            console.log(`Key ${this.type} collected!`);
            
            // Remove from game state after a delay
            setTimeout(() => {
                this.destroy();
            }, 1000);
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    destroy() {
        this.sprite.destroy();
        this.label.destroy();
        gameState.keys.delete(this.id);
    }
}