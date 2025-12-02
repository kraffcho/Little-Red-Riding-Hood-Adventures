// utilities for special items system

import { Position, ItemType } from "../types";
import { GRID_SIZE } from "../constants/gameConfig";
import { isValidPosition } from "./gridUtils";

// finds a random empty position for spawning special items
export const generateRandomItemPosition = (
  existingPositions: Position[],
  treePositions: Position[],
  gridSize: number = GRID_SIZE,
  grannyHousePosition: Position
): Position | null => {
  const maxAttempts = 100;
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const position = { x, y };

    const isOccupied = existingPositions.some(
      (p) => p.x === position.x && p.y === position.y
    );

    const hasTree = treePositions.some(
      (tree) => tree.x === position.x && tree.y === position.y
    );

    const isPlayerStart = position.x === 0 && position.y === 0;
    const isHousePosition =
      position.x === grannyHousePosition.x && position.y === grannyHousePosition.y;

    if (!isOccupied && !hasTree && !isPlayerStart && !isHousePosition && isValidPosition(position, treePositions, gridSize)) {
      return position;
    }
  }

  return null;
};

export const isWithinRadius = (
  position: Position,
  center: Position,
  radius: number
): boolean => {
  const distanceX = Math.abs(position.x - center.x);
  const distanceY = Math.abs(position.y - center.y);
  return distanceX <= radius && distanceY <= radius;
};

export const getPositionsInRadius = (
  center: Position,
  radius: number,
  gridSize: number = GRID_SIZE
): Position[] => {
  const positions: Position[] = [];
  for (let x = center.x - radius; x <= center.x + radius; x++) {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      if (
        x >= 0 &&
        x < gridSize &&
        y >= 0 &&
        y < gridSize &&
        isWithinRadius({ x, y }, center, radius)
      ) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
};

export const generateItemId = (): string => {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

