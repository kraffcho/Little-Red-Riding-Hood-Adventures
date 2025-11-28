import { Position, Direction } from "../types/game";
import { GRID_SIZE } from "../constants/gameConfig";

/**
 * checks if a position is within the grid boundaries
 */
export const isWithinBounds = (position: Position): boolean => {
  return (
    position.x >= 0 &&
    position.x < GRID_SIZE &&
    position.y >= 0 &&
    position.y < GRID_SIZE
  );
};

/**
 * checks if a position is valid (within bounds and not blocked by trees)
 */
export const isValidPosition = (
  position: Position,
  treePositions: Position[]
): boolean => {
  if (!isWithinBounds(position)) {
    return false;
  }

  return !treePositions.some(
    (treePos) => treePos.x === position.x && treePos.y === position.y
  );
};

/**
 * checks if two positions are the same
 */
export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

/**
 * calculates manhattan distance between two positions (for A* pathfinding)
 */
export const manhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

/**
 * checks if a position is next to any tree
 */
export const isAdjacentToTree = (
  position: Position,
  treePositions: Position[]
): boolean => {
  return treePositions.some(
    (treePos) =>
      Math.abs(treePos.x - position.x) <= 1 &&
      Math.abs(treePos.y - position.y) <= 1
  );
};

/**
 * gets the new position after moving in a given direction
 */
export const moveInDirection = (
  position: Position,
  direction: Direction
): Position => {
  const newPosition = { ...position };

  switch (direction) {
    case "up":
      newPosition.x -= 1;
      break;
    case "down":
      newPosition.x += 1;
      break;
    case "left":
      newPosition.y -= 1;
      break;
    case "right":
      newPosition.y += 1;
      break;
  }

  return newPosition;
};

/**
 * gets all positions next to this one (up, down, left, right)
 */
export const getAdjacentPositions = (position: Position): Position[] => {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 },
  ];
};

/**
 * figures out which direction to go from one position to another
 */
export const getDirectionFromMovement = (
  from: Position,
  to: Position
): Direction => {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "down" : "up";
  } else {
    return deltaY > 0 ? "right" : "left";
  }
};

