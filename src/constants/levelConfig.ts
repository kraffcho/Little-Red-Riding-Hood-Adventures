// level-specific configuration
import { getNumTrees } from "./gameConfig";

export type LevelConfig = {
  level: number;
  numFlowers: number;
  enemyDelay: number; // wolf movement delay in ms
  numTrees: number | ((width?: number) => number); // can be number or function for responsive
  bombUnlocked: boolean;
  cloakUnlocked: boolean;
  bombStunDuration: number;
  bombCooldown: number;
  cloakInvisibilityDuration: number;
  cloakCooldown: number;
};

/**
 * Get level-specific configuration
 */
export const getLevelConfig = (level: number, width?: number): LevelConfig => {
  const numTrees = typeof window !== "undefined"
    ? getNumTrees(width ?? window.innerWidth)
    : 60; // fallback for SSR

  switch (level) {
    case 1:
      return {
        level: 1,
        numFlowers: 20,
        enemyDelay: 500, // base speed
        numTrees,
        bombUnlocked: false, // bombs not available in level 1
        cloakUnlocked: false, // cloak not available in level 1
        bombStunDuration: 5000,
        bombCooldown: 5000,
        cloakInvisibilityDuration: 10000,
        cloakCooldown: 30000,
      };

    case 2:
      return {
        level: 2,
        numFlowers: 25,
        enemyDelay: 400, // 20% faster
        numTrees,
        bombUnlocked: true, // unlocked after level 1
        cloakUnlocked: false, // cloak not available in level 2
        bombStunDuration: 5000,
        bombCooldown: 5000,
        cloakInvisibilityDuration: 10000,
        cloakCooldown: 30000,
      };

    case 3:
    default:
      // level 3+ has both items unlocked
      return {
        level: level >= 3 ? level : 3,
        numFlowers: 30, // more flowers for level 3+
        enemyDelay: 350, // even faster
        numTrees: typeof numTrees === 'number' ? Math.floor(numTrees * 1.1) : numTrees, // 10% more trees
        bombUnlocked: true,
        cloakUnlocked: true, // unlocked after level 2
        bombStunDuration: 4000, // shorter stun
        bombCooldown: 7000, // longer cooldown
        cloakInvisibilityDuration: 8000, // shorter invisibility
        cloakCooldown: 40000, // longer cooldown
      };
  }
};

/**
 * Get what item is unlocked after completing a level
 */
export const getUnlockedItem = (completedLevel: number): "bomb" | "cloak" | null => {
  if (completedLevel === 1) {
    return "bomb";
  }
  if (completedLevel === 2) {
    return "cloak";
  }
  return null; // no new items unlocked after level 2
};

/**
 * Get unlock message for completed level
 */
export const getUnlockMessage = (completedLevel: number): string | null => {
  const item = getUnlockedItem(completedLevel);
  if (item === "bomb") {
    return "New Item Unlocked:\n💣 Bomb!";
  }
  if (item === "cloak") {
    return "New Item Unlocked:\n🧥 Hunter's Cloak!";
  }
  return null;
};

