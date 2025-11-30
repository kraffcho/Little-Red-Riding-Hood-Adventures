# Hook Refactoring Plan: Splitting `useGameState.ts`

## 📊 Current State Analysis

- **File size**: 1,022 lines
- **State properties**: 24+ properties in single `GameState` object
- **Main functions**: 14 callback functions
- **Refs**: 4 timer/interval refs
- **useEffect hooks**: Multiple complex effects

## 🎯 Goals

1. **Separate concerns** - Each hook handles one domain
2. **Reduce complexity** - Smaller, easier to understand files
3. **Improve maintainability** - Easier to locate and fix bugs
4. **Better testability** - Test each domain independently
5. **Preserve functionality** - No breaking changes

---

## 📦 Proposed Hook Structure

### 1. `usePlayerState.ts` (~150 lines)
**Responsibility**: Player position, movement, and state

**State:**
- `playerPosition`
- `playerDirection`
- `playerCanMove`
- `playerEnteredHouse`
- `isHouseOpen`

**Functions:**
- `movePlayer(direction)`

**Dependencies:**
- Collision detection with trees
- Flower collection logic
- House entry logic
- Wolf collision (when not invisible)

---

### 2. `useWolfState.ts` (~200 lines)
**Responsibility**: Wolf position, movement, pathfinding, and stun mechanics

**State:**
- `wolfPosition`
- `wolfDirection`
- `wolfMoving`
- `wolfStunned`
- `wolfStunEndTime`
- `currentWolfDelay`
- `wolfStunCount`
- `wolfWon`

**Functions:**
- `moveWolf()`
- `stunWolf()`

**Refs:**
- Timer for wolf movement interval

**Dependencies:**
- Pathfinding to player
- Stun duration and speed increases
- Player invisibility handling

---

### 3. `useLevelState.ts` (~250 lines)
**Responsibility**: Level generation, grid, flowers, trees, house

**State:**
- `gridSize`
- `treePositions`
- `flowers` (positions)
- `collectedFlowers`
- `grannyHousePosition`
- `currentLevel`

**Functions:**
- `initializeGame()`
- `generateLevel()`
- `collectFlower(position)`

**Dependencies:**
- Level generation utilities
- Stuck detection
- Path validation

---

### 4. `useInventoryState.ts` (~150 lines)
**Responsibility**: Inventory, item spawning, special items on map

**State:**
- `inventory` (array of ItemType)
- `specialItems` (array of SpecialItem)

**Functions:**
- `addToInventory(item)`
- `removeFromInventory(item)`
- `spawnSpecialItem()`
- `spawnCloak()`
- `startItemSpawning()`

**Refs:**
- `itemSpawnTimerRef`
- `cloakSpawnTimerRef`

**Dependencies:**
- Item spawn logic
- Random position generation
- Max items on map limits

---

### 5. `useBombMechanics.ts` (~180 lines)
**Responsibility**: Bomb usage, explosions, stun effects

**State:**
- `explosionEffect`
- `explosionMarks`
- `bombCooldownEndTime`

**Functions:**
- `useBomb()`
- `clearExplosionEffect()`

**Dependencies:**
- Inventory (check if bomb exists)
- Wolf state (stun wolf)
- Explosion radius calculation

---

### 6. `useCloakMechanics.ts` (~200 lines)
**Responsibility**: Hunter's Cloak invisibility and confusion

**State:**
- `playerInvisible`
- `cloakInvisibilityEndTime`
- `cloakCooldownEndTime`
- `cloakSpawned`

**Functions:**
- `useCloak()`
- `clearInvisibility()`

**Refs:**
- `wolfConfusionIntervalRef`

**Dependencies:**
- Inventory (check if cloak exists)
- Wolf state (stop movement, confusion)
- Player state (clear on house entry)

---

### 7. `useGameLifecycle.ts` (~120 lines)
**Responsibility**: Game state, reset, initialization coordination

**State:**
- `gameOver`
- `isStuck`
- `stuckReason`
- `temporaryMessage`
- `paused`

**Functions:**
- `resetGame()`
- `setGameOver(reason)`
- `setStuck(reason)`
- `clearTemporaryMessage()`
- `pauseGame()`
- `unpauseGame()`
- `togglePause()`

**Refs:**
- `gameStartTimeRef`

**Dependencies:**
- Coordinates all other hooks
- Handles game state transitions

---

### 8. `useGameState.ts` (Orchestrator ~100 lines)
**Responsibility**: Composes all hooks, provides unified API

**Exports:**
- Unified `gameState` object (combines all state)
- All game functions
- Single hook interface

**Structure:**
```typescript
export const useGameState = () => {
  const playerState = usePlayerState();
  const wolfState = useWolfState();
  const levelState = useLevelState();
  const inventoryState = useInventoryState();
  const bombMechanics = useBombMechanics();
  const cloakMechanics = useCloakMechanics();
  const lifecycle = useGameLifecycle();

  // Combine all state
  const gameState: GameState = {
    ...playerState.state,
    ...wolfState.state,
    ...levelState.state,
    ...inventoryState.state,
    ...bombMechanics.state,
    ...cloakMechanics.state,
    ...lifecycle.state,
  };

  // Return unified API
  return {
    gameState,
    ...playerState.actions,
    ...wolfState.actions,
    ...levelState.actions,
    ...inventoryState.actions,
    ...bombMechanics.actions,
    ...cloakMechanics.actions,
    ...lifecycle.actions,
  };
};
```

---

## 🔄 Dependencies Between Hooks

