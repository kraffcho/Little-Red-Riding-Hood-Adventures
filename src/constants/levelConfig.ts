// level-specific configuration
import { getNumTrees } from "./gameConfig";

export type LevelConfig = {
  level: number;
  numFlowers: number;
  enemyDelay: number;
  numTrees: number | ((width?: number) => number);
  bombUnlocked: boolean;
  cloakUnlocked: boolean;
  bombStunDuration: number;
  bombCooldown: number;
  cloakInvisibilityDuration: number;
  cloakCooldown: number;
};

export const getLevelConfig = (level: number, width?: number): LevelConfig => {
  const numTrees = typeof window !== "undefined"
    ? getNumTrees(width ?? window.innerWidth)
    : 60;

  switch (level) {
    case 1:
      return {
        level: 1,
        numFlowers: 20,
        enemyDelay: 500,
        numTrees,
        bombUnlocked: false,
        cloakUnlocked: false,
        bombStunDuration: 5000,
        bombCooldown: 5000,
        cloakInvisibilityDuration: 10000,
        cloakCooldown: 30000,
      };

    case 2:
      return {
        level: 2,
        numFlowers: 25,
        enemyDelay: 400,
        numTrees,
        bombUnlocked: true,
        cloakUnlocked: false,
        bombStunDuration: 5000,
        bombCooldown: 5000,
        cloakInvisibilityDuration: 10000,
        cloakCooldown: 30000,
      };

    case 3:
    default:
      return {
        level: level >= 3 ? level : 3,
        numFlowers: 30,
        enemyDelay: 350,
        numTrees: typeof numTrees === 'number' ? Math.floor(numTrees * 1.1) : numTrees,
        bombUnlocked: true,
        cloakUnlocked: true,
        bombStunDuration: 4000,
        bombCooldown: 7000,
        cloakInvisibilityDuration: 8000,
        cloakCooldown: 40000,
      };
  }
};

export const getUnlockedItem = (completedLevel: number): "bomb" | "cloak" | null => {
  if (completedLevel === 1) {
    return "bomb";
  }
  if (completedLevel === 2) {
    return "cloak";
  }
  return null;
};

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

