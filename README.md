# Little Red Riding Hood Adventures

Welcome to the enchanting world of "Little Red Riding Hood Adventures"! A grid-based adventure game inspired by the classic fairy tale. Navigate through a mystical forest, collect flowers, and reach Granny's house while avoiding the wolf.

## 🎮 How to Play

- Use **arrow keys** (↑ ↓ ← →) or **WASD keys** to move Little Red Riding Hood
  - `W` = Up, `S` = Down, `A` = Left, `D` = Right
- On mobile/tablet, swipe in the direction you want to move
- Wait for the countdown (3-2-1-GO!) before the game starts
- Collect all flowers scattered throughout the forest
- **Collect special items** (bombs) that spawn on the board after 30 seconds
- **Use bombs** to stun the wolf for 10 seconds (within 3-tile radius)
  - Click/tap the bomb in your inventory, or press **Space bar**
  - Bombs have a 10-second cooldown before you can use another
- Avoid the wolf - if it catches you, it's game over!
- Once all flowers are collected, Granny's house will open
- Reach Granny's house to complete the level

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/kraffcho/Little-Red-Riding-Hood-Adventures.git
cd Little-Red-Riding-Hood-Adventures
npm install
```

### Running the Game

```bash
npm start
```

The game will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The optimized build will be in the `build` folder.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Create React App** - Build tooling
- **CSS3** - Styling and animations with custom properties
- **Titillium Web** - Typography font

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── GameControls.tsx     # Game controls (sound, volume, restart)
│   │   ├── QuestInfo.tsx        # Quest information display
│   │   ├── QuestProgress.tsx    # Quest progress bar component
│   │   ├── SettingsMenu.tsx     # Settings dropdown menu
│   │   └── Inventory.tsx        # Inventory display with cooldown indicators
│   ├── Countdown.tsx            # Countdown start screen (GET READY!)
│   ├── GameOver.tsx             # Game over modal
│   ├── LevelComplete.tsx        # Level complete overlay
│   └── TemporaryMessage.tsx     # Temporary messages (hit/miss feedback)
├── constants/
│   └── gameConfig.ts            # Game configuration constants
├── hooks/
│   ├── useGameState.ts          # Game state management
│   ├── useAudio.ts              # Audio playback management
│   ├── useInput.ts              # Keyboard (arrow keys + WASD + Space) and touch input
│   └── useDebounce.ts           # Debounce utility
├── types/
│   └── game.ts                  # TypeScript type definitions
├── utils/
│   ├── gridUtils.ts             # Grid and position utilities
│   ├── pathfinding.ts           # A* pathfinding algorithm
│   ├── gameGeneration.ts        # Level generation logic
│   ├── levelValidation.ts       # Level validation and stuck detection
│   └── itemUtils.ts             # Special item utilities (positioning, radius checks)
├── App.tsx                      # Main application component
├── ForestGrid.tsx               # Game grid component
├── Tile.tsx                     # Individual tile component
└── styles.css                   # Global styles with CSS custom properties
```

## 🎵 Features

- 🎨 Beautiful forest-themed graphics with animated sprites
- 🎵 Immersive background music and contextual sound effects
- 📱 Fully responsive design for desktop and mobile devices
- 🤖 Intelligent A\* pathfinding AI for the wolf enemy
- 📋 Quest system with real-time progress tracking
- 🎮 Countdown start screen with "GET READY!" animation
- ⚙️ Settings menu with sound controls (top-right wheel icon)
- 🎯 Level validation to ensure all games are solvable
- 🔄 Smart level generation with retry logic
- 📊 Two-column quest info panel at the bottom of screen
- 🎭 Smooth animations with GPU acceleration
- 🚫 Stuck detection and handling for both player and wolf
- 💣 **Special Items System** - Collect and use bombs to stun the wolf
- 📦 **Inventory System** - Track collected items with visual cooldown indicators
- 💥 **Explosion Effects** - Visual and audio feedback for bomb usage
- 🎯 **Hit/Miss Feedback** - Temporary messages show bomb effectiveness
- ⏱️ **Stun System** - Stun timer displays above the wolf when affected

