# Little Red Riding Hood Adventures

Welcome to the enchanting world of "Little Red Riding Hood Adventures"! A grid-based adventure game inspired by the classic fairy tale. Navigate through a mystical forest, collect flowers, and reach Granny's house while avoiding the wolf.

## 🎮 How to Play

- Use arrow keys (↑ ↓ ← →) to move Little Red Riding Hood
- On mobile/tablet, swipe in the direction you want to move
- Collect all 30 flowers scattered throughout the forest
- Avoid the wolf - if it catches you, it's game over!
- Once all flowers are collected, Granny's house will open
- Reach Granny's house to complete the level

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
git clone <repository-url>
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
- **CSS3** - Styling and animations

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── QuestPanel.tsx       # Quest panel component
│   │   └── GameControls.tsx     # Game controls component
│   └── GameOver.tsx             # Game over modal
├── constants/
│   └── gameConfig.ts            # Game configuration constants
├── hooks/
│   ├── useGameState.ts          # Game state management
│   ├── useAudio.ts              # Audio playback management
│   ├── useInput.ts              # Keyboard and touch input
│   └── useDebounce.ts           # Debounce utility
├── types/
│   └── game.ts                  # TypeScript type definitions
├── utils/
│   ├── gridUtils.ts             # Grid and position utilities
│   ├── pathfinding.ts           # A* pathfinding algorithm
│   └── gameGeneration.ts        # Level generation logic
├── App.tsx                      # Main application component
├── ForestGrid.tsx               # Game grid component
├── Tile.tsx                     # Individual tile component
└── styles.css                   # Global styles
```

## 🎵 Features

- 🎨 Beautiful forest-themed graphics
- 🎵 Immersive background music and sound effects
- 📱 Responsive design for desktop and mobile
- 🤖 A\* pathfinding AI for the wolf enemy
- 📋 Quest system with progress tracking
- 🎮 Game over and restart functionality

## 🏗️ Architecture

The codebase follows modern React best practices with a modular architecture:

- **Custom Hooks** - Reusable logic for game state, audio, and input handling
- **Utility Functions** - Pure functions for grid operations, pathfinding, and game generation
- **Component Separation** - UI components separated from business logic
- **Type Safety** - Full TypeScript support with centralized type definitions
- **Constants Management** - All game configuration in one place

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
- If no path exists, the wolf stops moving

This creates challenging gameplay where the wolf intelligently pursues the player, making the game more engaging than simple random movement or basic chasing.

Enjoy your adventure! 🧺✨
