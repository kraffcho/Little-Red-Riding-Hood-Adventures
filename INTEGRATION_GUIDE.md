# Hook Integration Guide

This guide documents the integration patterns we're using and provides examples for future integrations.

## 📋 Current Integration Status

### ✅ Fully Integrated
1. **useLevelState** - `generateLevel()` function

### ⚠️ Partially Integrated
2. **useInventoryState** - Timer refs (`itemSpawnTimerRef`, `cloakSpawnTimerRef`)
3. **useGameLifecycle** - `gameStartTimeRef` and helper functions

### 📦 Ready for Integration
4. **useBombMechanics** - Bomb logic, explosions, stuns
5. **useCloakMechanics** - Cloak logic, invisibility
6. **useWolfState** - Wolf AI, pathfinding
7. **usePlayerState** - Player movement

---

## 🔄 Integration Patterns

### Pattern 1: Function Extraction (Simple)

**Use Case**: Extract pure functions that don't depend on local state.

**Example**: `useLevelState.generateLevel()`

```typescript
// ✅ useLevelState integration
const { generateLevel } = useLevelState();

// Use the function - state remains in gameState
const levelData = generateLevel();
```

**When to Use**: 
- Functions that take parameters and return data
- Functions that don't manage their own React state
- Functions that are pure or mostly pure

---

### Pattern 2: Ref Extraction (Medium)

**Use Case**: Extract refs for timer/interval management.

**Example**: `useInventoryState` timer refs

```typescript
// ✅ useInventoryState integration
const { itemSpawnTimerRef, cloakSpawnTimerRef } = useInventoryState();

// Use refs directly - state remains in gameState
if (itemSpawnTimerRef.current) {
  clearTimeout(itemSpawnTimerRef.current);
}
```

**When to Use**:
- Timer/interval refs
- DOM refs
- Other imperative refs that don't trigger re-renders

---

### Pattern 3: Ref + Helper Functions (Medium)

**Use Case**: Extract refs with helper functions for ref management.

**Example**: `useGameLifecycle.gameStartTimeRef`

```typescript
// ✅ useGameLifecycle integration
const { 
  gameStartTimeRef, 
  setGameStartTime, 
  clearGameStartTime 
} = useGameLifecycle();

// Use helper functions instead of direct ref access
setGameStartTime(Date.now());
clearGameStartTime();
```

**When to Use**:
- Refs that need helper functions for cleaner API
- When you want to abstract ref access
- When ref management logic is complex

---

### Pattern 4: State Coordination (Complex) - ⏳ Future

**Use Case**: Coordinate state between hook and gameState.

**Example**: Pause/toggle functions (future integration)

```typescript
// ⏳ Future: useGameLifecycle pause integration
const { 
  paused,
  pauseGame: hookPauseGame,
  unpauseGame: hookUnpauseGame,
} = useGameLifecycle();

// Coordinate with gameState
const pauseGame = useCallback(() => {
  hookPauseGame(); // Update hook state
  setGameState((prev) => ({
    ...prev,
    paused: true,
    playerCanMove: false,
    wolfMoving: false,
  }));
}, [hookPauseGame]);
```

**When to Use**:
- When hook state needs to sync with gameState
- When multiple state updates need coordination
- Complex state dependencies

---

### Pattern 5: Logic Extraction (Complex) - ⏳ Future

**Use Case**: Extract complex logic that operates on gameState.

**Example**: Bomb mechanics (future integration)

```typescript
// ⏳ Future: useBombMechanics integration
const {
  explosionEffect,
  useBomb: hookUseBomb,
} = useBombMechanics();

// Wrap to coordinate with gameState
const useBomb = useCallback(() => {
  hookUseBomb({
    playerPosition: gameState.playerPosition,
    wolfPosition: gameState.wolfPosition,
    inventory: gameState.inventory,
    onWolfStun: (stunEndTime) => {
      setGameState((prev) => ({
        ...prev,
        wolfStunned: true,
        wolfStunEndTime: stunEndTime,
      }));
    },
    onBombUsed: (newInventory, message) => {
      setGameState((prev) => ({
        ...prev,
        inventory: newInventory,
        temporaryMessage: message,
        explosionEffect: hookExplosionEffect,
      }));
    },
  });
}, [gameState, hookUseBomb]);
```

