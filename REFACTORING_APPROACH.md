# Refactoring Approach: Incremental Hook Extraction

## 🎯 Goal
Split the 1,022-line `useGameState.ts` into smaller, focused hooks while maintaining backward compatibility.

## ⚠️ Challenge
The hooks have **high interdependencies**:
- `movePlayer` updates: flowers, inventory, house state, player position, game over state
- `moveWolf` depends on: player position, tree positions, level state, invisibility
- Item spawning depends on: level state, player/wolf positions, inventory
- Everything depends on level state

## 🔄 Strategy: Incremental Integration

Instead of creating all hooks separately, we'll:

1. **Create hooks one at a time**
   - Start with most independent (`useLevelState`)
   - Test thoroughly before moving on

2. **Integrate into existing hook gradually**
   - Use new hooks INSIDE `useGameState`
   - Keep the same external API
   - Gradually migrate state/logic piece by piece

3. **Maintain backward compatibility**
   - `useGameState` still returns same interface
   - `App.tsx` doesn't need changes
   - No breaking changes

4. **Test after each step**
   - Build must succeed
   - Game must work
   - No regressions

## 📋 Current Status

### ✅ Phase 1: Preparation
- Created `HOOK_REFACTORING_PLAN.md` with detailed breakdown
- Created feature branch: `refactor/split-game-state-hook`
- Build successful ✅

### 🚧 Phase 2.1: Extract `useLevelState.ts` (In Progress)
- ✅ Created `useLevelState.ts` hook
- ⏳ Next: Integrate it into `useGameState.ts`
- ⏳ Test integration
- ⏳ Migrate level-related logic

## 🎯 Next Steps

1. **Use `useLevelState` in `useGameState`**
   - Import the hook
   - Use it alongside existing state (for now)
   - Gradually replace level logic with hook calls

2. **Test thoroughly**
   - Build must pass
   - Game must initialize correctly
   - Level generation must work
   - Flower collection must work

3. **Move to next hook**
   - Only after current hook is fully integrated and tested

## ⚠️ Reverting Strategy

If something breaks:
1. Check which hook caused the issue
2. Revert that specific hook integration
3. Fix the issue
4. Re-integrate and test

Git commits will be small and incremental, making reverts easy.

