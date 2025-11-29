# Little Red Riding Hood Adventures

Welcome to the enchanting world of "Little Red Riding Hood Adventures"! A grid-based adventure game inspired by the classic fairy tale. Navigate through a mystical forest, collect flowers, and reach Granny's house while avoiding the wolf.

## 🎮 How to Play

- Use **arrow keys** (↑ ↓ ← →) or **WASD keys** to move Little Red Riding Hood
  - `W` = Up, `S` = Down, `A` = Left, `D` = Right
- On mobile/tablet, swipe in the direction you want to move
- Wait for the countdown (3-2-1-GO!) before the game starts
- Collect all flowers scattered throughout the forest
- **Collect special items** (bombs) that spawn on the board after gameplay starts
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
- **Titillium Web** - Primary typography font
- **Bangers** - Display font for game messages

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Header.tsx              # Main header component (inventory, quest progress, settings)
│   │   ├── HeaderInventory.tsx     # Compact inventory display in header
│   │   ├── SettingsIcon.tsx        # SVG gear icon component
│   │   ├── SettingsMenu.tsx        # Settings dropdown menu
│   │   ├── QuestProgress.tsx       # Quest progress bar component
│   │   ├── GameControls.tsx        # Legacy game controls component
│   │   ├── Inventory.tsx           # Legacy inventory component
│   │   └── QuestInfo.tsx           # Legacy quest info component
│   ├── Countdown.tsx               # Countdown start screen (GET READY!)
│   ├── GameOver.tsx                # Game over modal
│   ├── LevelComplete.tsx           # Level complete overlay
│   └── TemporaryMessage.tsx        # Temporary messages (hit/miss feedback)
├── constants/
│   └── gameConfig.ts               # Game configuration constants
├── hooks/
│   ├── useGameState.ts             # Game state management
│   ├── useAudio.ts                 # Audio playback management
│   ├── useInput.ts                 # Keyboard (arrow keys + WASD + Space) and touch input
│   └── useDebounce.ts              # Debounce utility
├── types/
│   └── game.ts                     # TypeScript type definitions
├── utils/
│   ├── gridUtils.ts                # Grid and position utilities
│   ├── pathfinding.ts              # A* pathfinding algorithm
│   ├── gameGeneration.ts           # Level generation logic
│   ├── levelValidation.ts          # Level validation and stuck detection
│   ├── itemUtils.ts                # Special item utilities (positioning, radius checks)
│   ├── questMessages.ts            # Quest message generation for Granny tooltips
│   ├── classNames.ts               # Utility for conditional CSS class names
│   └── index.ts                    # Utility exports
├── App.tsx                         # Main application component
├── ForestGrid.tsx                  # Game grid component
├── Tile.tsx                        # Individual tile component
└── styles.css                      # Global styles with CSS custom properties
```

## 🎵 Features

- 🎨 **Beautiful forest-themed graphics** with animated sprites
- 🎵 **Immersive audio** - Background music and contextual sound effects
- 📱 **Fully responsive design** for desktop and mobile devices
- 🤖 **Intelligent AI** - A\* pathfinding algorithm for the wolf enemy
- 📋 **Quest system** with real-time progress tracking
- 🎮 **Countdown start screen** - "GET READY!" animation (3-2-1-GO!)
- 🎯 **Level validation** - Ensures all games are solvable
- 🔄 **Smart level generation** - Retry logic with attempt logging
- 🎭 **Smooth animations** - GPU-accelerated for optimal performance
- 🚫 **Stuck detection** - Prevents unwinnable game states for player and wolf
- 💣 **Special Items System** - Collect and use bombs to stun the wolf
- 📦 **Compact Header Inventory** - 3-slot inventory in the header with visual cooldown
- 🎯 **Quest Progress in Header** - Slim one-liner progress bar showing collected flowers
- ⚙️ **Settings Menu** - Accessible via SVG gear icon in header (top-right)
- 🏠 **Granny's Tooltips** - Dynamic quest messages appear above Granny's house
- 💥 **Explosion Effects** - Visual feedback with screen shake and marks
- 🎯 **Hit/Miss Feedback** - Temporary messages show bomb effectiveness
- ⏱️ **Stun System** - Visual countdown timer above stunned wolf
- 📊 **Level Progression** - Complete levels to advance (infinite levels)

## 🏗️ Architecture

The codebase follows modern React best practices with a modular architecture:

- **Custom Hooks** - Reusable logic for game state, audio, and input handling
- **Utility Functions** - Pure functions for grid operations, pathfinding, and game generation
- **Component Separation** - UI components separated from business logic
- **Type Safety** - Full TypeScript support with centralized type definitions
- **Constants Management** - All game configuration in one place
- **CSS Custom Properties** - Design tokens for colors, spacing, typography, and z-index
- **DRY Principles** - No code duplication, reusable components and utilities
- **Performance Optimized** - GPU-accelerated animations, efficient re-renders

## 📝 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🎯 Game Mechanics

- **Grid-Based Movement** - 20x20 tile-based navigation
- **Collision Detection** - Trees block movement, wolf triggers game over
- **Pathfinding** - Wolf uses A\* algorithm to chase the player intelligently
- **Quest System** - Collect flowers to unlock Granny's house
- **Audio System** - Background music and contextual sound effects with cookie persistence
- **Level Validation** - Flood fill algorithm ensures all objectives are reachable
- **Stuck Detection** - Runtime detection prevents unwinnable game states
- **Countdown Timer** - Game starts with a 3-2-1-GO! countdown animation
- **Special Items** - Bombs spawn randomly after configurable delay (default: 30 seconds)
- **Inventory System** - Compact header-based inventory with 3 fixed slots
- **Bomb Mechanics** - Stun the wolf within a 3-tile radius for 10 seconds
- **Cooldown System** - 10-second cooldown between bomb uses with visual progress bar
- **Level Progression** - Complete levels to advance (currently infinite levels)
- **Explosion Marks** - Visual marks on tiles where bombs were used (fade after 3 seconds)

## 🎨 UI/UX Features

### Header

- **Fixed Position Header** - Always visible at the top of the screen
  - Desktop height: 34px
  - Mobile height: 44px
- **Left Section** - Compact inventory with 3 slots
  - Shows collected items (bomb, health, speed - future items)
  - Item count badges
  - Cooldown progress bars for active items
- **Center Section** - Quest progress bar
  - Shows collected flowers count (e.g., "💐 15/30")
  - Visual progress bar with gradient
  - Gold animation when complete
- **Right Section** - Settings button
  - SVG gear icon (no emoji)
  - Opens dropdown settings menu

### Settings Menu

- **Dropdown Menu** - Opens below the header when settings icon is clicked
- **Volume Control** - Slider with percentage display
- **Sound Toggle** - Mute/unmute background music
- **Restart Game** - Resets the game and closes the menu
- **Click Outside** - Menu closes when clicking outside

### Quest System

- **Granny's Tooltips** - Dynamic messages appear above Granny's house
  - Start message: "My sweet RedHood! 💐 Gather 30 flowers for me."
  - Halfway message: "Halfway there! 🌺"
  - All collected: "Perfect! 🌸 Hurry here!"
  - Entered house: "Oh my dear! 🧓 You made it safely!"
- **Tooltip Display** - Messages fade in/out over 3 seconds at milestones
- **Smart Timing** - Messages persist even if game state changes during display

### Game Board

- **1:1 Aspect Ratio** - Always maintains square game board
- **Responsive Sizing** - Adapts to viewport while keeping square shape
- **Centered Layout** - Game board centered on screen with proper spacing

### Visual Feedback

- **Countdown Screen** - Animated "GET READY!" with 3-2-1-GO! countdown
- **Level Complete Overlay** - "LEVEL X COMPLETED" message centered on board
- **Game Over Modal** - Clean overlay design without background box
- **Temporary Messages** - "WOLF STUNNED!" (white) or "MISSED!" (gold) feedback
- **Stun Timer** - Countdown above wolf when stunned (no background, text-only)
- **Explosion Effects** - Screen shake and visual blast animation
- **Explosion Marks** - Dark marks on tiles where bombs exploded (fade out over 3 seconds)

### Typography

- **Titillium Web** - Primary font for UI elements
- **Bangers** - Display font for game messages (countdown, level complete, game over, etc.)
- **Letter Spacing** - Enhanced readability with increased letter spacing on display text

## 💣 Special Items & Inventory System

The game features a special items system that adds strategic depth to gameplay. Currently, bombs are the primary special item available.

### Item Spawning

- **Spawn Delay**: Special items (bombs) begin spawning after **30 seconds** of gameplay
  - Timer starts when countdown completes (not during countdown)
- **Continuous Spawning**: After the initial delay, new items spawn every **30 seconds** (configurable)
- **Random Placement**: Items are placed randomly on valid tiles (avoiding obstacles and entities)
- **Multiple Items**: You can collect multiple bombs - they stack in your inventory
- **Max on Map**: Maximum of 3 bombs can exist on the map at the same time

### Collecting Items

- Simply walk over a special item icon on the game board to collect it
- Collected items are automatically added to your inventory
- Collection sound effect plays when picking up a bomb
- Inventory appears in the header (left section) with 3 fixed slots

### Using Bombs

Bombs are powerful items that can stun the wolf, giving you precious time to collect flowers or escape.

**How to Use:**

- **Click/Tap**: Click or tap the bomb icon in the header inventory
- **Keyboard**: Press the **Space bar** to use a bomb

**Bomb Effects:**

- **Explosion Radius**: 3 tiles in all directions from your position
- **Stun Duration**: If the wolf is within the explosion radius, it's stunned for 10 seconds
- **Visual Effects**:
  - Radial explosion animation at your position
  - Screen shake effect
  - Random explosion sound effect (3 variations)
  - Dark explosion mark on the tile (fades after 3 seconds)
- **Stun Timer**: A countdown timer appears above the wolf showing remaining stun time

**Cooldown System:**

- After using a bomb, there's a **10-second cooldown** before you can use another
- A progress bar under the bomb icon in the inventory shows the cooldown progress
- The bomb button is disabled during cooldown

### Feedback Messages

When you use a bomb, temporary messages appear in the center of the screen:

- **"WOLF STUNNED!"** (white text with glow) - Shown when the wolf is successfully stunned
- **"MISSED!"** (gold text with glow) - Shown when the wolf is outside the explosion radius

### Configuration

All special item settings can be adjusted in `src/constants/gameConfig.ts`:

- `ITEM_SPAWN_DELAY` - Time before first item spawns (default: 30000ms / 30 seconds)
- `MAX_BOMBS_ON_MAP` - Maximum bombs on map simultaneously (default: 3)
- `BOMB_STUN_DURATION` - How long the wolf stays stunned (default: 10000ms / 10 seconds)
- `BOMB_EXPLOSION_RADIUS` - Blast radius in tiles (default: 3 tiles)
- `BOMB_EXPLOSION_DURATION` - Visual effect duration (default: 1000ms / 1 second)
- `BOMB_COOLDOWN_DURATION` - Cooldown between uses (default: 10000ms / 10 seconds)
- `EXPLOSION_MARK_DURATION` - How long explosion marks remain visible (default: 3000ms / 3 seconds)

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
- Console logging provides visibility into pathfinding failures

## 📄 License

This project is licensed under the MIT License.

---

Enjoy your adventure! 🧺✨
