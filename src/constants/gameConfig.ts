// all the game settings and constants

export const GRID_SIZE = 20;
export const NUM_TREES = 60;
export const NUM_FLOWERS = 30;
export const PLAYER_DELAY = 100; // how long to wait between player moves
export const ENEMY_DELAY = 500; // how often the wolf moves
export const DEFAULT_VOLUME = 0.3;

// where things start on the grid
export const PLAYER_START_POSITION = { x: 0, y: 0 };
export const getWolfStartPosition = () => ({
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
});
export const getGrannyHousePosition = () => ({
  x: GRID_SIZE - 1,
  y: GRID_SIZE - 1,
});

// paths to all the sound files
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
} as const;

// cookie names for storing settings
export const COOKIE_KEYS = {
  BACKGROUND_MUSIC_PAUSED: "backgroundMusicPaused",
} as const;

// special items configuration
export const ITEM_SPAWN_DELAY = 20000; // 20 seconds in milliseconds
export const MAX_BOMBS_ON_MAP = 3; // maximum number of bombs that can be on the map at the same time
export const BOMB_STUN_DURATION = 5000; // 5 seconds in milliseconds
export const BOMB_EXPLOSION_RADIUS = 3; // 3 tiles in each direction
export const BOMB_EXPLOSION_DURATION = 1000; // 1 second visual effect
export const BOMB_COOLDOWN_DURATION = 5000; // 5 seconds cooldown before next bomb can be used
export const EXPLOSION_MARK_DURATION = 3000; // 3 seconds before explosion mark disappears

// wolf speed increase after stun
export const WOLF_SPEED_INCREASE_PERCENTAGE = 0.1; // 10% speed increase (delay reduction) per stun
export const MAX_WOLF_SPEED_INCREASES = 5; // maximum number of times the wolf can get faster

