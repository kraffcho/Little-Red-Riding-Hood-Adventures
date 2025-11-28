// utilities for special items system

import { Position, ItemType } from "../types/game";
import { GRID_SIZE } from "../constants/gameConfig";
import { isValidPosition } from "./gridUtils";

/**
 * generate a random valid position for a special item to spawn
 */
export const generateRandomItemPosition = (
  existingPositions: Position[],
  treePositions: Position[]
): Position | null => {
  // try to find a valid empty position
  const maxAttempts = 100;
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const position = { x, y };

    // make sure this position is not occupied by trees, existing items, or other entities
    const isOccupied = existingPositions.some(
      (p) => p.x === position.x && p.y === position.y
    );

    const hasTree = treePositions.some(
      (tree) => tree.x === position.x && tree.y === position.y
    );

    // also avoid player start position and house position
    const isPlayerStart = position.x === 0 && position.y === 0;
    const isHousePosition =
      position.x === GRID_SIZE - 1 && position.y === GRID_SIZE - 1;

    if (!isOccupied && !hasTree && !isPlayerStart && !isHousePosition && isValidPosition(position, treePositions)) {
      return position;
    }
  }

  return null; // couldn't find a valid position
};

/**
 * check if a position is within the explosion radius
 */
export const isWithinRadius = (
  position: Position,
  center: Position,
  radius: number
): boolean => {
  const distanceX = Math.abs(position.x - center.x);
  const distanceY = Math.abs(position.y - center.y);
  return distanceX <= radius && distanceY <= radius;
};

/**
 * get all positions within a radius for visual effect
 */
export const getPositionsInRadius = (
  center: Position,
  radius: number
): Position[] => {
  const positions: Position[] = [];
  for (let x = center.x - radius; x <= center.x + radius; x++) {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      if (
        x >= 0 &&
        x < GRID_SIZE &&
        y >= 0 &&
        y < GRID_SIZE &&
        isWithinRadius({ x, y }, center, radius)
      ) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
};

/**
 * generate a unique id for an item
 */
export const generateItemId = (): string => {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

