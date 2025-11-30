# Next Steps - Hook Integration Strategy

## ✅ Current Status

All 7 hook structures have been created and exported from `src/hooks/index.ts`:

1. ✅ **useLevelState** - Fully integrated (generateLevel function used)
2. ⚠️ **useInventoryState** - Partial integration (timer refs only)
3. 📦 **useGameLifecycle** - Structure ready (not yet integrated)
4. 📦 **useBombMechanics** - Structure ready (not yet integrated)
5. 📦 **useCloakMechanics** - Structure ready (not yet integrated)
6. 📦 **useWolfState** - Structure ready (not yet integrated)
7. 📦 **usePlayerState** - Structure ready (not yet integrated)

## 🎯 Integration Priority

### Phase 1: Independent Hooks (Easier)
- ✅ **useLevelState** - DONE
- 📦 **useGameLifecycle** - NEXT (manages independent lifecycle state)

### Phase 2: Mechanics Hooks (Moderate)
- 📦 **useBombMechanics** - Moderate complexity
- 📦 **useCloakMechanics** - Moderate complexity

### Phase 3: Entity Hooks (Complex)
- 📦 **useWolfState** - Complex dependencies (pathfinding, stun logic)
- 📦 **usePlayerState** - Most complex (collision, stuck detection, items)

### Phase 4: Complete Migration
- ⚠️ **useInventoryState** - Complete state migration

## 🔄 Integration Approach

### Pattern: Gradual Migration
1. **Start with functions only** (like useLevelState's generateLevel)
2. **Use hook functions** while keeping state in gameState for compatibility
3. **Gradually migrate state** to hooks
4. **Remove from gameState** once fully migrated

### Example: useLevelState Integration
```typescript
// ✅ Current approach
const { generateLevel } = useLevelState();
// State remains in gameState for backward compatibility
// Only using generateLevel function for now
```

## 📋 Next Integration: useGameLifecycle

### Why Next?
- **Independent**: Manages separate lifecycle concerns
- **Clear boundaries**: gameOver, paused, stuck, messages
- **Well-defined functions**: pause/unpause/toggle already exist

### Integration Steps
1. Import `useGameLifecycle` in `useGameState`
2. Use lifecycle functions (pauseGame, unpauseGame, togglePause)
3. Sync lifecycle state with gameState (for compatibility)
4. Gradually migrate state management

### Considerations
- `gameOver` affects many parts of the game
- `paused` affects player/wolf movement
- `temporaryMessage` needs to work with existing system
- Need to coordinate state updates

## 🚀 Recommended Next Actions

### Option A: Continue Integration
1. Integrate `useGameLifecycle` pause/toggle functions
2. Test thoroughly
3. Continue with other hooks

### Option B: Test Current State
1. Test `useLevelState` integration
2. Verify game works correctly
3. Gather feedback before continuing

### Option C: Refine Hook Structures
1. Review and refine hook interfaces
2. Ensure all dependencies are clear
3. Document integration patterns

## 📊 Progress Metrics

### Completed
- ✅ 7 hooks created and structured
- ✅ All hooks exported
- ✅ 1 hook partially integrated
- ✅ Build passing
- ✅ No breaking changes

### Remaining
- 📦 6 hooks need integration
- 📦 State migration needed
- 📦 Orchestrator pattern needed

## 💡 Integration Challenges

### State Synchronization
- Hooks have their own state
- gameState is a single object
- Need to coordinate updates

### Dependencies
- Hooks may depend on each other
- Need clear dependency order
- Circular dependencies to avoid

### Testing
- Test each integration step
- Ensure no regressions
- Verify game mechanics work

## 🎓 Lessons Learned

1. **Gradual is better** - Incremental integration reduces risk
2. **Functions first** - Start with functions, migrate state later
3. **Backward compatible** - Keep existing interfaces working
4. **Test often** - Verify after each step

## 📝 Notes

- All hooks are structured and ready
- Integration can be done incrementally
- No rush - quality over speed
- Each hook can be tested independently