```
useGameState (orchestrator)
├── useGameLifecycle (coordinates everything)
├── useLevelState (initializes grid, flowers, trees)
├── usePlayerState (depends on: levelState, wolfState, cloakMechanics)
├── useWolfState (depends on: levelState, playerState, cloakMechanics)
├── useInventoryState (depends on: levelState)
├── useBombMechanics (depends on: inventoryState, wolfState, levelState)
└── useCloakMechanics (depends on: inventoryState, wolfState, playerState)
```

---

## 📝 Step-by-Step Refactoring Process

### Phase 1: Preparation (No Code Changes)
1. ✅ Create this plan document
2. ✅ Review all dependencies
3. ✅ Document current state shape
4. ✅ Identify all cross-hook dependencies

### Phase 2: Extract Independent Hooks First
**Order matters** - Start with hooks that have fewest dependencies:

1. **`useLevelState.ts`** (Week 1)
   - Most independent
   - Used by everything else
   - Contains initialization logic

2. **`useInventoryState.ts`** (Week 1)
   - Independent spawning logic
   - Can be tested in isolation

3. **`useGameLifecycle.ts`** (Week 1)
   - Simple state management
   - Coordination logic

### Phase 3: Extract Dependent Hooks
4. **`useWolfState.ts`** (Week 2)
   - Depends on levelState
   - Complex pathfinding logic
   - Test thoroughly

5. **`useBombMechanics.ts`** (Week 2)
   - Depends on inventoryState, wolfState
   - Explosion logic

6. **`useCloakMechanics.ts`** (Week 2)
   - Depends on inventoryState, wolfState
   - Invisibility logic

### Phase 4: Extract Player Hook
7. **`usePlayerState.ts`** (Week 3)
   - Depends on everything
   - Most complex dependencies
   - Save for last

### Phase 5: Create Orchestrator
8. **Refactor `useGameState.ts`** (Week 3)
   - Compose all hooks
   - Maintain backward compatibility
   - Ensure all tests pass

### Phase 6: Testing & Cleanup
9. **Testing** (Week 4)
   - Unit tests for each hook
   - Integration tests for orchestrator
   - Manual testing of full game

10. **Cleanup** (Week 4)
    - Remove unused code
    - Update documentation
    - Code review

---

## 🧪 Testing Strategy

### For Each New Hook:
1. **Unit Tests**
   - Test state initialization
   - Test all action functions
   - Test edge cases
   - Test cleanup

2. **Integration Tests**
   - Test hook interactions
   - Test state consistency
   - Test timer management

### Final Integration:
- Full game playthrough test
- Performance comparison (before/after)
- Memory leak checks

---

## ⚠️ Challenges & Solutions

### Challenge 1: Circular Dependencies
**Problem**: Player depends on Wolf, Wolf depends on Player

**Solution**: 
- Use callback props
- Pass state as parameters
- Use context for cross-hook communication

### Challenge 2: Shared State Updates
**Problem**: Multiple hooks need to update same property

**Solution**:
- Orchestrator manages shared state
- Hooks emit events
- Centralized state updates

### Challenge 3: Timer Management
**Problem**: Timers in multiple hooks

**Solution**:
- Each hook manages its own timers
- Cleanup in useEffect return
- Clear on reset/unmount

### Challenge 4: Backward Compatibility
**Problem**: App.tsx expects specific API

**Solution**:
- Orchestrator maintains same interface
- Gradual migration possible
- No breaking changes

---

## 📊 Expected Benefits

### File Size Reduction:
- Current: `useGameState.ts` (1,022 lines)
- After: 8 files averaging ~150 lines each
- Largest file: ~250 lines

### Maintainability:
- ✅ Easier to locate bugs
- ✅ Clearer responsibility boundaries
- ✅ Simpler code reviews

### Testability:
- ✅ Test each domain independently
- ✅ Mock dependencies easily
- ✅ Faster test execution

### Performance:
- ✅ Selective re-renders possible
- ✅ Better code splitting
- ✅ Easier optimization

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach
2. **Create feature branch** - `refactor/split-game-state-hook`
3. **Start with Phase 2, Step 1** - Extract `useLevelState.ts`
4. **Incremental commits** - Small, testable changes
5. **Regular testing** - Ensure no regressions

---

## 📚 Reference

### Current Hook Functions:
- `initializeGame()` - Level setup
- `movePlayer(direction)` - Player movement
- `moveWolf()` - Wolf AI movement
- `spawnSpecialItem()` - Item spawning
- `spawnCloak()` - Cloak spawning
- `startItemSpawning()` - Start timers
- `useBomb()` - Bomb mechanics
- `useCloak()` - Cloak mechanics
- `resetGame()` - Game reset
- `clearTemporaryMessage()` - UI message
- `pauseGame()` - Pause state
- `unpauseGame()` - Resume state
- `togglePause()` - Toggle pause

### Current State Properties:
- Player: position, direction, canMove, enteredHouse
- Wolf: position, direction, moving, stunned, delay, stunCount, won
- Level: gridSize, trees, flowers, collectedFlowers, house, level
- Inventory: inventory array, specialItems array
- Bomb: explosionEffect, explosionMarks, cooldown
- Cloak: invisible, invisibilityEndTime, cooldownEndTime, spawned
- Lifecycle: gameOver, isStuck, stuckReason, temporaryMessage, paused

---

**Status**: 📋 Plan Created
**Created**: 2025-01-27
**Next Action**: Review and begin Phase 2, Step 1

