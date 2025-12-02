# Little Red Riding Hood Adventures

Welcome to the enchanting world of "Little Red Riding Hood Adventures"! A grid-based adventure game inspired by the classic fairy tale. Navigate through a mystical forest, collect flowers, and reach Granny's house while avoiding the wolf.

## 📋 Table of Contents

- [🎮 How to Play](#-how-to-play)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Game](#running-the-game)
  - [Building for Production](#building-for-production)
  - [Deploying to Vercel](#deploying-to-vercel)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🎵 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [📦 Code Organization](#-code-organization)
  - [CSS Modularization](#css-modularization)
  - [Component Organization](#component-organization)
  - [Centralized Exports](#centralized-exports)
  - [File Structure Benefits](#file-structure-benefits)
- [📝 Available Scripts](#-available-scripts)
- [🎯 Game Mechanics](#-game-mechanics)
- [🎯 Level System](#-level-system)
  - [Level Overview](#level-overview)
  - [Level Progression](#level-progression)
  - [Item Unlock System](#item-unlock-system)
  - [Level-Specific Features](#level-specific-features)
  - [Game Over Options](#game-over-options)
- [📱 Responsive Grid System](#-responsive-grid-system)
- [🎨 UI/UX Features](#-uiux-features)
  - [Header](#header)
  - [Settings Menu](#settings-menu)
  - [Quest System](#quest-system)
  - [Game Board](#game-board)
  - [Visual Feedback](#visual-feedback)
  - [Typography](#typography)
- [💣 Special Items & Inventory System](#-special-items--inventory-system)
  - [Item Spawning](#item-spawning)
  - [Collecting Items](#collecting-items)
  - [Using Bombs](#using-bombs)
  - [Feedback Messages](#feedback-messages)
  - [Configuration](#configuration)
  - [Hunter's Cloak](#hunters-cloak)
  - [Pause System](#pause-system)
- [🤖 Pathfinding Algorithm (A\*)](#-pathfinding-algorithm-a)
  - [How A\* Works](#how-a-works)
  - [In This Game](#in-this-game)
  - [Algorithm Steps](#algorithm-steps)
  - [Why A\*?](#why-a)
  - [Implementation Details](#implementation-details)
- [📄 License](#-license)

## 🎮 How to Play

- Use **arrow keys** (↑ ↓ ← →) or **WASD keys** to move Little Red Riding Hood
  - `W` = Up, `S` = Down, `A` = Left, `D` = Right
- On mobile/tablet, swipe in the direction you want to move
- Press **ESC** or click the pause button (⏸) in the header to pause/unpause the game
- Wait for the countdown (3-2-1-GO!) before the game starts - you'll see which level you're playing!
- Collect all flowers scattered throughout the forest (level-specific amounts)
- **Collect special items** (bombs, Hunter's Cloak) - available based on your current level
- **Use bombs** to stun the wolf (within 3-tile radius)
  - Click/tap the bomb in your inventory, or press **Space bar**
  - Stun duration and cooldown vary by level
  - Available starting from Level 2
- ⚠️ **Warning**: Each time the wolf wakes up from a stun, it becomes 10% faster (max 5 times)!
- **Use Hunter's Cloak** to become invisible to the wolf
  - Click/tap the cloak icon in your inventory
  - The wolf stops moving and becomes confused while you're invisible
  - The wolf is treated as an obstacle during invisibility (can't move through it)
  - Invisibility duration and cooldown vary by level
  - Available starting from Level 3
- Avoid the wolf - if it catches you, it's game over!
  - You can **Try Again** to play the same level again
  - Or **Restart** to begin from Level 1
- Once all flowers are collected, Granny's house will open
- Reach Granny's house to complete the level and unlock new items!

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

### Deploying to Vercel

The easiest way to deploy this game is using [Vercel](https://vercel.com):

1. **Install Vercel CLI** (optional):

   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:

   ```bash
   vercel
   ```

3. **Or deploy via Vercel Dashboard**:

   - Import your GitHub repository at [vercel.com/new](https://vercel.com/new)
   - Vercel will auto-detect Create React App settings
   - Click "Deploy"

4. **Configuration**:
   - The `vercel.json` file is already configured
   - Build command: `npm run build`
   - Output directory: `build`
   - Framework: Create React App

Your game will be live at: `https://little-red-riding-hood-adventures.vercel.app` (or your custom domain)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Create React App** - Build tooling
- **CSS3** - Modular styling and animations with custom properties
  - **11 organized CSS modules** for better maintainability
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
│   │   ├── SettingsMenu.tsx        # Settings dropdown menu
│   │   ├── QuestProgress.tsx       # Quest progress bar component
│   │   └── icons/                  # All SVG icon components
│   │       ├── SettingsIcon.tsx    # Settings gear icon
│   │       ├── PauseIcon.tsx       # Pause icon
│   │       ├── PlayIcon.tsx        # Play icon
│   │       ├── VolumeIcon.tsx      # Volume icon
│   │       ├── RestartIcon.tsx     # Restart icon
│   │       └── CloseIcon.tsx       # Close icon
│   ├── Countdown.tsx               # Countdown start screen (GET READY!)
│   ├── GameOver.tsx                # Game over modal
│   ├── LevelComplete.tsx           # Level complete overlay
│   ├── PauseMenu.tsx               # Pause menu overlay with game information
│   └── TemporaryMessage.tsx        # Temporary messages (hit/miss feedback)
├── constants/
│   ├── gameConfig.ts               # Game configuration constants
│   └── levelConfig.ts              # Level-specific configurations and unlocks
├── hooks/
│   ├── index.ts                    # Centralized hook exports
│   ├── useGameState.ts             # Main game state management and orchestration
│   ├── useAudio.ts                 # Audio playback management
│   ├── useInput.ts                 # Keyboard (arrow keys + WASD + Space) and touch input
│   ├── useDebounce.ts              # Debounce utility
│   ├── useLevelState.ts            # Level generation logic
│   ├── usePlayerState.ts           # Player movement and state management
│   ├── useWolfState.ts             # Wolf AI and state management
│   ├── useBombMechanics.ts         # Bomb explosion and stun mechanics
│   ├── useCloakMechanics.ts        # Hunter's Cloak invisibility mechanics
│   ├── useInventoryState.ts        # Item spawning and inventory management
│   └── useGameLifecycle.ts         # Game lifecycle and timing management
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
- 📊 **Multi-Level System** - Progress through 3 distinct levels with increasing difficulty
- 🔓 **Progressive Item Unlocks** - Unlock bombs after Level 1, cloak after Level 2
- 📈 **Level-Specific Configurations** - Flowers, wolf speed, and item stats vary by level
- 💣 **Special Items System** - Collect and use bombs to stun the wolf
- 🧥 **Hunter's Cloak** - Become invisible to the wolf for strategic gameplay
- ⏸️ **Pause System** - Pause/unpause with ESC key or header button, shows level-specific game information
- 📦 **Compact Header Inventory** - 3-slot inventory in the header with visual cooldown
- 🎯 **Quest Progress in Header** - Slim one-liner progress bar showing collected flowers (level-specific count)
- ⚙️ **Settings Menu** - Accessible via SVG gear icon in header (top-right)
- 🏠 **Granny's Tooltips** - Dynamic quest messages appear above Granny's house (level-specific)
- 💥 **Explosion Effects** - Visual feedback with screen shake and marks
- 🎯 **Hit/Miss Feedback** - Temporary messages show bomb effectiveness
- ⏱️ **Stun System** - Visual countdown timer above stunned wolf
- 🐺 **Wolf Speed Increase** - Wolf becomes faster after each stun (10% speed increase, max 5 times)
- 🔊 **Wolf Howl** - Wolf howls when waking up from stun
- 🎮 **Improved Countdown UI** - Shows current level before countdown starts
- 🎯 **Level Complete Screen** - Beautiful overlay with unlock messages and progression options
- 🔄 **Game Over Options** - Retry current level or restart from Level 1

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
- **Modular CSS Architecture** - 11 organized CSS modules for better maintainability
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

The CSS has been reorganized from a single 2,500+ line file into **11 organized modules**:

- **`variables.css`** - All CSS custom properties (design tokens: colors, spacing, typography, z-index)
- **`base.css`** - Reset styles, font imports, base body styles
- **`layouts.css`** - Layout components (App container, game board wrapper)
- **`animations.css`** - All keyframe animations (34 animations) in one place
- **`responsive.css`** - Responsive media queries and mobile-specific overrides
- **`components/header.css`** - Header, inventory, quest progress styles
- **`components/game.css`** - Game grid, tiles, sprites, game entities
- **`components/tooltip.css`** - Granny house tooltip styles
- **`components/quest.css`** - Quest panel styles
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
- **UI Components** (`components/ui/`) - Header, inventory, settings
  - All icon components organized in `components/ui/icons/` folder for consistency
  - 6 icon components: SettingsIcon, PauseIcon, PlayIcon, VolumeIcon, RestartIcon, CloseIcon
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
- ✅ **Consistent icon organization**: All icons grouped in `components/ui/icons/` folder
- ✅ **Clean component structure**: Removed unused legacy components

## 📝 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🎯 Game Mechanics

- **Responsive Grid-Based Movement** - Adaptive grid size based on screen width
  - Mobile (<420px): 15x15 grid with 40 trees
  - Desktop (≥420px): 20x20 grid with 60 trees (Level 3+ has 10% more trees)
  - Grid size is calculated at game initialization and stored in game state
  - All boundary checks and pathfinding respect the responsive grid size
- **Collision Detection** - Trees block movement, wolf triggers game over
- **Pathfinding** - Wolf uses A\* algorithm to chase the player intelligently
- **Dynamic Wolf Speed** - Wolf movement delay adjusts based on:
  - Current level (500ms Level 1, 400ms Level 2, 350ms Level 3+)
  - Stun count (10% faster after each stun, max 5 increases)
- **Quest System** - Collect level-specific flowers to unlock Granny's house
- **Audio System** - Background music and contextual sound effects with cookie persistence
- **Level Validation** - Flood fill algorithm ensures all objectives are reachable
- **Stuck Detection** - Runtime detection prevents unwinnable game states (level-aware)
- **Countdown Timer** - Game starts with a 3-2-1-GO! countdown animation with level badge
- **Special Items** - Bombs spawn continuously (Level 2+), Hunter's Cloak spawns once per level (Level 3+)
- **Inventory System** - Compact header-based inventory with 3 fixed slots
- **Bomb Mechanics** - Stun the wolf within a 3-tile radius (duration varies by level: 5s in Level 2, 4s in Level 3+)
- **Hunter's Cloak Mechanics** - Become invisible to the wolf (duration varies by level: 8s in Level 3+)
- **Pause System** - Pause/unpause gameplay with ESC key or header button, shows level-specific game information
- **Cooldown System** - Level-specific cooldowns with visual progress bars (bombs: 5s/7s, cloak: 40s)
- **Wolf Speed Increase** - Wolf becomes 10% faster after each stun (cumulative, max 5 times)
- **Wolf Howl Sound** - Wolf howls when waking up from stun, signaling increased speed
- **Dynamic Wolf Speed** - Wolf movement delay decreases with each stun, making it progressively faster
- **Level Progression** - Complete levels to advance (currently infinite levels)
- **Explosion Marks** - Visual marks on tiles where bombs were used (fade after 3 seconds)
- **Responsive Grid System** - Grid size adapts based on viewport width for optimal gameplay
- **Level System** - Three distinct levels with progressive difficulty and item unlocks

## 🎯 Level System

The game features a multi-level progression system with increasing difficulty and progressive item unlocks. Each level has unique configurations for flowers, wolf speed, and available special items.

### Level Overview

**Level 1 - The Beginning**

- **Flowers**: 20 flowers to collect
- **Wolf Speed**: Base speed (500ms movement delay)
- **Special Items**: None available
- **Objective**: Learn the basics and reach Granny's house

**Level 2 - The Chase**

- **Flowers**: 25 flowers to collect
- **Wolf Speed**: 20% faster (400ms movement delay)
- **Special Items**: 💣 **Bomb unlocked!**
  - Stun duration: 5 seconds
  - Cooldown: 5 seconds
- **Objective**: Use bombs strategically to escape the faster wolf
- **Unlock**: Complete Level 1 to unlock bombs

**Level 3+ - The Ultimate Challenge**

- **Flowers**: 30 flowers to collect
- **Wolf Speed**: Even faster (350ms movement delay)
- **Trees**: 10% more trees for added difficulty
- **Special Items**: Both 💣 **Bomb** and 🧥 **Hunter's Cloak** available
  - Bomb stun duration: 4 seconds (shorter)
  - Bomb cooldown: 7 seconds (longer)
  - Cloak invisibility: 8 seconds (shorter)
  - Cloak cooldown: 40 seconds (longer)
- **Objective**: Master both items to survive the ultimate challenge
- **Unlock**: Complete Level 2 to unlock Hunter's Cloak

### Level Progression

1. **Complete Level 1** → Unlock 💣 Bomb

   - "New Item Unlocked: 💣 Bomb!" message appears
   - Option to "Continue to Level 2" or "Restart"

2. **Complete Level 2** → Unlock 🧥 Hunter's Cloak

   - "New Item Unlocked: 🧥 Hunter's Cloak!" message appears
   - Option to "Continue to Level 3" or "Restart"

3. **Complete Level 3+** → Master Level
   - "New levels will be added soon!" message
   - Option to "Play Again" (replay Level 3) or "Restart"

### Item Unlock System

- Items are unlocked progressively as you complete levels
- Unlock messages appear on the "Level Complete" screen
- Available items are shown in the pause menu based on your current level
- Level 1: No special items
- Level 2: Bombs available
- Level 3+: Both bombs and cloak available

### Level-Specific Features

- **Dynamic Configuration**: Each level uses `getLevelConfig(level)` to load level-specific settings
- **Adaptive Difficulty**: Wolf speed, flower count, and item stats scale with level
- **Progressive Challenges**: Each level introduces new challenges and tools
- **Quest Messages**: Granny's quest messages adjust based on level (flower count)
- **Pause Menu**: Shows level-specific item information and objectives

### Game Over Options

When the wolf catches you, you have two options:

- **Try Again** - Restart the current level with the same configuration
  - Keeps your current level progress
  - Same difficulty and items as before
- **Restart** - Start fresh from Level 1
  - Resets all progress
  - Begin the journey from the beginning

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

The **Game Menu** provides comprehensive control over audio and game settings:

- **Auto-Pause** - Opening the menu automatically pauses the game during gameplay
- **Toggle Behavior** - Settings icon in header serves as both open and close button
  - Click to open menu when closed
  - Click again to close menu when open
  - Dynamic aria-label provides accessibility feedback
- **Dropdown Menu** - Opens below the header (positioned at top-right)
- **Game Progress Section**
  - 🏆 Overall Progress: Visual progress bar showing current level out of total levels
  - 💐 Flowers Collected: Progress bar showing flowers collected in current level
- **Audio Controls**
  - Volume slider with real-time percentage display
  - Adjusting volume automatically unmutes if sound was muted
  - **Mute Music** button - Toggle background music on/off
  - **Enable Sound Effects** checkbox - Toggle all game sound effects (footsteps, item collection, wolf sounds, etc.)
- **Actions**
  - **Restart Game** button - Resets to Level 1 and closes the menu
- **Credits** - Developer attribution with LinkedIn link (always visible at bottom)
- **Click Outside** - Menu closes when clicking outside (but not when clicking the settings button)
- **Mobile Friendly** - Optimized layout for smaller screens

### Quest System

- **Granny's Tooltips** - Dynamic messages appear above Granny's house
  - Start message: "My sweet RedHood! 💐 Gather X flowers for me." (X varies by level)
  - Halfway message: "Halfway there! 🌺" (appears at 50% of level-specific flower count)
  - All collected: "Perfect! 🌸 Hurry here!"
  - Entered house: "Oh my dear! 🧓 You made it safely!"
- **Level-Specific Messages** - Flower counts in messages adjust based on current level
  - Level 1: "Gather 20 flowers for me"
  - Level 2: "Gather 25 flowers for me"
  - Level 3+: "Gather 30 flowers for me"
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
  - **Level Badge** - Shows "LEVEL X" badge at the top with gold styling and glow effect
  - Displays current level prominently before gameplay starts
- **Level Complete Overlay** - "LEVEL X COMPLETED!" message with unlock notifications
  - Shows item unlock messages when new items are available
  - "Continue to Level X" button for levels 1-2
  - "Play Again" and "Restart" buttons for Level 3+
- **Game Over Modal** - Clean overlay with two action options
  - **Try Again** - Play the current level again
  - **Restart** - Start over from Level 1
- **Temporary Messages** - "WOLF STUNNED!" (white) or "MISSED!" (gold) for bombs, "🧥 INVISIBLE!" for cloak activation, "🧥 HUNTER'S CLOAK APPEARED!" when cloak spawns / "+1 💣 BOMB!" or "🧥 HUNTER'S CLOAK!" when collected
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

- **Bombs**: Begin spawning after **5 seconds** of gameplay (Level 2+ only)
  - Timer starts when countdown completes (not during countdown)
  - After the initial delay, new bombs spawn every **5 seconds** (configurable)
  - You can collect multiple bombs - they stack in your inventory
  - Maximum of 3 bombs can exist on the map at the same time
  - **Available starting from Level 2**
- **Hunter's Cloak**: Spawns **once per level** (Level 3+ only)
  - Appears randomly between **20-40 seconds** after gameplay starts
  - Only one cloak spawns per level
  - **Available starting from Level 3**
- **Random Placement**: All items are placed randomly on valid tiles (avoiding obstacles and entities)
- **Level-Specific Availability**: Items only spawn if they're unlocked for your current level

### Collecting Items

- Simply walk over a special item icon on the game board to collect it
- Collected items are automatically added to your inventory
- Collection sound effect plays when picking up items
- Collection messages appear: "+1 💣 BOMB!" or "🧥 HUNTER'S CLOAK!"
- Inventory appears in the header (left section) with 3 fixed slots

### Using Bombs

Bombs are powerful items that can stun the wolf, giving you precious time to collect flowers or escape.

**How to Use:**

- **Click/Tap**: Click or tap the bomb icon in the header inventory
- **Keyboard**: Press the **Space bar** to use a bomb

**Bomb Effects:**

- **Explosion Radius**: 3 tiles in all directions from your position
- **Stun Duration**: Varies by level
  - Level 2: 5 seconds
  - Level 3+: 4 seconds (shorter)
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
- **Example Progression (Level 2)**:
  - Base speed: 400ms
  - 1st stun: 400ms → 360ms (10% faster)
  - 2nd stun: 360ms → 324ms (10% faster)
  - 3rd stun: 324ms → 291.6ms (10% faster)
  - 4th stun: 291.6ms → 262.4ms (10% faster)
  - 5th stun: 262.4ms → 236.2ms (10% faster)
  - After 5 stuns: Speed stays at maximum (no further increase)
- **Example Progression (Level 3+)**:
  - Base speed: 350ms (already faster!)
  - 1st stun: 350ms → 315ms (10% faster)
  - 2nd stun: 315ms → 283.5ms (10% faster)
  - 3rd stun: 283.5ms → 255.2ms (10% faster)
  - 4th stun: 255.2ms → 229.7ms (10% faster)
  - 5th stun: 229.7ms → 206.7ms (10% faster)
  - After 5 stuns: Speed stays at maximum (no further increase)
- **Howl Sound**: When the wolf wakes up, it howls to signal its increased speed
- **Strategic Gameplay**: Use bombs wisely! Each stun makes the wolf more dangerous, especially in higher levels!

**Cooldown System:**

- Cooldown varies by level:
  - Level 2: 5-second cooldown
  - Level 3+: 7-second cooldown (longer)
- A progress bar under the bomb icon in the inventory shows the cooldown progress
- The bomb button is disabled during cooldown

### Feedback Messages

Temporary messages appear in the center of the screen for various events:

**Bomb Usage:**

- **"WOLF STUNNED!"** (white text with glow) - Shown when the wolf is successfully stunned
- **"MISSED!"** (gold text with glow) - Shown when the wolf is outside the explosion radius

**Hunter's Cloak:**

- **"🧥 HUNTER'S CLOAK APPEARED!"** - Shown when the cloak spawns on the map
- **"🧥 HUNTER'S CLOAK!"** - Shown when you collect the cloak (replaces old "COLLECTED!" message)
- **"🧥 INVISIBLE!"** - Shown when you activate the cloak

### Configuration

All special item settings can be adjusted in `src/constants/gameConfig.ts`:

- `ITEM_SPAWN_DELAY` - Time before first item spawns (default: 5000ms / 5 seconds)
- `MAX_BOMBS_ON_MAP` - Maximum bombs on map simultaneously (default: 3)
- `BOMB_EXPLOSION_RADIUS` - Blast radius in tiles (default: 3 tiles)
- `BOMB_EXPLOSION_DURATION` - Visual effect duration (default: 1000ms / 1 second)
- `EXPLOSION_MARK_DURATION` - How long explosion marks remain visible (default: 3000ms / 3 seconds)
- `WOLF_SPEED_INCREASE_PERCENTAGE` - Speed increase per stun (default: 0.1 / 10%)
- `MAX_WOLF_SPEED_INCREASES` - Maximum number of speed increases (default: 5)

**Level-specific configurations** are defined in `src/constants/levelConfig.ts`:

- `getLevelConfig(level)` - Returns level-specific settings:
  - Number of flowers to collect
  - Wolf movement delay (speed)
  - Number of trees
  - Item unlock status (bombUnlocked, cloakUnlocked)
  - Item durations and cooldowns (level-specific)
- `getUnlockedItem(completedLevel)` - Returns which item unlocks after completing a level
- `getUnlockMessage(completedLevel)` - Returns the unlock message for completed levels

**Level Configuration Details:**

- **Level 1**: 20 flowers, 500ms wolf delay, no items
- **Level 2**: 25 flowers, 400ms wolf delay, bombs unlocked (5s stun, 5s cooldown)
- **Level 3+**: 30 flowers, 350ms wolf delay, both items (4s stun, 7s bomb cooldown, 8s cloak invisibility, 40s cloak cooldown)

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

- **Invisibility Duration**: Varies by level
  - Level 3+: 8 seconds (shorter)
- **Wolf Behavior**: When you activate the cloak:
  - The wolf **stops moving** completely
  - The wolf becomes **confused** (alternates looking left/right every 5 seconds)
  - The wolf **cannot see you** (no collision detection)
- **Physical Barrier**: Even when invisible, you **cannot move through the wolf** (it's treated as an obstacle)
- **Visual Effect**: You become semi-transparent with a shimmer animation during invisibility
- **Activation Message**: Shows "🧥 INVISIBLE!" when activated
- **Collection Message**: Shows "🧥 HUNTER'S CLOAK!" when picked up
- **Available starting from Level 3**

**Cooldown System:**

- Cooldown varies by level:
  - Level 3+: 40-second cooldown (longer)
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
- `CLOAK_WOLF_CONFUSION_INTERVAL` - How often wolf changes direction when confused (default: 5000ms / 5 seconds)

**Note**: Cloak invisibility duration and cooldown are level-specific (see `levelConfig.ts`):

- Level 3+: 8 seconds invisibility, 40 seconds cooldown

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
  - **Special Items Section**: Shows level-specific item details
    - Level 1: "No special items available in this level"
    - Level 2: Bomb information (stun duration, cooldown)
    - Level 3+: Both bomb and cloak information (with level-specific stats)
  - **Objective Section**: Shows level-specific flower count goal
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

- The wolf recalculates its path based on level-specific delays:
  - **Level 1**: 500ms (base speed)
  - **Level 2**: 400ms (20% faster)
  - **Level 3+**: 350ms (even faster)
- **Dynamic Delay**: Wolf movement delay decreases by 10% after each stun (maximum 5 speed increases)
  - This compounds with the level-specific base speed, making higher levels significantly more challenging
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
