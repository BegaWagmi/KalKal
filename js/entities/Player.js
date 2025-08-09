class Player {
    constructor(scene, x, y, id = 'player1') {
        log('PLAYER', 'Constructor', `Creating player ${id}`, { x, y, id });
        
        try {
            this.scene = scene;
            this.id = id;
            this.keys = [];
            this.isAI = id !== 'player1';
            
            // Create sprite
            this.sprite = scene.physics.add.sprite(x, y, 'player');
            this.sprite.setTint(this.isAI ? 0xff0000 : 0x00ff00);
            this.sprite.setDisplaySize(GAME_CONSTANTS.TILE_SIZE - 4, GAME_CONSTANTS.TILE_SIZE - 4);
            
            log('PLAYER', 'Constructor', `Sprite created for ${id}`, { 
                position: { x, y }, 
                isAI, 
                tint: this.isAI ? 'red' : 'green',
                size: GAME_CONSTANTS.TILE_SIZE - 4
            });
            
            // Set up physics
            this.sprite.setCollideWorldBounds(false);
            this.sprite.body.setCollideWorldBounds(true);
            
            // Add collision with walls
            scene.physics.add.collider(this.sprite, scene.children.list.filter(child => child.body && child.body.isStatic));
            
            // Start with a random key
            const startingKey = getRandomKeyType();
            this.addKey(startingKey);
            
            // AI movement variables
            this.targetX = x;
            this.targetY = y;
            this.movementTimer = 0;
            this.movementInterval = 2000; // Change direction every 2 seconds
            
            // Add to scene
            scene.add.existing(this.sprite);
            
            log('PLAYER', 'Constructor', `Player ${id} created successfully`, { 
                startingKey, 
                totalKeys: this.keys.length,
                isAI,
                movementInterval: this.movementInterval
            });
            
        } catch (error) {
            log('PLAYER', 'Constructor', `ERROR: Failed to create player ${id}`, error);
            throw error;
        }
    }

    update(cursors, wasd) {
        try {
            if (this.isAI) {
                this.updateAI();
            } else {
                this.updatePlayer(cursors, wasd);
            }
            
            // Check for key collection
            this.checkKeyCollection();
            
            // Check for door interaction
            this.checkDoorInteraction();
            
        } catch (error) {
            log('PLAYER', 'Update', `ERROR: Failed to update player ${this.id}`, error);
        }
    }

    updatePlayer(cursors, wasd) {
        try {
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
            
            if (velocityX !== 0 || velocityY !== 0) {
                log('PLAYER', 'UpdatePlayer', `Player ${this.id} movement`, { 
                    velocityX: velocityX.toFixed(1), 
                    velocityY: velocityY.toFixed(1),
                    position: this.getPosition()
                });
            }
            
        } catch (error) {
            log('PLAYER', 'UpdatePlayer', `ERROR: Failed to update player movement for ${this.id}`, error);
        }
    }

    updateAI() {
        try {
            this.movementTimer += 16; // Assuming 60fps
            
            if (this.movementTimer >= this.movementInterval) {
                // Choose new random direction
                const oldTarget = { x: this.targetX, y: this.targetY };
                this.targetX = this.sprite.x + (Math.random() - 0.5) * 200;
                this.targetY = this.sprite.y + (Math.random() - 0.5) * 200;
                this.movementTimer = 0;
                
                log('PLAYER', 'UpdateAI', `AI ${this.id} new target`, { 
                    oldTarget, 
                    newTarget: { x: this.targetX, y: this.targetY },
                    currentPosition: this.getPosition()
                });
            }
            
            // Move towards target
            const dx = this.targetX - this.sprite.x;
            const dy = this.targetY - this.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const velocityX = (dx / distance) * GAME_CONSTANTS.PLAYER_SPEED * 0.5;
                const velocityY = (dy / distance) * GAME_CONSTANTS.PLAYER_SPEED * 0.5;
                this.sprite.setVelocity(velocityX, velocityY);
                
                log('PLAYER', 'UpdateAI', `AI ${this.id} moving to target`, { 
                    distance: distance.toFixed(1), 
                    velocityX: velocityX.toFixed(1), 
                    velocityY: velocityY.toFixed(1)
                });
            } else {
                this.sprite.setVelocity(0, 0);
                log('PLAYER', 'UpdateAI', `AI ${this.id} reached target`, { 
                    distance: distance.toFixed(1), 
                    position: this.getPosition()
                });
            }
            
        } catch (error) {
            log('PLAYER', 'UpdateAI', `ERROR: Failed to update AI ${this.id}`, error);
        }
    }

    checkKeyCollection() {
        try {
            gameState.keys.forEach(key => {
                if (key.isActive && this.canCollectKey(key)) {
                    const distance = getDistance(this.getPosition(), key.getPosition());
                    if (distance < GAME_CONSTANTS.TILE_SIZE) {
                        log('PLAYER', 'CheckKeyCollection', `Player ${this.id} near key`, { 
                            keyType: key.type, 
                            keyId: key.id, 
                            distance: distance.toFixed(1),
                            currentKeys: this.keys.length
                        });
                        this.collectKey(key);
                    }
                }
            });
        } catch (error) {
            log('PLAYER', 'CheckKeyCollection', `ERROR: Failed to check key collection for ${this.id}`, error);
        }
    }

    checkDoorInteraction() {
        try {
            gameState.doors.forEach(door => {
                if (door.isLocked && this.canOpenDoor(door)) {
                    const distance = getDistance(this.getPosition(), door.getPosition());
                    if (distance < GAME_CONSTANTS.TILE_SIZE) {
                        log('PLAYER', 'CheckDoorInteraction', `Player ${this.id} near door`, { 
                            doorId: door.id, 
                            doorType: door.type, 
                            distance: distance.toFixed(1),
                            currentKeys: this.keys.length
                        });
                        this.openDoor(door);
                    }
                }
            });
        } catch (error) {
            log('PLAYER', 'CheckDoorInteraction', `ERROR: Failed to check door interaction for ${this.id}`, error);
        }
    }

    canCollectKey(key) {
        const canCollect = this.keys.length < GAME_CONSTANTS.MAX_KEYS;
        log('PLAYER', 'CanCollectKey', `Key collection check for ${this.id}`, { 
            keyType: key.type, 
            currentKeys: this.keys.length, 
            maxKeys: GAME_CONSTANTS.MAX_KEYS, 
            canCollect 
        });
        return canCollect;
    }

    canOpenDoor(door) {
        let canOpen = false;
        
        try {
            if (door.type === 'single') {
                canOpen = this.keys.some(key => canBeatDoor(key, door.requiredKey));
                log('PLAYER', 'CanOpenDoor', `Single door check for ${this.id}`, { 
                    doorId: door.id, 
                    requiredKey: door.requiredKey, 
                    playerKeys: this.keys, 
                    canOpen 
                });
            } else if (door.type === 'double') {
                canOpen = this.keys.length >= 2 && 
                       door.requiredKeys.every(reqKey => 
                           this.keys.some(key => canBeatDoor(key, reqKey))
                       );
                log('PLAYER', 'CanOpenDoor', `Double door check for ${this.id}`, { 
                    doorId: door.id, 
                    requiredKeys: door.requiredKeys, 
                    playerKeys: this.keys, 
                    keyCount: this.keys.length,
                    canOpen 
                });
            } else if (door.type === 'triple') {
                canOpen = this.keys.length >= 3 && 
                       door.requiredKeys.every(reqKey => 
                           this.keys.some(key => canBeatDoor(key, reqKey))
                       );
                log('PLAYER', 'CanOpenDoor', `Triple door check for ${this.id}`, { 
                    doorId: door.id, 
                    requiredKeys: door.requiredKeys, 
                    playerKeys: this.keys, 
                    keyCount: this.keys.length,
                    canOpen 
                });
            }
        } catch (error) {
            log('PLAYER', 'CanOpenDoor', `ERROR: Failed to check door opening for ${this.id}`, error);
            canOpen = false;
        }
        
        return canOpen;
    }

    collectKey(key) {
        try {
            if (this.canCollectKey(key)) {
                this.keys.push(key.type);
                key.collect();
                log('PLAYER', 'CollectKey', `Player ${this.id} collected key`, { 
                    keyType: key.type, 
                    keyId: key.id, 
                    totalKeys: this.keys.length,
                    allKeys: [...this.keys]
                });
            } else {
                log('PLAYER', 'CollectKey', `Player ${this.id} cannot collect key`, { 
                    keyType: key.type, 
                    currentKeys: this.keys.length, 
                    maxKeys: GAME_CONSTANTS.MAX_KEYS 
                });
            }
        } catch (error) {
            log('PLAYER', 'CollectKey', `ERROR: Failed to collect key for ${this.id}`, error);
        }
    }

    openDoor(door) {
        try {
            if (this.canOpenDoor(door)) {
                const keysBefore = [...this.keys];
                
                // Remove used keys
                if (door.type === 'single') {
                    const keyIndex = this.keys.findIndex(key => canBeatDoor(key, door.requiredKey));
                    if (keyIndex !== -1) {
                        const removedKey = this.keys.splice(keyIndex, 1)[0];
                        log('PLAYER', 'OpenDoor', `Player ${this.id} used key for single door`, { 
                            doorId: door.id, 
                            usedKey: removedKey, 
                            requiredKey: door.requiredKey 
                        });
                    }
                } else if (door.type === 'double') {
                    door.requiredKeys.forEach(reqKey => {
                        const keyIndex = this.keys.findIndex(key => canBeatDoor(key, reqKey));
                        if (keyIndex !== -1) {
                            const removedKey = this.keys.splice(keyIndex, 1)[0];
                            log('PLAYER', 'OpenDoor', `Player ${this.id} used key for double door`, { 
                                doorId: door.id, 
                                usedKey: removedKey, 
                                requiredKey: reqKey 
                            });
                        }
                    });
                } else if (door.type === 'triple') {
                    door.requiredKeys.forEach(reqKey => {
                        const keyIndex = this.keys.findIndex(key => canBeatDoor(key, reqKey));
                        if (keyIndex !== -1) {
                            const removedKey = this.keys.splice(keyIndex, 1)[0];
                            log('PLAYER', 'OpenDoor', `Player ${this.id} used key for triple door`, { 
                                doorId: door.id, 
                                usedKey: removedKey, 
                                requiredKey: reqKey 
                            });
                        }
                    });
                }
                
                door.unlock();
                log('PLAYER', 'OpenDoor', `Player ${this.id} opened door`, { 
                    doorId: door.id, 
                    doorType: door.type, 
                    keysBefore, 
                    keysAfter: [...this.keys],
                    keysUsed: keysBefore.length - this.keys.length
                });
            } else {
                log('PLAYER', 'OpenDoor', `Player ${this.id} cannot open door`, { 
                    doorId: door.id, 
                    doorType: door.type, 
                    currentKeys: this.keys.length,
                    requiredKeys: door.type === 'single' ? [door.requiredKey] : door.requiredKeys
                });
            }
        } catch (error) {
            log('PLAYER', 'OpenDoor', `ERROR: Failed to open door for ${this.id}`, error);
        }
    }

    addKey(keyType) {
        try {
            if (this.keys.length < GAME_CONSTANTS.MAX_KEYS) {
                this.keys.push(keyType);
                log('PLAYER', 'AddKey', `Player ${this.id} gained key`, { 
                    keyType, 
                    totalKeys: this.keys.length, 
                    allKeys: [...this.keys] 
                });
            } else {
                log('PLAYER', 'AddKey', `Player ${this.id} cannot add key - at max capacity`, { 
                    keyType, 
                    currentKeys: this.keys.length, 
                    maxKeys: GAME_CONSTANTS.MAX_KEYS 
                });
            }
        } catch (error) {
            log('PLAYER', 'AddKey', `ERROR: Failed to add key for ${this.id}`, error);
        }
    }

    removeKey(keyType) {
        try {
            const index = this.keys.indexOf(keyType);
            if (index !== -1) {
                const removedKey = this.keys.splice(index, 1)[0];
                log('PLAYER', 'RemoveKey', `Player ${this.id} lost key`, { 
                    keyType, 
                    totalKeys: this.keys.length, 
                    allKeys: [...this.keys] 
                });
                return true;
            } else {
                log('PLAYER', 'RemoveKey', `Player ${this.id} key not found for removal`, { 
                    keyType, 
                    currentKeys: [...this.keys] 
                });
                return false;
            }
        } catch (error) {
            log('PLAYER', 'RemoveKey', `ERROR: Failed to remove key for ${this.id}`, error);
            return false;
        }
    }

    stealRandomKey() {
        try {
            if (this.keys.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.keys.length);
                const stolenKey = this.keys.splice(randomIndex, 1)[0];
                log('PLAYER', 'StealRandomKey', `Player ${this.id} had key stolen`, { 
                    stolenKey, 
                    remainingKeys: this.keys.length, 
                    allKeys: [...this.keys] 
                });
                return stolenKey;
            } else {
                log('PLAYER', 'StealRandomKey', `Player ${this.id} has no keys to steal`);
                return null;
            }
        } catch (error) {
            log('PLAYER', 'StealRandomKey', `ERROR: Failed to steal random key from ${this.id}`, error);
            return null;
        }
    }

    getPosition() {
        try {
            const position = { x: this.sprite.x, y: this.sprite.y };
            return position;
        } catch (error) {
            log('PLAYER', 'GetPosition', `ERROR: Failed to get position for ${this.id}`, error);
            return { x: 0, y: 0 };
        }
    }

    setPosition(x, y) {
        try {
            const oldPosition = this.getPosition();
            this.sprite.setPosition(x, y);
            log('PLAYER', 'SetPosition', `Player ${this.id} position changed`, { 
                oldPosition, 
                newPosition: { x, y } 
            });
        } catch (error) {
            log('PLAYER', 'SetPosition', `ERROR: Failed to set position for ${this.id}`, error);
        }
    }

    destroy() {
        try {
            log('PLAYER', 'Destroy', `Destroying player ${this.id}`, { 
                finalPosition: this.getPosition(), 
                finalKeys: [...this.keys] 
            });
            this.sprite.destroy();
        } catch (error) {
            log('PLAYER', 'Destroy', `ERROR: Failed to destroy player ${this.id}`, error);
        }
    }
}