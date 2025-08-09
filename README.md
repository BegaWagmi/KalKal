# 🎮 RockPaperScissors - Convergence Trials

A strategic multiplayer browser game combining maze navigation, resource management, and Rock Paper Scissors battles. Navigate hidden-key mazes, collect RPS keys, unlock doors, and battle other players to reach the final three-key door and win!

## 🎯 Game Overview

**Convergence Trials** is a 2D multiplayer browser game where players:
- Navigate procedurally-generated mazes
- Collect hidden Rock, Paper, and Scissors keys
- Unlock doors using the right key combinations  
- Battle other players in proximity-triggered RPS mini-games
- Race to reach the final three-key door to win

### Key Features
- **Hidden Information Design**: Keys and door symbols are concealed until revealed
- **Anti-Bot Mechanics**: Dynamic elements prevent automated solutions
- **Client-Side Prediction**: Responsive 60 FPS gameplay with lag compensation
- **Strategic Depth**: Key management, timing, and psychological warfare
- **Beautiful UI**: Cyber-mystical theme with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS (for TypeScript version)
- npm 9+ (for TypeScript version)
- Modern web browser with WebGL support
- Local web server (for JavaScript version)

### Installation & Setup

#### Option 1: TypeScript Version (Recommended)
1. **Clone and Install Dependencies**
```bash
cd client
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Open Game**
- Open browser to `http://localhost:3000`
- Game runs in **MOCK MODE** by default (no server needed for testing)

#### Option 2: JavaScript Version
1. **Clone or download the project**
2. **Serve the files using a local web server:**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Open `http://localhost:8000` in your browser**

### Build for Production (TypeScript Version)
```bash
# Full production build with optimizations
npm run optimize

# Or step by step:
npm run type-check    # TypeScript validation
npm run lint         # Code quality check
npm run build:prod   # Production build
npm run preview:prod # Preview production build
```

## 🎮 How to Play

### Basic Controls
- **Movement**: WASD keys or Arrow keys
- **Interact**: Spacebar (for doors)
- **RPS Battles**: Mouse clicks or number keys (1=Rock, 2=Paper, 3=Scissors)
- **Pause/Menu**: ESC key

### Game Flow
1. **Start**: Each player spawns with 1 random hidden key
2. **Explore**: Navigate maze to find more keys (max 3 at a time)
3. **Unlock**: Use keys to open doors (Rock > Scissors > Paper > Rock)
4. **Battle**: Stay near other players for 3 seconds to trigger RPS battle
5. **Win**: Reach the final door requiring Rock + Paper + Scissors keys

### Battle System
- **Proximity Trigger**: Players within 2 tiles for 3 seconds
- **RPS Mini-Game**: Standard Rock Paper Scissors rules
- **Stakes**: 
  - Winner with 1 key → Loser eliminated
  - Winner with 2-3 keys → Winner steals random key
- **Cooldown**: 10-second battle cooldown prevents spam

## 🏗️ Architecture

### Frontend Stack
- **Engine**: Phaser.js 3.70+ (WebGL/Canvas)
- **Language**: TypeScript 5.0+ (client) / Vanilla JavaScript (root)
- **Build**: Vite 4.0+ (client) / Direct HTML (root)
- **State**: Redux Toolkit (client) / Global state (root)
- **Network**: Socket.io-client (client) / Placeholder (root)

### Key Systems
- **NetworkSystem**: WebSocket communication with client prediction
- **Player Entity**: Movement, inventory, network sync, visual effects
- **GameScene**: Main gameplay with physics, collisions, UI
- **BattleScene**: RPS mini-game overlay
- **MenuScene**: Matchmaking and game navigation

### Technical Features
- **Client-Side Prediction**: Immediate input response
- **Server Reconciliation**: Rollback and replay for consistency
- **Spatial Partitioning**: Efficient proximity detection
- **Procedural Maze Generation**: Random walls and obstacles
- **Physics System**: Collision detection with walls and objects
- **AI Players**: Simple AI opponents for testing
- **Anti-Bot Design**: Hidden keys, changing door requirements
- **Responsive UI**: Real-time game status and player info

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

**Built with ❤️ using Phaser.js, TypeScript, and modern web technologies**

**Enjoy playing RockPaperScissors!** 🎮✂️📄🪨
