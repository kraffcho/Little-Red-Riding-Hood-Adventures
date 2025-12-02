import { Position, Direction } from "../types";
import { GRID_SIZE } from "../constants/gameConfig";

export const isWithinBounds = (position: Position, gridSize: number = GRID_SIZE): boolean => {
  return (
    position.x >= 0 &&
    position.x < gridSize &&
    position.y >= 0 &&
    position.y < gridSize
  );
};

export const isValidPosition = (
  position: Position,
  treePositions: Position[],
  gridSize: number = GRID_SIZE
): boolean => {
  if (!isWithinBounds(position, gridSize)) {
    return false;
  }

  return !treePositions.some(
    (treePos) => treePos.x === position.x && treePos.y === position.y
  );
};

export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

// calculates manhattan distance for A* pathfinding heuristic
export const manhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

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

