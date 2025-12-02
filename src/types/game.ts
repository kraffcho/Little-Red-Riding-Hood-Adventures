export type Position = {
  x: number;
  y: number;
};

export type Direction = "up" | "down" | "left" | "right";

export type GameEntity = {
  position: Position;
  direction: Direction;
};

export type GameState = {
  playerPosition: Position;
  wolfPosition: Position;
  playerDirection: Direction;
  wolfDirection: Direction;
  treePositions: Position[];
  flowers: Position[];
  grannyHousePosition: Position;
  collectedFlowers: number;
  isHouseOpen: boolean;
  playerEnteredHouse: boolean;
  playerCanMove: boolean;
  wolfMoving: boolean;
  wolfWon: boolean;
  gameOver: boolean;
  isStuck?: boolean;
  stuckReason?: string;
  gridSize: number;
  inventory: ItemType[];
  specialItems: SpecialItem[];
  wolfStunned: boolean;
  wolfStunEndTime: number | null;
  explosionEffect: ExplosionEffect | null;
  currentLevel: number;
  bombCooldownEndTime: number | null;
  temporaryMessage: { text: string; type: 'success' | 'error' } | null;
  explosionMarks: ExplosionMark[];
  currentWolfDelay: number;
  wolfStunCount: number;
  playerInvisible: boolean;
  cloakInvisibilityEndTime: number | null;
  cloakCooldownEndTime: number | null;
  cloakSpawned: boolean;
  paused: boolean;
};

export type AStarNode = {
  position: Position;
  g: number;
  h: number;
  parent: AStarNode | null;
};

export type TouchPosition = {
  x: number;
  y: number;
};

export type ItemType = "bomb" | "health" | "speed" | "cloak";

export type SpecialItem = {
  id: string;
  type: ItemType;
  position: Position;
};

export type ExplosionEffect = {
  position: Position;
  radius: number;
  startTime: number;
  duration: number;
};

export type ExplosionMark = {
  position: Position;
  createdAt: number;
};

