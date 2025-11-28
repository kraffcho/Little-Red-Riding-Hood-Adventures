# Little Red Riding Hood Adventures

Welcome to the enchanting world of "Little Red Riding Hood Adventures"! A grid-based adventure game inspired by the classic fairy tale. Navigate through a mystical forest, collect flowers, and reach Granny's house while avoiding the wolf.

## 🎮 How to Play

- Use **arrow keys** (↑ ↓ ← →) or **WASD keys** to move Little Red Riding Hood
  - `W` = Up, `S` = Down, `A` = Left, `D` = Right
- On mobile/tablet, swipe in the direction you want to move
- Wait for the countdown (3-2-1-GO!) before the game starts
- Collect all flowers scattered throughout the forest
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
│   │   └── SettingsMenu.tsx     # Settings dropdown menu
│   ├── Countdown.tsx            # Countdown start screen (GET READY!)
│   └── GameOver.tsx             # Game over modal
├── constants/
│   └── gameConfig.ts            # Game configuration constants
├── hooks/
│   ├── useGameState.ts          # Game state management
│   ├── useAudio.ts              # Audio playback management
│   ├── useInput.ts              # Keyboard (arrow keys + WASD) and touch input
│   └── useDebounce.ts           # Debounce utility
├── types/
│   └── game.ts                  # TypeScript type definitions
├── utils/
│   ├── gridUtils.ts             # Grid and position utilities
│   ├── pathfinding.ts           # A* pathfinding algorithm
│   ├── gameGeneration.ts        # Level generation logic
│   └── levelValidation.ts       # Level validation and stuck detection
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

## 🎨 UI/UX Features

- **Countdown Screen** - Animated "GET READY!" message with countdown before game starts
- **Settings Menu** - Top-right wheel icon opens dropdown with game controls
- **Quest Panel** - Two-column layout at bottom showing quest info and progress bar
- **Game Over Modal** - Clean overlay design centered on game board
- **Responsive Layout** - Adapts to different screen sizes while maintaining 1:1 game board aspect ratio

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

## 📄 License

This project is licensed under the MIT License.

Enjoy your adventure! 🧺✨
