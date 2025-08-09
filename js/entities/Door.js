class Door {
    constructor(scene, x, y, type, requiredKeys) {
        log('DOOR', 'Constructor', `Creating door ${type}`, { x, y, type, requiredKeys });
        
        try {
            this.scene = scene;
            this.id = `door_${Date.now()}_${Math.random()}`;
            this.x = x;
            this.y = y;
            this.type = type;
            this.isLocked = true;
            this.isActive = true;
            
            // Set required keys based on type
            if (type === 'single') {
                this.requiredKey = requiredKeys;
                this.requiredKeys = [requiredKeys];
            } else {
                this.requiredKeys = requiredKeys;
            }
            
            log('DOOR', 'Constructor', `Door requirements set`, { 
                type, 
                requiredKey: this.requiredKey, 
                requiredKeys: this.requiredKeys 
            });
            
            // Create sprite
            this.sprite = scene.add.rectangle(x, y, GAME_CONSTANTS.TILE_SIZE, GAME_CONSTANTS.TILE_SIZE, 0x8b4513);
            this.sprite.setStrokeStyle(3, 0x000000);
            
            // Add physics
            scene.physics.add.existing(this.sprite, true);
            
            // Add to scene
            scene.add.existing(this.sprite);
            
            // Add to game state
            gameState.doors.set(this.id, this);
            
            log('DOOR', 'Constructor', `Door ${this.id} created successfully`, { 
                position: { x, y }, 
                type, 
                isLocked: this.isLocked,
                requiredKeys: this.requiredKeys
            });
            
        } catch (error) {
            log('DOOR', 'Constructor', `ERROR: Failed to create door ${type}`, error);
            throw error;
        }
    }

    unlock() {
        try {
            if (!this.isLocked) {
                log('DOOR', 'Unlock', `Door ${this.id} already unlocked`);
                return;
            }
            
            log('DOOR', 'Unlock', `Unlocking door ${this.id}`, { 
                type: this.type, 
                requiredKeys: this.requiredKeys 
            });
            
            this.isLocked = false;
            this.sprite.setFillStyle(0x32cd32); // Green for unlocked
            this.sprite.setStrokeStyle(3, 0x006400);
            
            // Change door requirements for next use
            this.changeRequirements();
            
            log('DOOR', 'Unlock', `Door ${this.id} unlocked successfully`, { 
                newRequirements: this.requiredKeys,
                isLocked: this.isLocked
            });
            
        } catch (error) {
            log('DOOR', 'Unlock', `ERROR: Failed to unlock door ${this.id}`, error);
        }
    }

    changeRequirements() {
        try {
            const oldRequirements = [...this.requiredKeys];
            
            if (this.type === 'single') {
                this.requiredKey = getRandomKeyType();
                this.requiredKeys = [this.requiredKey];
            } else if (this.type === 'double') {
                this.requiredKeys = [getRandomKeyType(), getRandomKeyType()];
            } else if (this.type === 'triple') {
                this.requiredKeys = [getRandomKeyType(), getRandomKeyType(), getRandomKeyType()];
            }
            
            // Ensure no duplicate keys in requirements
            this.requiredKeys = [...new Set(this.requiredKeys)];
            
            log('DOOR', 'ChangeRequirements', `Door ${this.id} requirements changed`, { 
                oldRequirements, 
                newRequirements: this.requiredKeys,
                type: this.type
            });
            
            // Re-lock the door
            this.isLocked = true;
            this.sprite.setFillStyle(0x8b4513); // Brown for locked
            this.sprite.setStrokeStyle(3, 0x000000);
            
            log('DOOR', 'ChangeRequirements', `Door ${this.id} re-locked with new requirements`, { 
                isLocked: this.isLocked,
                newRequirements: this.requiredKeys
            });
            
        } catch (error) {
            log('DOOR', 'ChangeRequirements', `ERROR: Failed to change requirements for door ${this.id}`, error);
        }
    }

    getPosition() {
        try {
            const position = { x: this.x, y: this.y };
            return position;
        } catch (error) {
            log('DOOR', 'Constructor', `ERROR: Failed to get position for door ${this.id}`, error);
            return { x: 0, y: 0 };
        }
    }

    destroy() {
        try {
            log('DOOR', 'Destroy', `Destroying door ${this.id}`, { 
                finalPosition: this.getPosition(), 
                finalState: { isLocked: this.isLocked, type: this.type } 
            });
            
            this.sprite.destroy();
            gameState.doors.delete(this.id);
            
            log('DOOR', 'Destroy', `Door ${this.id} destroyed successfully`);
            
        } catch (error) {
            log('DOOR', 'Destroy', `ERROR: Failed to destroy door ${this.id}`, error);
        }
    }
}
