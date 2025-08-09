class Player {
    constructor(scene, x, y, id = 'player1') {
        this.scene = scene;
        this.id = id;
        this.keys = [];
        this.isAI = id !== 'player1';
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setTint(this.isAI ? 0xff0000 : 0x00ff00);
        this.sprite.setDisplaySize(GAME_CONSTANTS.TILE_SIZE - 4, GAME_CONSTANTS.TILE_SIZE - 4);
        
        // Set up physics
        this.sprite.setCollideWorldBounds(false);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Add collision with walls
        scene.physics.add.collider(this.sprite, scene.children.list.filter(child => child.body && child.body.isStatic));
        
        // Start with a random key
        this.addKey(getRandomKeyType());
        
        // AI movement variables
        this.targetX = x;
        this.targetY = y;
        this.movementTimer = 0;
        this.movementInterval = 2000; // Change direction every 2 seconds
        
        // Add to scene
        scene.add.existing(this.sprite);
    }

    update(cursors, wasd) {
        if (this.isAI) {
            this.updateAI();
        } else {
            this.updatePlayer(cursors, wasd);
        }
        
        // Check for key collection
        this.checkKeyCollection();
        
        // Check for door interaction
        this.checkDoorInteraction();
    }

    updatePlayer(cursors, wasd) {
        let velocityX = 0;
        let velocityY = 0;
        
        // Arrow keys
        if (cursors.left.isDown || wasd.A.isDown) {
            velocityX = -GAME_CONSTANTS.PLAYER_SPEED;
        } else if (cursors.right.isDown || wasd.D.isDown) {
            velocityX = GAME_CONSTANTS.PLAYER_SPEED;
        }
        
        if (cursors.up.isDown || wasd.W.isDown) {
            velocityY = -GAME_CONSTANTS.PLAYER_SPEED;
        } else if (cursors.down.isDown || wasd.S.isDown) {
            velocityY = GAME_CONSTANTS.PLAYER_SPEED;
        }
        
        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }
        
        this.sprite.setVelocity(velocityX, velocityY);
    }

    updateAI() {
        this.movementTimer += 16; // Assuming 60fps
        
        if (this.movementTimer >= this.movementInterval) {
            // Choose new random direction
            this.targetX = this.sprite.x + (Math.random() - 0.5) * 200;
            this.targetY = this.sprite.y + (Math.random() - 0.5) * 200;
            this.movementTimer = 0;
        }
        
        // Move towards target
        const dx = this.targetX - this.sprite.x;
        const dy = this.targetY - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            const velocityX = (dx / distance) * GAME_CONSTANTS.PLAYER_SPEED * 0.5;
            const velocityY = (dy / distance) * GAME_CONSTANTS.PLAYER_SPEED * 0.5;
            this.sprite.setVelocity(velocityX, velocityY);
        } else {
            this.sprite.setVelocity(0, 0);
        }
    }

    checkKeyCollection() {
        gameState.keys.forEach(key => {
            if (key.isActive && this.canCollectKey(key)) {
                const distance = getDistance(this.getPosition(), key.getPosition());
                if (distance < GAME_CONSTANTS.TILE_SIZE) {
                    this.collectKey(key);
                }
            }
        });
    }

    checkDoorInteraction() {
        gameState.doors.forEach(door => {
            if (door.isLocked && this.canOpenDoor(door)) {
                const distance = getDistance(this.getPosition(), door.getPosition());
                if (distance < GAME_CONSTANTS.TILE_SIZE) {
                    this.openDoor(door);
                }
            }
        });
    }

    canCollectKey(key) {
        return this.keys.length < GAME_CONSTANTS.MAX_KEYS;
    }

    canOpenDoor(door) {
        if (door.type === 'single') {
            return this.keys.some(key => canBeatDoor(key, door.requiredKey));
        } else if (door.type === 'double') {
            return this.keys.length >= 2 && 
                   door.requiredKeys.every(reqKey => 
                       this.keys.some(key => canBeatDoor(key, reqKey))
                   );
        } else if (door.type === 'triple') {
            return this.keys.length >= 3 && 
                   door.requiredKeys.every(reqKey => 
                       this.keys.some(key => canBeatDoor(key, reqKey))
                   );
        }
        return false;
    }

    collectKey(key) {
        if (this.canCollectKey(key)) {
            this.keys.push(key.type);
            key.collect();
            console.log(`Player ${this.id} collected ${key.type} key. Total keys: ${this.keys.length}`);
        }
    }

    openDoor(door) {
        if (this.canOpenDoor(door)) {
            // Remove used keys
            if (door.type === 'single') {
                const keyIndex = this.keys.findIndex(key => canBeatDoor(key, door.requiredKey));
                if (keyIndex !== -1) {
                    this.keys.splice(keyIndex, 1);
                }
            } else if (door.type === 'double') {
                door.requiredKeys.forEach(reqKey => {
                    const keyIndex = this.keys.findIndex(key => canBeatDoor(key, reqKey));
                    if (keyIndex !== -1) {
                        this.keys.splice(keyIndex, 1);
                    }
                });
            } else if (door.type === 'triple') {
                door.requiredKeys.forEach(reqKey => {
                    const keyIndex = this.keys.findIndex(key => canBeatDoor(key, reqKey));
                    if (keyIndex !== -1) {
                        this.keys.splice(keyIndex, 1);
                    }
                });
            }
            
            door.unlock();
            console.log(`Player ${this.id} opened ${door.type} door. Remaining keys: ${this.keys.length}`);
        }
    }

    addKey(keyType) {
        if (this.keys.length < GAME_CONSTANTS.MAX_KEYS) {
            this.keys.push(keyType);
        }
    }

    removeKey(keyType) {
        const index = this.keys.indexOf(keyType);
        if (index !== -1) {
            this.keys.splice(index, 1);
            return true;
        }
        return false;
    }

    stealRandomKey() {
        if (this.keys.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.keys.length);
            return this.keys.splice(randomIndex, 1)[0];
        }
        return null;
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    setPosition(x, y) {
        this.sprite.setPosition(x, y);
    }

    destroy() {
        this.sprite.destroy();
    }
}