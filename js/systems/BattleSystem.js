class BattleSystem {
    constructor(scene) {
        log('BATTLE_SYSTEM', 'Constructor', 'BattleSystem instance created');
        
        try {
            this.scene = scene;
            this.battleUI = document.getElementById('battle-ui');
            this.battleMessage = document.getElementById('battle-message');
            
            if (!this.battleUI || !this.battleMessage) {
                log('BATTLE_SYSTEM', 'Constructor', 'ERROR: Battle UI elements not found', { 
                    battleUI: !!this.battleUI, 
                    battleMessage: !!this.battleMessage 
                });
            } else {
                log('BATTLE_SYSTEM', 'Constructor', 'Battle UI elements found successfully');
            }
            
            this.player1 = null;
            this.player2 = null;
            this.player1Choice = null;
            this.player2Choice = null;
            this.battleStarted = false;
            
            log('BATTLE_SYSTEM', 'Constructor', 'BattleSystem initialized successfully');
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'Constructor', 'ERROR: Failed to initialize BattleSystem', error);
        }
    }

    startBattle(player1, player2) {
        try {
            log('BATTLE_SYSTEM', 'StartBattle', 'Starting battle', { 
                player1: player1.id, 
                player2: player2.id,
                player1Keys: player1.keys.length,
                player2Keys: player2.keys.length
            });
            
            this.player1 = player1;
            this.player2 = player2;
            this.player1Choice = null;
            this.player2Choice = null;
            this.battleStarted = true;
            
            // Show battle UI
            this.battleUI.style.display = 'block';
            this.battleMessage.textContent = 'Choose your move:';
            
            log('BATTLE_SYSTEM', 'StartBattle', 'Battle UI displayed', { 
                battleStarted: this.battleStarted,
                uiVisible: this.battleUI.style.display
            });
            
            // If player2 is AI, make AI choice after a delay
            if (player2.isAI) {
                log('BATTLE_SYSTEM', 'StartBattle', 'AI player detected, scheduling AI choice', { 
                    aiPlayer: player2.id,
                    delay: 2000 
                });
                setTimeout(() => this.makeAIChoice(), 2000);
            }
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'StartBattle', 'ERROR: Failed to start battle', error);
        }
    }

    makeAIChoice() {
        try {
            if (!this.battleStarted || this.player2Choice) {
                log('BATTLE_SYSTEM', 'MakeAIChoice', 'AI choice skipped', { 
                    battleStarted: this.battleStarted, 
                    player2Choice: this.player2Choice 
                });
                return;
            }
            
            const choices = ['rock', 'paper', 'scissors'];
            this.player2Choice = choices[Math.floor(Math.random() * choices.length)];
            
            log('BATTLE_SYSTEM', 'MakeAIChoice', `AI ${this.player2.id} made choice`, { 
                choice: this.player2Choice,
                player1Choice: this.player1Choice,
                battleReady: this.player1Choice !== null
            });
            
            // If player1 has already made a choice, resolve the battle
            if (this.player1Choice) {
                log('BATTLE_SYSTEM', 'MakeAIChoice', 'Both choices made, resolving battle');
                this.resolveBattle();
            }
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'MakeAIChoice', 'ERROR: Failed to make AI choice', error);
        }
    }

    chooseMove(move) {
        try {
            if (!this.battleStarted || this.player1Choice) {
                log('BATTLE_SYSTEM', 'ChooseMove', 'Move choice skipped', { 
                    battleStarted: this.battleStarted, 
                    player1Choice: this.player1Choice,
                    requestedMove: move
                });
                return;
            }
            
            this.player1Choice = move;
            
            log('BATTLE_SYSTEM', 'ChooseMove', `Player ${this.player1.id} chose move`, { 
                choice: move,
                player2Choice: this.player2Choice,
                battleReady: this.player2Choice !== null
            });
            
            // If AI has already made a choice, resolve the battle
            if (this.player2Choice) {
                log('BATTLE_SYSTEM', 'ChooseMove', 'Both choices made, resolving battle');
                this.resolveBattle();
            } else {
                this.battleMessage.textContent = 'Waiting for opponent...';
                log('BATTLE_SYSTEM', 'ChooseMove', 'Waiting for opponent choice');
            }
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'ChooseMove', 'ERROR: Failed to process move choice', error);
        }
    }

    resolveBattle() {
        try {
            if (!this.player1Choice || !this.player2Choice) {
                log('BATTLE_SYSTEM', 'ResolveBattle', 'Cannot resolve battle - missing choices', { 
                    player1Choice: this.player1Choice, 
                    player2Choice: this.player2Choice 
                });
                return;
            }
            
            log('BATTLE_SYSTEM', 'ResolveBattle', 'Resolving battle', { 
                player1: { id: this.player1.id, choice: this.player1Choice },
                player2: { id: this.player2.id, choice: this.player2Choice }
            });
            
            const winner = this.determineWinner(this.player1Choice, this.player2Choice);
            const loser = winner === this.player1 ? this.player2 : this.player1;
            
            log('BATTLE_SYSTEM', 'ResolveBattle', 'Battle result determined', { 
                winner: winner.id, 
                loser: loser.id,
                winnerChoice: winner === this.player1 ? this.player1Choice : this.player2Choice,
                loserChoice: loser === this.player1 ? this.player1Choice : this.player2Choice
            });
            
            // Handle battle outcome
            this.handleBattleOutcome(winner, loser);
            
            // End battle
            setTimeout(() => this.endBattle(), 3000);
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'ResolveBattle', 'ERROR: Failed to resolve battle', error);
        }
    }

    determineWinner(choice1, choice2) {
        try {
            log('BATTLE_SYSTEM', 'DetermineWinner', 'Determining winner', { choice1, choice2 });
            
            if (choice1 === choice2) {
                log('BATTLE_SYSTEM', 'DetermineWinner', 'Battle is a tie', { choice1, choice2 });
                return null; // Tie
            }
            
            const winner = GAME_CONSTANTS.WINNING_COMBINATIONS[choice1] === choice2 ? choice1 : choice2;
            const winnerPlayer = GAME_CONSTANTS.WINNING_COMBINATIONS[choice1] === choice2 ? this.player1 : this.player2;
            
            log('BATTLE_SYSTEM', 'DetermineWinner', 'Winner determined', { 
                choice1, 
                choice2, 
                winner: winner,
                winnerPlayer: winnerPlayer.id,
                winningCombination: GAME_CONSTANTS.WINNING_COMBINATIONS[choice1] === choice2 ? `${choice1} beats ${choice2}` : `${choice2} beats ${choice1}`
            });
            
            return winnerPlayer;
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'DetermineWinner', 'ERROR: Failed to determine winner', error);
            return null;
        }
    }

    handleBattleOutcome(winner, loser) {
        try {
            log('BATTLE_SYSTEM', 'HandleBattleOutcome', 'Handling battle outcome', { 
                winner: winner.id, 
                loser: loser.id,
                winnerKeys: winner.keys.length,
                loserKeys: loser.keys.length
            });
            
            if (loser.keys.length === 1) {
                // Loser is eliminated
                log('BATTLE_SYSTEM', 'HandleBattleOutcome', `Player ${loser.id} eliminated - only 1 key remaining`);
                this.battleMessage.textContent = `${loser.id} is eliminated!`;
                loser.destroy();
                gameState.players.delete(loser.id);
                
            } else {
                // Winner steals a key
                log('BATTLE_SYSTEM', 'HandleBattleOutcome', `Winner ${winner.id} stealing key from ${loser.id}`);
                this.battleMessage.textContent = `${winner.id} steals a key from ${loser.id}!`;
                
                const stolenKey = loser.stealRandomKey();
                if (stolenKey) {
                    winner.addKey(stolenKey);
                    log('BATTLE_SYSTEM', 'HandleBattleOutcome', `Key stolen successfully`, { 
                        stolenKey, 
                        winnerNewKeys: winner.keys.length,
                        loserRemainingKeys: loser.keys.length
                    });
                    
                    // Offer key swap if winner has multiple keys
                    if (winner.keys.length > 1) {
                        log('BATTLE_SYSTEM', 'HandleBattleOutcome', 'Offering key swap to winner');
                        setTimeout(() => this.offerKeySwap(winner, loser), 1000);
                    }
                } else {
                    log('BATTLE_SYSTEM', 'HandleBattleOutcome', 'No key stolen - loser has no keys');
                }
            }
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'HandleBattleOutcome', 'ERROR: Failed to handle battle outcome', error);
        }
    }

    offerKeySwap(winner, loser) {
        try {
            log('BATTLE_SYSTEM', 'OfferKeySwap', 'Offering key swap', { 
                winner: winner.id, 
                loser: loser.id,
                winnerKeys: winner.keys.length
            });
            
            // Winner gives one of their keys to loser
            if (winner.keys.length > 1) {
                const keyToGive = winner.keys[Math.floor(Math.random() * winner.keys.length)];
                winner.removeKey(keyToGive);
                loser.addKey(keyToGive);
                
                log('BATTLE_SYSTEM', 'OfferKeySwap', 'Key swap completed', { 
                    keyGiven: keyToGive,
                    winnerFinalKeys: winner.keys.length,
                    loserFinalKeys: loser.keys.length
                });
                
                this.battleMessage.textContent = `${winner.id} gives ${keyToGive} key to ${loser.id}!`;
            }
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'OfferKeySwap', 'ERROR: Failed to offer key swap', error);
        }
    }

    endBattle() {
        try {
            log('BATTLE_SYSTEM', 'EndBattle', 'Ending battle');
            
            // Hide battle UI
            this.battleUI.style.display = 'none';
            
            // Reset battle state
            this.player1 = null;
            this.player2 = null;
            this.player1Choice = null;
            this.player2Choice = null;
            this.battleStarted = false;
            
            // Reset game state
            gameState.battleInProgress = false;
            
            log('BATTLE_SYSTEM', 'EndBattle', 'Battle ended successfully', { 
                battleStarted: this.battleStarted,
                battleInProgress: gameState.battleInProgress,
                uiVisible: this.battleUI.style.display
            });
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'EndBattle', 'ERROR: Failed to end battle', error);
        }
    }

    destroy() {
        try {
            log('BATTLE_SYSTEM', 'Destroy', 'Destroying BattleSystem');
            
            if (this.battleStarted) {
                this.endBattle();
            }
            
            log('BATTLE_SYSTEM', 'Destroy', 'BattleSystem destroyed successfully');
            
        } catch (error) {
            log('BATTLE_SYSTEM', 'Destroy', 'ERROR: Failed to destroy BattleSystem', error);
        }
    }
}