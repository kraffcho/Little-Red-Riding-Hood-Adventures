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

