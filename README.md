# Little Red Riding Hood Adventures

Welcome to the enchanting world of "Little Red Riding Hood Adventures"! A grid-based adventure game inspired by the classic fairy tale. Navigate through a mystical forest, collect flowers, and reach Granny's house while avoiding the wolf.

## 🎮 How to Play

- Use **arrow keys** (↑ ↓ ← →) or **WASD keys** to move Little Red Riding Hood
  - `W` = Up, `S` = Down, `A` = Left, `D` = Right
- On mobile/tablet, swipe in the direction you want to move
- Press **ESC** or click the pause button (⏸) in the header to pause/unpause the game
- Wait for the countdown (3-2-1-GO!) before the game starts
- Collect all flowers scattered throughout the forest
- **Collect special items** (bombs, Hunter's Cloak) that spawn on the board after gameplay starts
- **Use bombs** to stun the wolf for 5 seconds (within 3-tile radius)
  - Click/tap the bomb in your inventory, or press **Space bar**
  - Bombs have a 5-second cooldown before you can use another
- ⚠️ **Warning**: Each time the wolf wakes up from a stun, it becomes 10% faster (max 5 times)!
- **Use Hunter's Cloak** to become invisible for 10 seconds
  - Click/tap the cloak icon in your inventory
  - The wolf stops moving and becomes confused while you're invisible
  - The wolf is treated as an obstacle during invisibility (can't move through it)
  - Cloak has a 30-second cooldown before reuse
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
- **CSS3** - Modular styling and animations with custom properties
  - **12 organized CSS modules** for better maintainability
  - CSS custom properties (variables) for design tokens
  - GPU-accelerated animations for optimal performance
- **Titillium Web** - Primary typography font
- **Bangers** - Display font for game messages

## 📁 Project Structure

```
src/
├── components/
│   ├── game/
│   │   ├── ForestGrid.tsx          # Game grid component
│   │   └── Tile.tsx                # Individual tile component
│   ├── ui/
│   │   ├── Header.tsx              # Main header component (inventory, quest progress, settings)
│   │   ├── HeaderInventory.tsx     # Compact inventory display in header
│   │   ├── SettingsIcon.tsx        # SVG gear icon component
│   │   ├── SettingsMenu.tsx        # Settings dropdown menu
│   │   ├── PauseIcon.tsx           # SVG pause icon component
│   │   ├── PlayIcon.tsx            # SVG play icon component
│   │   ├── VolumeIcon.tsx          # SVG volume icon component
│   │   ├── RestartIcon.tsx         # SVG restart icon component
│   │   ├── CloseIcon.tsx           # SVG close icon component
│   │   ├── QuestProgress.tsx       # Quest progress bar component
│   │   └── QuestInfo.tsx           # Quest info component
│   ├── Countdown.tsx               # Countdown start screen (GET READY!)
│   ├── GameOver.tsx                # Game over modal
│   ├── LevelComplete.tsx           # Level complete overlay
│   ├── PauseMenu.tsx               # Pause menu overlay with game information
│   └── TemporaryMessage.tsx        # Temporary messages (hit/miss feedback)
├── constants/
│   └── gameConfig.ts               # Game configuration constants
├── hooks/
│   ├── index.ts                    # Centralized hook exports
│   ├── useGameState.ts             # Game state management
│   ├── useAudio.ts                 # Audio playback management
│   ├── useInput.ts                 # Keyboard (arrow keys + WASD + Space) and touch input
│   └── useDebounce.ts              # Debounce utility
├── types/
│   ├── index.ts                    # Centralized type exports
│   └── game.ts                     # TypeScript type definitions
├── utils/
│   ├── index.ts                    # Centralized utility exports
│   ├── gridUtils.ts                # Grid and position utilities
│   ├── pathfinding.ts              # A* pathfinding algorithm
│   ├── gameGeneration.ts           # Level generation logic
│   ├── levelValidation.ts          # Level validation and stuck detection
│   ├── itemUtils.ts                # Special item utilities (positioning, radius checks)
│   ├── questMessages.ts            # Quest message generation for Granny tooltips
│   └── classNames.ts               # Utility for conditional CSS class names
├── styles/
│   ├── variables.css               # CSS custom properties (design tokens)
│   ├── base.css                    # Reset styles, fonts, base body styles
│   ├── layouts.css                 # Layout components (App, game-board-wrapper)
│   ├── animations.css              # All keyframe animations
│   ├── responsive.css              # Responsive media queries
│   └── components/
│       ├── header.css              # Header, inventory, quest progress styles
│       ├── game.css                # Game grid, tiles, sprites, animations
│       ├── tooltip.css             # Granny house tooltip styles
│       ├── quest.css               # Quest panel styles
│       ├── controls.css            # Game controls styles
│       ├── settings.css            # Settings menu styles
│       └── overlays.css            # Overlay styles (countdown, game over, pause, etc.)
├── assets/
│   └── images/                     # Game images (background, sprites)
├── App.tsx                         # Main application component
└── index.tsx                       # Application entry point
```

## 🎵 Features

- 🎨 **Beautiful forest-themed graphics** with animated sprites
- 🎵 **Immersive audio** - Background music and contextual sound effects
- 📱 **Fully responsive design** for desktop and mobile devices with adaptive grid size
- 🤖 **Intelligent AI** - A\* pathfinding algorithm for the wolf enemy
- 📋 **Quest system** with real-time progress tracking
- 🎮 **Countdown start screen** - "GET READY!" animation (3-2-1-GO!)
- 🎯 **Level validation** - Ensures all games are solvable
- 🔄 **Smart level generation** - Retry logic with attempt logging
- 🎭 **Smooth animations** - GPU-accelerated for optimal performance
- 🚫 **Stuck detection** - Prevents unwinnable game states for player and wolf
- 💣 **Special Items System** - Collect and use bombs to stun the wolf
- 🧥 **Hunter's Cloak** - Become invisible to the wolf for strategic gameplay
- ⏸️ **Pause System** - Pause/unpause with ESC key or header button, shows game information menu
- 📦 **Compact Header Inventory** - 3-slot inventory in the header with visual cooldown
- 🎯 **Quest Progress in Header** - Slim one-liner progress bar showing collected flowers
- ⚙️ **Settings Menu** - Accessible via SVG gear icon in header (top-right)
- 🏠 **Granny's Tooltips** - Dynamic quest messages appear above Granny's house
- 💥 **Explosion Effects** - Visual feedback with screen shake and marks
- 🎯 **Hit/Miss Feedback** - Temporary messages show bomb effectiveness
- ⏱️ **Stun System** - Visual countdown timer above stunned wolf
- 🐺 **Wolf Speed Increase** - Wolf becomes faster after each stun (10% speed increase, max 5 times)
- 🔊 **Wolf Howl** - Wolf howls when waking up from stun
- 📊 **Level Progression** - Complete levels to advance (infinite levels)

## 🏗️ Architecture

The codebase follows modern React best practices with a modular, well-organized architecture:

- **Custom Hooks** - Reusable logic for game state, audio, and input handling
  - Centralized exports via `hooks/index.ts`
- **Utility Functions** - Pure functions for grid operations, pathfinding, and game generation
  - Centralized exports via `utils/index.ts`
- **Component Separation** - UI components separated from business logic
  - Game components organized in `components/game/`
  - UI components organized in `components/ui/`
- **Type Safety** - Full TypeScript support with centralized type definitions
  - Centralized exports via `types/index.ts`
- **Constants Management** - All game configuration in one place
- **Modular CSS Architecture** - 12 organized CSS modules for better maintainability
  - Design tokens in `variables.css`
  - Component-specific styles in `components/`
  - Responsive styles separated for clarity
  - All keyframe animations in one file
- **CSS Custom Properties** - Design tokens for colors, spacing, typography, and z-index
- **DRY Principles** - No code duplication, reusable components and utilities
- **Performance Optimized** - GPU-accelerated animations, efficient re-renders
- **Clean Import Paths** - Index files provide cleaner, more maintainable imports

## 📦 Code Organization

The project follows a clean, modular structure that promotes maintainability and scalability:

### CSS Modularization

The CSS has been reorganized from a single 2,500+ line file into **12 organized modules**:

- **`variables.css`** - All CSS custom properties (design tokens: colors, spacing, typography, z-index)
- **`base.css`** - Reset styles, font imports, base body styles
- **`layouts.css`** - Layout components (App container, game board wrapper)
- **`animations.css`** - All keyframe animations (34 animations) in one place
- **`responsive.css`** - Responsive media queries and mobile-specific overrides
- **`components/header.css`** - Header, inventory, quest progress styles
- **`components/game.css`** - Game grid, tiles, sprites, game entities
- **`components/tooltip.css`** - Granny house tooltip styles
- **`components/quest.css`** - Quest panel styles
- **`components/controls.css`** - Game controls styles
- **`components/settings.css`** - Settings menu styles
- **`components/overlays.css`** - Overlay styles (countdown, game over, pause menu, etc.)

**Benefits:**

- ✅ Easier to locate and modify specific styles
- ✅ Better organization and maintainability
- ✅ Reduced cognitive load when working on styles
- ✅ Better performance with webpack's CSS processing

### Component Organization

- **Game Components** (`components/game/`) - Core game logic components
  - `ForestGrid.tsx` - Main game grid rendering
  - `Tile.tsx` - Individual tile component with all game entities
- **UI Components** (`components/ui/`) - Header, inventory, settings, icons
- **Overlay Components** (root of `components/`) - Game state overlays (countdown, game over, pause, etc.)

### Centralized Exports

All imports use centralized index files for cleaner import paths:

- **`hooks/index.ts`** - Single import point for all custom hooks
  ```typescript
  import { useGameState, useAudio, useKeyboardInput } from "./hooks";
  ```
- **`utils/index.ts`** - Single import point for all utility functions
  ```typescript
  import { findPath, isValidPosition, classNames } from "./utils";
  ```
- **`types/index.ts`** - Single import point for all TypeScript types
  ```typescript
  import { GameState, ItemType, Position } from "./types";
  ```

### File Structure Benefits

- ✅ **Cleaner imports**: Fewer import statements, easier to refactor
- ✅ **Better organization**: Related files grouped together by domain
- ✅ **Easier maintenance**: Clear structure, easier to find files
- ✅ **Scalability**: Structure supports growth without becoming unwieldy
- ✅ **Modular CSS**: Easier to maintain and update styles
- ✅ **Type safety**: Centralized type definitions prevent inconsistencies

## 📝 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🎯 Game Mechanics

- **Responsive Grid-Based Movement** - Adaptive grid size based on screen width
  - Mobile (<420px): 15x15 grid with 40 trees
  - Desktop (≥420px): 20x20 grid with 60 trees
  - Grid size is calculated at game initialization and stored in game state
  - All boundary checks and pathfinding respect the responsive grid size
- **Collision Detection** - Trees block movement, wolf triggers game over
- **Pathfinding** - Wolf uses A\* algorithm to chase the player intelligently
- **Dynamic Wolf Speed** - Wolf movement delay adjusts based on stun count (faster after each stun)
- **Quest System** - Collect flowers to unlock Granny's house
- **Audio System** - Background music and contextual sound effects with cookie persistence
- **Level Validation** - Flood fill algorithm ensures all objectives are reachable
- **Stuck Detection** - Runtime detection prevents unwinnable game states
- **Countdown Timer** - Game starts with a 3-2-1-GO! countdown animation
- **Special Items** - Bombs spawn continuously, Hunter's Cloak spawns once per level
- **Inventory System** - Compact header-based inventory with 3 fixed slots
- **Bomb Mechanics** - Stun the wolf within a 3-tile radius for 5 seconds
- **Hunter's Cloak Mechanics** - Become invisible for 10 seconds, making the wolf confused
- **Pause System** - Pause/unpause gameplay with ESC key or header button, shows information menu
- **Cooldown System** - 5-second cooldown between bomb uses with visual progress bar
- **Wolf Speed Increase** - Wolf becomes 10% faster after each stun (cumulative, max 5 times)
- **Wolf Howl Sound** - Wolf howls when waking up from stun, signaling increased speed
- **Dynamic Wolf Speed** - Wolf movement delay decreases with each stun, making it progressively faster
- **Level Progression** - Complete levels to advance (currently infinite levels)
- **Explosion Marks** - Visual marks on tiles where bombs were used (fade after 3 seconds)
- **Responsive Grid System** - Grid size adapts based on viewport width for optimal gameplay

## 📱 Responsive Grid System

The game features an adaptive grid system that adjusts the game board size based on the device's screen width, ensuring optimal gameplay experience across all devices.

**Grid Sizes:**

- **Mobile (<420px)**: 15x15 grid with 40 trees
  - Optimized for smaller screens
  - Reduces complexity for touch-based gameplay
  - Ensures all tiles are visible and accessible
- **Desktop/Tablet (≥420px)**: 20x20 grid with 60 trees
  - Full gameplay experience
  - More strategic depth with larger map
  - Better for mouse/keyboard controls

**Implementation Details:**

- Grid size is calculated at game initialization based on viewport width
- Grid size is stored in game state for consistent boundary checking
- All movement validation respects the responsive grid size
- Pathfinding algorithm uses the correct grid boundaries
- Level generation creates appropriate layouts for each grid size
- Number of trees scales proportionally (40 for 15x15, 60 for 20x20)
- Boundary checks prevent movement outside the visible grid area

**Configuration:**

- `GRID_SIZE_DESKTOP` - Desktop grid size (default: 20)
- `GRID_SIZE_MOBILE` - Mobile grid size (default: 15)
- `NUM_TREES_DESKTOP` - Number of trees on desktop (default: 60)
- `NUM_TREES_MOBILE` - Number of trees on mobile (default: 40)
- `getGridSize()` - Function that returns responsive grid size based on viewport width
- `getNumTrees()` - Function that returns responsive number of trees based on viewport width
- Breakpoint: 420px (viewport width)

## 🎨 UI/UX Features

### Header

- **Fixed Position Header** - Always visible at the top of the screen
  - Desktop height: 34px
  - Mobile height: 44px
- **Left Section** - Compact inventory with 3 slots
  - Shows collected items (bomb, Hunter's Cloak, health, speed - future items)
  - Item count badges (cloak doesn't show count - it's reusable)
  - Cooldown progress bars for active items
- **Center Section** - Quest progress bar
  - Shows "💐 Collect Flowers" label on left
  - Shows collected flowers count on right (e.g., "15/30")
  - Visual progress bar with gradient below
  - Gold animation when complete
- **Right Section** - Pause and Settings buttons
  - **Pause Button** - Shows pause (⏸) or play (▶) icon based on game state
  - **Settings Button** - SVG gear icon (no emoji)
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
- **Adaptive Grid Size** - Grid dimensions automatically adjust based on screen width
  - Mobile devices (<420px): 15x15 grid for optimal gameplay on smaller screens
  - Desktop/Tablet (≥420px): 20x20 grid for full gameplay experience
- **Centered Layout** - Game board centered on screen with proper spacing

### Visual Feedback

- **Countdown Screen** - Animated "GET READY!" with 3-2-1-GO! countdown
- **Level Complete Overlay** - "LEVEL X COMPLETED" message centered on board
- **Game Over Modal** - Clean overlay design without background box
- **Temporary Messages** - "WOLF STUNNED!" (white) or "MISSED!" (gold) for bombs, "🧥 INVISIBLE!" for cloak activation, "🧥 HUNTER'S CLOAK APPEARED!" / "🧥 HUNTER'S CLOAK COLLECTED!" for cloak events
- **Stun Timer** - Countdown above wolf when stunned (no background, text-only)
- **Explosion Effects** - Screen shake and visual blast animation
- **Explosion Marks** - Dark marks on tiles where bombs exploded (fade out over 3 seconds)

### Typography

- **Titillium Web** - Primary font for UI elements
- **Bangers** - Display font for game messages (countdown, level complete, game over, etc.)
- **Letter Spacing** - Enhanced readability with increased letter spacing on display text

## 💣 Special Items & Inventory System

The game features a special items system that adds strategic depth to gameplay. Two types of special items are available: bombs and the Hunter's Cloak.

### Item Spawning

- **Bombs**: Begin spawning after **5 seconds** of gameplay
  - Timer starts when countdown completes (not during countdown)
  - After the initial delay, new bombs spawn every **5 seconds** (configurable)
  - You can collect multiple bombs - they stack in your inventory
  - Maximum of 3 bombs can exist on the map at the same time
- **Hunter's Cloak**: Spawns **once per level**
  - Appears randomly between **20-40 seconds** after gameplay starts
  - Only one cloak spawns per level
- **Random Placement**: All items are placed randomly on valid tiles (avoiding obstacles and entities)

### Collecting Items

- Simply walk over a special item icon on the game board to collect it
- Collected items are automatically added to your inventory
- Collection sound effect plays when picking up items
- Collection messages appear: "💣 BOMB COLLECTED!" or "🧥 HUNTER'S CLOAK COLLECTED!"
- Inventory appears in the header (left section) with 3 fixed slots

### Using Bombs

Bombs are powerful items that can stun the wolf, giving you precious time to collect flowers or escape.

**How to Use:**

- **Click/Tap**: Click or tap the bomb icon in the header inventory
- **Keyboard**: Press the **Space bar** to use a bomb

**Bomb Effects:**

- **Explosion Radius**: 3 tiles in all directions from your position
- **Stun Duration**: If the wolf is within the explosion radius, it's stunned for 5 seconds
- **Visual Effects**:
  - Radial explosion animation at your position
  - Screen shake effect
  - Random explosion sound effect (3 variations)
  - Dark explosion mark on the tile (fades after 3 seconds)
- **Stun Timer**: A countdown timer appears above the wolf showing remaining stun time (in seconds, no "s" suffix)

**Wolf Speed Increase (New Challenge!):**

⚠️ **Warning**: Each time the wolf wakes up from a stun, it becomes **10% faster**!

- **Speed Increase**: Wolf movement delay reduces by 10% after each stun (cumulative)
- **Maximum Increases**: The wolf can only get faster up to **5 times** maximum
- **Example Progression**:
  - 1st stun: 500ms → 450ms (10% faster)
  - 2nd stun: 450ms → 405ms (10% faster)
  - 3rd stun: 405ms → 364.5ms (10% faster)
  - 4th stun: 364.5ms → 328ms (10% faster)
  - 5th stun: 328ms → 295ms (10% faster)
  - After 5 stuns: Speed stays at maximum (no further increase)
- **Howl Sound**: When the wolf wakes up, it howls to signal its increased speed
- **Strategic Gameplay**: Use bombs wisely! Each stun makes the wolf more dangerous

**Cooldown System:**

- After using a bomb, there's a **5-second cooldown** before you can use another
- A progress bar under the bomb icon in the inventory shows the cooldown progress
- The bomb button is disabled during cooldown

### Feedback Messages

Temporary messages appear in the center of the screen for various events:

**Bomb Usage:**

- **"WOLF STUNNED!"** (white text with glow) - Shown when the wolf is successfully stunned
- **"MISSED!"** (gold text with glow) - Shown when the wolf is outside the explosion radius

**Hunter's Cloak:**

- **"🧥 HUNTER'S CLOAK APPEARED!"** - Shown when the cloak spawns on the map
- **"🧥 HUNTER'S CLOAK!"** - Shown when you collect the cloak
- **"🧥 INVISIBLE!"** - Shown when you activate the cloak

### Configuration

All special item settings can be adjusted in `src/constants/gameConfig.ts`:

- `ITEM_SPAWN_DELAY` - Time before first item spawns (default: 5000ms / 5 seconds)
- `MAX_BOMBS_ON_MAP` - Maximum bombs on map simultaneously (default: 3)
- `BOMB_STUN_DURATION` - How long the wolf stays stunned (default: 5000ms / 5 seconds)
- `BOMB_EXPLOSION_RADIUS` - Blast radius in tiles (default: 3 tiles)
- `BOMB_EXPLOSION_DURATION` - Visual effect duration (default: 1000ms / 1 second)
- `BOMB_COOLDOWN_DURATION` - Cooldown between uses (default: 5000ms / 5 seconds)
- `EXPLOSION_MARK_DURATION` - How long explosion marks remain visible (default: 3000ms / 3 seconds)
- `WOLF_SPEED_INCREASE_PERCENTAGE` - Speed increase per stun (default: 0.1 / 10%)
- `MAX_WOLF_SPEED_INCREASES` - Maximum number of speed increases (default: 5)

### Hunter's Cloak

The Hunter's Cloak is a unique special item that allows you to become invisible to the wolf, providing strategic opportunities to collect flowers or escape danger.

**Spawning:**

- **Single Spawn**: The cloak spawns **once per level**
- **Random Timing**: Appears randomly between **20-40 seconds** after gameplay starts
- **Random Placement**: Placed on a valid tile (avoiding obstacles and entities)
- **Collection Message**: Shows "🧥 HUNTER'S CLOAK APPEARED!" when it spawns

**How to Use:**

- **Click/Tap**: Click or tap the cloak icon (🧥) in the header inventory
- The cloak is a reusable item (doesn't get consumed) but has a cooldown

**Cloak Effects:**

- **Invisibility Duration**: Become invisible for **10 seconds**
- **Wolf Behavior**: When you activate the cloak:
  - The wolf **stops moving** completely
  - The wolf becomes **confused** (alternates looking left/right every 5 seconds)
  - The wolf **cannot see you** (no collision detection)
- **Physical Barrier**: Even when invisible, you **cannot move through the wolf** (it's treated as an obstacle)
- **Visual Effect**: You become semi-transparent with a shimmer animation during invisibility
- **Activation Message**: Shows "🧥 INVISIBLE!" when activated
- **Collection Message**: Shows "🧥 HUNTER'S CLOAK COLLECTED!" when picked up

**Cooldown System:**

- After using the cloak, there's a **30-second cooldown** before you can use it again
- A progress bar under the cloak icon in the inventory shows the cooldown progress
- The cloak button is disabled during cooldown
- The cloak button is also disabled when the level is completed or game is over (no sound feedback)

**Strategic Gameplay:**

- Use the cloak to safely collect flowers near the wolf
- Escape dangerous situations when cornered
- Plan your route before activating invisibility (wolf acts as a physical obstacle)
- The wolf's confusion makes it clear you're invisible

**Configuration:**

- `CLOAK_SPAWN_DELAY_MIN` - Minimum spawn delay (default: 20000ms / 20 seconds)
- `CLOAK_SPAWN_DELAY_MAX` - Maximum spawn delay (default: 40000ms / 40 seconds)
- `CLOAK_INVISIBILITY_DURATION` - How long invisibility lasts (default: 10000ms / 10 seconds)
- `CLOAK_COOLDOWN_DURATION` - Cooldown between uses (default: 30000ms / 30 seconds)
- `CLOAK_WOLF_CONFUSION_INTERVAL` - How often wolf changes direction when confused (default: 5000ms / 5 seconds)

### Pause System

The game features a comprehensive pause system that allows you to temporarily stop gameplay and access helpful game information.

**How to Pause:**

- **Keyboard**: Press the **ESC** key
- **Header Button**: Click the pause button (⏸) next to the settings icon in the header
  - The icon changes to a play icon (▶) when the game is paused

**When Pause is Available:**

- Pause is only available after the countdown completes
- Pause is disabled when the game is over
- Pause is disabled when the level is completed
- Pause is disabled when the game is stuck

**Pause Menu Features:**

When paused, a menu overlay appears with:

- **Game Information**:
  - **Controls Section**: Lists all available controls (Arrow keys, WASD, Space, ESC, Swipe)
  - **Special Items Section**: Details about bombs and Hunter's Cloak with their mechanics
  - **Objective Section**: Game goals and objectives
- **Resume Button**: Click to continue playing
- **Smooth Animations**: Fade-in and fade-out transitions

**What Stops When Paused:**

- Player movement
- Wolf movement
- Item spawning
- All game timers (cooldowns continue based on absolute time)

**Mobile Optimizations:**

- **Responsive Grid Size**: 15x15 grid with 40 trees (vs 20x20 with 60 trees on desktop)
- Full-screen overlay (no border-radius)
- Positioned below the header for optimal space usage
- Scrollable content area for game information
- Smaller special item icons on the map
- All boundary checks and movement validation respect the smaller grid size

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

- The wolf recalculates its path every 500ms initially (configurable via `ENEMY_DELAY`)
- **Dynamic Delay**: Wolf movement delay decreases by 10% after each stun (maximum 5 speed increases)
- Manhattan distance is used because movement is restricted to 4 directions (no diagonals)
- Trees are treated as impassable obstacles
- **Responsive Boundaries**: Pathfinding respects the responsive grid size (15x15 on mobile, 20x20 on desktop)
- All boundary checks use the correct grid size to prevent pathfinding outside visible area
- If no path exists, the wolf stops moving and the game handles the stuck state
- Level generation ensures both player and wolf can move at game start
- Console logging provides visibility into pathfinding failures
- Wolf howls when waking up from stun to signal increased speed

## 📄 License

This project is licensed under the MIT License.

---

Enjoy your adventure! 🧺✨
