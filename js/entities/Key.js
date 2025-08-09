class Key {
    constructor(scene, x, y, type) {
        log('KEY', 'Constructor', `Creating key ${type}`, { x, y, type });
        
        try {
            this.scene = scene;
            this.id = `key_${Date.now()}_${Math.random()}`;
            this.type = type;
            this.x = x;
            this.y = y;
            this.isActive = true;
            this.isCollected = false;
            
            // Set color based on type
            const colors = { 'rock': 0x8b4513, 'paper': 0xf5f5dc, 'scissors': 0x4169e1 };
            const color = colors[type];
            
            log('KEY', 'Constructor', `Key color set`, { type, color: color.toString(16) });
            
            // Create sprite
            this.sprite = scene.add.rectangle(x, y, GAME_CONSTANTS.TILE_SIZE - 8, GAME_CONSTANTS.TILE_SIZE - 8, color);
            this.sprite.setStrokeStyle(2, 0x000000);
            
            // Add physics
            scene.physics.add.existing(this.sprite, true);
            
            // Add to scene
            scene.add.existing(this.sprite);
            
            // Add to game state
            gameState.keys.set(this.id, this);
            
            // Create label
            this.label = scene.add.text(x, y, type.charAt(0).toUpperCase(), {
                fontSize: '16px',
                fill: '#000000',
                fontStyle: 'bold'
            });
            this.label.setOrigin(0.5);
            
            log('KEY', 'Constructor', `Key ${this.id} created successfully`, { 
                position: { x, y }, 
                type, 
                color: color.toString(16),
                isActive: this.isActive,
                isCollected: this.isCollected
            });
            
            // Start floating animation
            this.startFloatingAnimation();
            
        } catch (error) {
            log('KEY', 'Constructor', `ERROR: Failed to create key ${type}`, error);
            throw error;
        }
    }

    startFloatingAnimation() {
        try {
            log('KEY', 'StartFloatingAnimation', `Starting floating animation for key ${this.id}`);
            
            this.scene.tweens.add({
                targets: [this.sprite, this.label],
                y: this.y - 5,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            log('KEY', 'StartFloatingAnimation', `Floating animation started for key ${this.id}`);
            
        } catch (error) {
            log('KEY', 'StartFloatingAnimation', `ERROR: Failed to start floating animation for key ${this.id}`, error);
        }
    }

    collect() {
        try {
            if (this.isCollected) {
                log('KEY', 'Collect', `Key ${this.id} already collected`);
                return;
            }
            
            log('KEY', 'Collect', `Collecting key ${this.id}`, { 
                type: this.type, 
                position: this.getPosition() 
            });
            
            this.isCollected = true;
            this.isActive = false;
            
            // Hide sprite and label
            this.sprite.setVisible(false);
            this.label.setVisible(false);
            
            // Stop physics
            this.sprite.body.setEnable(false);
            
            // Remove from game state
            gameState.keys.delete(this.id);
            
            log('KEY', 'Collect', `Key ${this.id} collected successfully`, { 
                type: this.type,
                isCollected: this.isCollected,
                isActive: this.isActive,
                removedFromGameState: !gameState.keys.has(this.id)
            });
            
        } catch (error) {
            log('KEY', 'Collect', `ERROR: Failed to collect key ${this.id}`, error);
        }
    }

    getPosition() {
        try {
            const position = { x: this.x, y: this.y };
            return position;
        } catch (error) {
            log('KEY', 'GetPosition', `ERROR: Failed to get position for key ${this.id}`, error);
            return { x: 0, y: 0 };
        }
    }

    destroy() {
        try {
            log('KEY', 'Destroy', `Destroying key ${this.id}`, { 
                finalPosition: this.getPosition(), 
                finalState: { isCollected: this.isCollected, isActive: this.isActive } 
            });
            
            // Stop any active tweens
            this.scene.tweens.killTweensOf([this.sprite, this.label]);
            
            // Destroy sprites
            this.sprite.destroy();
            this.label.destroy();
            
            // Remove from game state if still there
            if (gameState.keys.has(this.id)) {
                gameState.keys.delete(this.id);
                log('KEY', 'Destroy', `Key ${this.id} removed from game state`);
            }
            
            log('KEY', 'Destroy', `Key ${this.id} destroyed successfully`);
            
        } catch (error) {
            log('KEY', 'Destroy', `ERROR: Failed to destroy key ${this.id}`, error);
        }
    }
}