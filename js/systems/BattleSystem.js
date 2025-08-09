class BattleSystem {
    constructor(scene) {
        this.scene = scene;
        this.player1 = null;
        this.player2 = null;
        this.battleUI = document.getElementById('battle-ui');
        this.battleMessage = document.getElementById('battle-message');
        this.player1Choice = null;
        this.player2Choice = null;
        this.battleComplete = false;
    }

    startBattle(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1Choice = null;
        this.player2Choice = null;
        this.battleComplete = false;
        
        // Show battle UI
        this.battleUI.style.display = 'block';
        this.battleMessage.textContent = `Battle against ${player2.id}! Choose your move:`;
        
        // Stop player movement
        this.player1.sprite.setVelocity(0, 0);
        this.player2.sprite.setVelocity(0, 0);
        
        // AI makes choice after a delay
        if (this.player2.isAI) {
            setTimeout(() => {
                this.makeAIChoice();
            }, 1000 + Math.random() * 2000);
        }
        
        console.log(`Battle started between ${player1.id} and ${player2.id}`);
    }

    makeAIChoice() {
        if (this.battleComplete) return;
        
        const choices = ['rock', 'paper', 'scissors'];
        this.player2Choice = choices[Math.floor(Math.random() * choices.length)];
        console.log(`AI ${this.player2.id} chose: ${this.player2Choice}`);
        
        // If player1 has already made a choice, resolve the battle
        if (this.player1Choice) {
            this.resolveBattle();
        }
    }

    chooseMove(move) {
        if (this.battleComplete || this.player1Choice) return;
        
        this.player1Choice = move;
        console.log(`Player ${this.player1.id} chose: ${move}`);
        
        // If AI has already made a choice, resolve the battle
        if (this.player2Choice) {
            this.resolveBattle();
        } else {
            this.battleMessage.textContent = 'Waiting for opponent...';
        }
    }

    resolveBattle() {
        if (this.battleComplete) return;
        
        this.battleComplete = true;
        
        const result = this.determineWinner(this.player1Choice, this.player2Choice);
        let message = '';
        
        if (result === 'player1') {
            message = `You won! ${this.player1Choice} beats ${this.player2Choice}`;
            this.handleBattleOutcome(this.player1, this.player2);
        } else if (result === 'player2') {
            message = `You lost! ${this.player2Choice} beats ${this.player1Choice}`;
            this.handleBattleOutcome(this.player2, this.player1);
        } else {
            message = `It's a tie! Both chose ${this.player1Choice}`;
        }
        
        this.battleMessage.textContent = message;
        
        // Hide battle UI after a delay
        setTimeout(() => {
            this.endBattle();
        }, 3000);
    }

    determineWinner(choice1, choice2) {
        if (choice1 === choice2) return 'tie';
        
        if ((choice1 === 'rock' && choice2 === 'scissors') ||
            (choice1 === 'paper' && choice2 === 'rock') ||
            (choice1 === 'scissors' && choice2 === 'paper')) {
            return 'player1';
        } else {
            return 'player2';
        }
    }

    handleBattleOutcome(winner, loser) {
        if (loser.keys.length === 1) {
            // Loser is eliminated
            console.log(`Player ${loser.id} eliminated!`);
            loser.destroy();
            gameState.players.delete(loser.id);
            
            // Remove from scene
            if (loser.isAI) {
                const index = this.scene.otherPlayers.indexOf(loser);
                if (index !== -1) {
                    this.scene.otherPlayers.splice(index, 1);
                }
            }
        } else {
            // Winner steals a random key
            const stolenKey = loser.stealRandomKey();
            if (stolenKey) {
                winner.addKey(stolenKey);
                console.log(`Player ${winner.id} stole ${stolenKey} key from ${loser.id}`);
                
                // Winner can optionally swap one of their keys
                if (winner.keys.length > 1) {
                    setTimeout(() => {
                        this.offerKeySwap(winner, loser);
                    }, 1000);
                }
            }
        }
    }

    offerKeySwap(winner, loser) {
        if (winner.keys.length <= 1) return;
        
        const randomKey = winner.stealRandomKey();
        if (randomKey) {
            // Give the stolen key back to the loser
            loser.addKey(randomKey);
            console.log(`Player ${winner.id} swapped ${randomKey} key back to ${loser.id}`);
        }
    }

    endBattle() {
        // Hide battle UI
        this.battleUI.style.display = 'none';
        
        // Reset battle state
        gameState.battleInProgress = false;
        this.player1 = null;
        this.player2 = null;
        this.player1Choice = null;
        this.player2Choice = null;
        this.battleComplete = false;
        
        console.log('Battle ended');
    }

    destroy() {
        this.endBattle();
    }
}