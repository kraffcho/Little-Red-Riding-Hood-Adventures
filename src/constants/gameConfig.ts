// game configuration and constants

export const GRID_SIZE_DESKTOP = 20;
export const NUM_TREES_DESKTOP = 60;

export const GRID_SIZE_MOBILE = 15;
export const NUM_TREES_MOBILE = 40;

// responsive grid size based on viewport width
export const getGridSize = (width?: number): number => {
  const viewportWidth = width ?? (typeof window !== "undefined" ? window.innerWidth : GRID_SIZE_DESKTOP);
  if (viewportWidth < 420) {
    return GRID_SIZE_MOBILE;
  }
  return GRID_SIZE_DESKTOP;
};

export const getNumTrees = (width?: number): number => {
  const viewportWidth = width ?? (typeof window !== "undefined" ? window.innerWidth : NUM_TREES_DESKTOP);
  if (viewportWidth < 420) {
    return NUM_TREES_MOBILE;
  }
  return NUM_TREES_DESKTOP;
};

export const GRID_SIZE = GRID_SIZE_DESKTOP;
export const NUM_TREES = NUM_TREES_DESKTOP;

export const NUM_FLOWERS = 30;
export const PLAYER_DELAY = 100;
export const ENEMY_DELAY = 500;
export const DEFAULT_VOLUME = 0.3;

export const PLAYER_START_POSITION = { x: 0, y: 0 };
export const getWolfStartPosition = (gridSize?: number) => {
  const size = gridSize ?? GRID_SIZE_DESKTOP;
  return {
    x: Math.floor(size / 2),
    y: Math.floor(size / 2),
  };
};
export const getGrannyHousePosition = (gridSize?: number) => {
  const size = gridSize ?? GRID_SIZE_DESKTOP;
  return {
    x: size - 1,
    y: size - 1,
  };
};

export const AUDIO_PATHS = {
  BACKGROUND_MUSIC: "/assets/audio/background.mp3",
  COLLECT_ITEM: "/assets/audio/collect-item.mp3",
  QUEST_COMPLETED: "/assets/audio/quest-completed.mp3",
  MENU_TOGGLE: "/assets/audio/menu-toggle.mp3",
  RESTRICTED_ENTRY: "/assets/audio/restricted-entry.mp3",
  WOLF_VICTORY: [
    "/assets/audio/wolf-victory1.mp3",
    "/assets/audio/wolf-victory2.mp3",
    "/assets/audio/wolf-victory3.mp3",
  ],
  BOMB_EXPLOSION: [
    "/assets/audio/bomb-explosion1.mp3",
    "/assets/audio/bomb-explosion2.mp3",
    "/assets/audio/bomb-explosion3.mp3",
  ],
  COLLECT_BOMB: "/assets/audio/collect-bomb.mp3",
  WOLF_HOWL: "/assets/audio/wolf-howl.mp3",
  USE_CLOAK: "/assets/audio/use-cloak.mp3",
} as const;

export const COOKIE_KEYS = {
  BACKGROUND_MUSIC_PAUSED: "backgroundMusicPaused",
} as const;

// bomb mechanics
export const ITEM_SPAWN_DELAY = 20000;
export const MAX_BOMBS_ON_MAP = 3;
export const BOMB_STUN_DURATION = 5000;
export const BOMB_EXPLOSION_RADIUS = 3;
export const BOMB_EXPLOSION_DURATION = 1000;
export const BOMB_COOLDOWN_DURATION = 5000;
export const EXPLOSION_MARK_DURATION = 3000;

// wolf gets 10% faster after each stun (max 5 times)
export const WOLF_SPEED_INCREASE_PERCENTAGE = 0.1;
export const MAX_WOLF_SPEED_INCREASES = 5;

// hunter's cloak mechanics
export const CLOAK_SPAWN_DELAY_MIN = 20000;
export const CLOAK_SPAWN_DELAY_MAX = 40000;
export const CLOAK_INVISIBILITY_DURATION = 10000;
export const CLOAK_COOLDOWN_DURATION = 30000;
export const CLOAK_WOLF_CONFUSION_INTERVAL = 2000;

export { getLevelConfig, getUnlockedItem, getUnlockMessage } from "./levelConfig";