## 🏗️ Architecture

The codebase follows modern React best practices with a modular architecture:

- **Custom Hooks** - Reusable logic for game state, audio, and input handling
- **Utility Functions** - Pure functions for grid operations, pathfinding, and game generation
- **Component Separation** - UI components separated from business logic
- **Type Safety** - Full TypeScript support with centralized type definitions
- **Constants Management** - All game configuration in one place
- **CSS Custom Properties** - Design tokens for colors, spacing, typography
- **DRY Principles** - No code duplication, reusable components and utilities

## 📝 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🎯 Game Mechanics

- **Grid-Based Movement** - 20x20 tile-based navigation
- **Collision Detection** - Trees block movement, wolf triggers game over
- **Pathfinding** - Wolf uses A\* algorithm to chase the player
- **Quest System** - Collect flowers to unlock Granny's house
- **Audio System** - Background music and contextual sound effects
- **Level Validation** - Ensures all generated levels are solvable
- **Stuck Detection** - Prevents unwinnable game states
- **Countdown Timer** - Game starts with a 3-2-1-GO! countdown
- **Special Items** - Bombs spawn randomly after 30 seconds of gameplay (timer starts after countdown completes)
- **Inventory System** - Collect and manage special items with visual feedback
- **Bomb Mechanics** - Stun the wolf within a 3-tile radius for 10 seconds
- **Cooldown System** - 10-second cooldown between bomb uses
- **Level Progression** - Complete levels to advance (currently infinite levels)

## 🎨 UI/UX Features

- **Countdown Screen** - Animated "GET READY!" message with countdown before game starts
- **Settings Menu** - Top-right wheel icon opens dropdown with game controls
- **Quest Panel** - Two-column layout at bottom:
  - Left column: Quest information and instructions
  - Right column: Split into two sub-columns (Collected Flowers progress + Inventory)
- **Responsive Layout** - Adapts to different screen sizes while maintaining 1:1 game board aspect ratio
  - Desktop: Three-column layout (Quest Info | Collected Flowers | Inventory)
  - Mobile: Vertical stacking of all panels
- **Inventory Display** - Shows collected items with count and cooldown progress bars, integrated into quest panel
- **Game Over Modal** - Clean overlay design centered on game board
- **Level Complete Overlay** - Animated "LEVEL X COMPLETED" message when finishing a level
- **Temporary Messages** - "WOLF STUNNED!" (white) or "MISSED!" (gold) feedback for bomb usage
- **Stun Timer** - Visual countdown above the wolf when stunned
- **Explosion Visual Effects** - Screen shake and radial explosion animation

## 💣 Special Items & Inventory System

The game features a special items system that adds strategic depth to gameplay. Currently, bombs are the primary special item available.

### Item Spawning

- **Spawn Delay**: Special items (bombs) begin spawning after **30 seconds** of gameplay (timer starts when countdown completes, not during countdown)
- **Continuous Spawning**: After the initial delay, new items spawn every **30 seconds** (configurable via `ITEM_SPAWN_DELAY`)
- **Random Placement**: Items are placed randomly on valid tiles (avoiding obstacles and entities)
- **Multiple Items**: You can collect multiple bombs - they stack in your inventory

### Collecting Items

- Simply walk over a special item icon on the game board to collect it
- Collected items are automatically added to your inventory
- The inventory panel appears at the bottom of the screen when you have items

### Using Bombs

Bombs are powerful items that can stun the wolf, giving you precious time to collect flowers or escape.

**How to Use:**

- **Click/Tap**: Click or tap the bomb icon in your inventory panel
- **Keyboard**: Press the **Space bar** to use a bomb

**Bomb Effects:**

- **Explosion Radius**: 3 tiles in all directions from your position
- **Stun Duration**: If the wolf is within the explosion radius, it's stunned for 10 seconds
- **Visual Effects**:
  - Radial explosion animation at your position
  - Screen shake effect
  - Random explosion sound effect (3 variations)
