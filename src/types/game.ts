// all the types we use for the game

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
  // special items system
  inventory: ItemType[];
  specialItems: SpecialItem[];
  wolfStunned: boolean;
  wolfStunEndTime: number | null;
  explosionEffect: ExplosionEffect | null;
  // level tracking
  currentLevel: number;
  // bomb cooldown
  bombCooldownEndTime: number | null;
  // temporary message to display (e.g., "WOLF STUNNED!", "MISSED!")
  temporaryMessage: { text: string; type: 'success' | 'error' } | null;
  // explosion marks - persistent dark spots where bombs exploded
  explosionMarks: ExplosionMark[];
  // wolf speed - decreases with each stun (wolf becomes faster)
  currentWolfDelay: number;
  wolfStunCount: number; // track how many times the wolf has been stunned (max 5 speed increases)
  // hunter's cloak system
  playerInvisible: boolean;
  cloakInvisibilityEndTime: number | null;
  cloakCooldownEndTime: number | null;
  cloakSpawned: boolean; // track if cloak has been spawned this level
};

export type AStarNode = {
  position: Position;
  g: number; // cost from the starting position
  h: number; // estimated cost to reach the goal
  parent: AStarNode | null;
};

export type TouchPosition = {
  x: number;
  y: number;
};

// special item types
export type ItemType = "bomb" | "health" | "speed" | "cloak"; // expandable for future items

export type SpecialItem = {
  id: string;
  type: ItemType;
  position: Position;
};

// explosion effect state
export type ExplosionEffect = {
  position: Position;
  radius: number;
  startTime: number;
  duration: number;
};

// explosion mark - persistent mark where bomb exploded
export type ExplosionMark = {
  position: Position;
  createdAt: number; // timestamp when the mark was created
};

