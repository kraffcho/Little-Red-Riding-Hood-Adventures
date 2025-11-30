// export all the hooks from one place
export { useDebounce } from "./useDebounce";
export { useAudio } from "./useAudio";
export { useKeyboardInput, useSwipeInput } from "./useInput";
export { useGameState } from "./useGameState";

// new refactored hooks (available for gradual integration)
export { useLevelState } from "./useLevelState";
export { useInventoryState } from "./useInventoryState";
export { useGameLifecycle } from "./useGameLifecycle";
export { useBombMechanics } from "./useBombMechanics";
export { useCloakMechanics } from "./useCloakMechanics";
export { useWolfState } from "./useWolfState";
export { usePlayerState } from "./usePlayerState";