- **Stun Timer**: A countdown timer appears above the wolf showing remaining stun time

**Cooldown System:**

- After using a bomb, there's a **10-second cooldown** before you can use another
- A progress bar under the bomb icon in your inventory shows the cooldown progress
- The bomb button is disabled during cooldown

### Feedback Messages

When you use a bomb, temporary messages appear in the center of the screen:

- **"WOLF STUNNED!"** (white text) - Shown when the wolf is successfully stunned
- **"MISSED!"** (gold text) - Shown when the wolf is outside the explosion radius

### Configuration

All special item settings can be adjusted in `src/constants/gameConfig.ts`:

- `ITEM_SPAWN_DELAY` - Time before first item spawns (default: 30000ms / 30 seconds)
- `BOMB_STUN_DURATION` - How long the wolf stays stunned (default: 10000ms / 10 seconds)
- `BOMB_EXPLOSION_RADIUS` - Blast radius in tiles (default: 3 tiles)
- `BOMB_EXPLOSION_DURATION` - Visual effect duration (default: 1000ms / 1 second)
- `BOMB_COOLDOWN_DURATION` - Cooldown between uses (default: 10000ms / 10 seconds)

## 🤖 Pathfinding Algorithm (A\*)

The wolf uses the **A\* (A-star) pathfinding algorithm** to intelligently chase the player through the forest, navigating around trees and obstacles.

### How A\* Works

A\* is a heuristic search algorithm that finds the shortest path from a starting point to a goal. It combines:

- **g(n)** - The actual cost from the start to the current node
- **h(n)** - The estimated cost from the current node to the goal (heuristic)
- **f(n) = g(n) + h(n)** - The total estimated cost of the path

### In This Game

1. **Starting Point**: The wolf's current position
2. **Goal**: The player's position
3. **Obstacles**: Trees that block movement
4. **Heuristic**: Manhattan distance (straight-line distance using only horizontal/vertical movement)

### Algorithm Steps

```
1. Initialize:
   - Open list: Contains nodes to be evaluated (starts with wolf's position)
   - Closed list: Contains nodes already evaluated

2. For each iteration:
   a) Select the node with the lowest f value from the open list
   b) Move it to the closed list
   c) Check all adjacent tiles (up, down, left, right)
   d) For each valid adjacent tile:
      - Calculate g (current path cost + 1)
      - Calculate h (Manhattan distance to player)
      - If tile is new, add to open list
      - If tile exists with worse path, update it

3. Stop when:
   - Goal (player) is reached, OR
   - No path exists (open list is empty)

4. Reconstruct path from goal back to start
5. Return the first step the wolf should take
```

### Why A\*?

- **Optimal**: Always finds the shortest path (when using an admissible heuristic)
- **Efficient**: Only explores promising paths, avoiding unnecessary calculations
- **Intelligent**: Uses heuristics to make informed decisions about which path to explore next

### Implementation Details

- The wolf recalculates its path every 500ms (configurable via `ENEMY_DELAY`)
- Manhattan distance is used because movement is restricted to 4 directions (no diagonals)
- Trees are treated as impassable obstacles
- If no path exists, the wolf stops moving and the game handles the stuck state
- Level generation ensures both player and wolf can move at game start

## 🐛 Bug Fixes & Improvements

- ✅ Fixed player sprite visibility when entering house
- ✅ Improved level generation with validation and retry logic
- ✅ Enhanced stuck detection for both player and wolf
- ✅ Optimized animations with GPU acceleration
- ✅ Fixed autoplay audio restrictions
- ✅ Improved mobile responsiveness
- ✅ Better error handling and logging
- ✅ Fixed item spawning timer to start after countdown completes (not during countdown)
- ✅ Improved quest panel layout with split columns for Collected Flowers and Inventory
- ✅ Enhanced mobile layout with vertical stacking of all panels

## 📄 License

This project is licensed under the MIT License.

Enjoy your adventure! 🧺✨
