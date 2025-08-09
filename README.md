# RockPaperScissors - Multiplayer Maze Game

A 2D multiplayer browser game built with PhaserJS where players navigate a maze, collect hidden keys, and battle opponents in Rock-Paper-Scissors encounters.

## 🎯 Game Objective

Navigate through the maze, collect Rock/Paper/Scissors keys, unlock doors, and reach the final three-key door to win. Keys and door symbols are hidden until revealed, preventing bot exploitation.

## 🎮 How to Play

### Controls
- **Arrow Keys** or **WASD**: Move your character
- **Mouse**: Click buttons during battles

### Gameplay
1. **Start**: You begin with 1 random hidden key
2. **Collect Keys**: Gather keys scattered throughout the maze (max 3)
3. **Unlock Doors**: Use keys that beat door symbols (Rock > Scissors > Paper > Rock)
4. **Battle Opponents**: Get close to other players to trigger RPS battles
5. **Win**: Reach the final door requiring all three key types

### Battle System
- **Proximity Trigger**: Stay within range of another player for 3 seconds
- **RPS Mini-Game**: Choose Rock, Paper, or Scissors
- **Outcomes**:
  - Loser with 1 key → Eliminated
  - Loser with 2-3 keys → Winner steals one key
  - Winner can optionally swap keys

## 🏗️ Technical Implementation

### Technology Stack
- **PhaserJS 3.70.0**: 2D game framework
- **HTML5 Canvas**: Rendering
- **Vanilla JavaScript**: Game logic
- **CSS3**: UI styling

### Architecture
- **MainScene**: Core game loop, maze generation, player management
- **Player**: Movement, key collection, door interaction
- **Door**: Locking/unlocking, requirement randomization
- **Key**: Collection mechanics, visual effects
- **BattleSystem**: RPS battle logic, outcomes
- **NetworkManager**: Placeholder for future multiplayer

### Key Features
- **Procedural Maze Generation**: Random walls and obstacles
- **Physics System**: Collision detection with walls and objects
- **AI Players**: Simple AI opponents for testing
- **Anti-Bot Design**: Hidden keys, changing door requirements
- **Responsive UI**: Real-time game status and player info

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (for development)

### Installation
1. Clone or download the project
2. Serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

### Development
- Open browser console for debug commands
- Use `gameDebug.showKeys()` to see current keys
- Use `gameDebug.addKey('rock')` to add keys for testing

## 🎨 Game Design

### Core Loop
1. **Exploration**: Navigate maze, avoid obstacles
2. **Collection**: Gather keys strategically
3. **Progression**: Unlock doors with correct keys
4. **Competition**: Battle opponents for keys
5. **Victory**: Reach final door with all key types

### Balancing Features
- **Key Limit**: Maximum 3 keys prevents hoarding
- **Door Randomization**: Requirements change after opening
- **Battle Consequences**: Risk vs. reward in encounters
- **Proximity Timing**: 3-second delay prevents instant battles

### Anti-Cheat Measures
- **Hidden Information**: Keys and door types are concealed
- **Dynamic Requirements**: Door needs change randomly
- **Reaction-Based Battles**: Quick decision-making required
- **Proximity Detection**: Physical positioning matters

## 🔮 Future Enhancements

### Phase 5 Features
- **Power-ups**: Speed boosts, key magnets, shield
- **Special Doors**: Timed doors, teleporters, one-way passages
- **Fog of War**: Limited visibility for strategic gameplay
- **Timed Rounds**: Competitive time-based scoring
- **Sound Effects**: Audio feedback for actions
- **Particle Effects**: Visual polish for door openings

### Multiplayer Expansion
- **Real-time Networking**: WebSocket-based multiplayer
- **Room System**: Join/create game rooms
- **Player Lobbies**: Matchmaking and waiting areas
- **Cross-Platform**: Mobile and desktop compatibility

## 🐛 Known Issues

- AI players may get stuck on walls occasionally
- Battle UI positioning may vary on different screen sizes
- Some visual glitches during rapid key collection

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Enhanced AI behavior
- Better maze generation algorithms
- Improved visual assets
- Sound and music integration
- Multiplayer networking implementation

---

**Enjoy playing RockPaperScissors!** 🎮✂️📄🪨