**When to Use**:
- Complex logic with multiple dependencies
- Logic that needs to coordinate multiple state updates
- When logic can be tested independently

---

## 🎯 Integration Strategy

### Phase 1: Simple Extractions ✅ (Current)
- ✅ Function extraction
- ✅ Ref extraction
- ✅ Helper function extraction

### Phase 2: State Coordination ⏳ (Next)
- ⏳ Lifecycle state coordination
- ⏳ Message state coordination
- ⏳ Pause state coordination

### Phase 3: Logic Extraction ⏳ (Future)
- ⏳ Bomb mechanics
- ⏳ Cloak mechanics
- ⏳ Wolf AI
- ⏳ Player movement

### Phase 4: State Migration ⏳ (Future)
- ⏳ Move state from gameState to hooks
- ⏳ Update all consumers
- ⏳ Remove state from gameState

---

## 📝 Integration Checklist

For each hook integration:

- [ ] **Understand Dependencies**
  - What does the hook need from gameState?
  - What does the hook provide?
  - What are the dependencies?

- [ ] **Choose Integration Pattern**
  - Simple extraction? → Pattern 1-3
  - State coordination? → Pattern 4
  - Logic extraction? → Pattern 5

- [ ] **Test Integration**
  - Does build pass?
  - Does game still work?
  - Are there regressions?

- [ ] **Update Documentation**
  - Document integration pattern used
  - Update integration status
  - Note any gotchas

- [ ] **Commit Incrementally**
  - Small, focused commits
  - Clear commit messages
  - Test after each commit

---

## 🔍 Integration Examples

### Example 1: Function Extraction ✅

**Before**:
```typescript
// In useGameState.ts
const generateLevel = () => {
  // 70+ lines of level generation logic
};

const initializeGame = () => {
  const levelData = generateLevel();
  // ...
};
```

**After**:
```typescript
// In useGameState.ts
const { generateLevel } = useLevelState();

const initializeGame = () => {
  const levelData = generateLevel(); // Same call!
  // ...
};
```

**Result**: Logic extracted, same interface ✅

---

### Example 2: Ref Extraction ✅

**Before**:
```typescript
// In useGameState.ts
const itemSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);
const cloakSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);
```

**After**:
```typescript
// In useGameState.ts
const { itemSpawnTimerRef, cloakSpawnTimerRef } = useInventoryState();
```

**Result**: Refs extracted, same usage ✅

---

### Example 3: Ref + Helpers ✅

**Before**:
```typescript
// In useGameState.ts
const gameStartTimeRef = useRef<number | null>(null);

// Later...
gameStartTimeRef.current = Date.now();
gameStartTimeRef.current = null;
```

**After**:
```typescript
// In useGameState.ts
const { gameStartTimeRef, setGameStartTime, clearGameStartTime } = useGameLifecycle();

// Later...
setGameStartTime(Date.now());
clearGameStartTime();
```

**Result**: Cleaner API, same functionality ✅

---

## 🚀 Next Integration Steps

### Recommended Order

1. **Continue useGameLifecycle** (Partial → More)
   - Extract temporary message helpers
   - Extract pause/toggle coordination

2. **Integrate useBombMechanics** (New)
   - Extract bomb logic
   - Coordinate explosion effects

3. **Integrate useCloakMechanics** (New)
   - Extract cloak logic
   - Coordinate invisibility state

4. **Integrate useWolfState** (New)
   - Extract wolf AI
   - Coordinate pathfinding

5. **Integrate usePlayerState** (New)
   - Extract player movement
   - Coordinate collision detection

---

## 💡 Best Practices

1. **Start Small** - Extract simple things first
2. **Test Often** - Verify after each step
3. **Keep Compatible** - Maintain existing interfaces
4. **Document Changes** - Note what changed and why
5. **Incremental Commits** - Small, focused commits

---

## ⚠️ Common Pitfalls

1. **State Duplication** - Don't duplicate state between hook and gameState
2. **Circular Dependencies** - Watch for hook dependencies on each other
3. **Performance** - Be mindful of re-renders and memoization
4. **Testing** - Test thoroughly after each integration

---

## 📚 Additional Resources

- `HOOK_REFACTORING_PLAN.md` - Original refactoring plan
- `REFACTORING_PROGRESS.md` - Current progress report
- `NEXT_STEPS.md` - Next steps overview

---

**Last Updated**: Current session
**Status**: Active integration in progress

