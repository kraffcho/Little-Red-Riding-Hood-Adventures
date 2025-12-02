import { Position } from "../types";
import { GRID_SIZE, NUM_TREES, NUM_FLOWERS, PLAYER_START_POSITION, getWolfStartPosition, getGrannyHousePosition } from "../constants/gameConfig";
import { isAdjacentToTree, isValidPosition } from "./gridUtils";
import { positionsEqual } from "./gridUtils";
import { validateLevel } from "./levelValidation";

// generates random tree positions avoiding key game locations
export const generateTreePositions = (
  wolfPosition: Position,
  grannyHousePosition: Position,
  gridSize: number = GRID_SIZE,
  numTrees: number = NUM_TREES
): Position[] => {
  const treePositions: Position[] = [];
  const excludedPositions = new Set<string>();

  excludedPositions.add(`${PLAYER_START_POSITION.x},${PLAYER_START_POSITION.y}`);
  excludedPositions.add(`${wolfPosition.x},${wolfPosition.y}`);

  // keep area around granny's house clear
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const x = grannyHousePosition.x + dx;
      const y = grannyHousePosition.y + dy;
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        excludedPositions.add(`${x},${y}`);
      }
    }
  }

  for (let i = 0; i < numTrees; i++) {
    let position: Position;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      position = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      attempts++;
    } while (
      excludedPositions.has(`${position.x},${position.y}`) &&
      attempts < maxAttempts
    );

    if (attempts < maxAttempts) {
      treePositions.push(position);
      excludedPositions.add(`${position.x},${position.y}`);
    }
  }

  return treePositions;
};

/**
 * places flowers randomly but keeps them away from trees
 */
export const generateFlowerPositions = (
  treePositions: Position[],
  gridSize: number = GRID_SIZE,
  grannyHousePosition: Position,
  numFlowers: number = NUM_FLOWERS
): Position[] => {
  const availablePositions: Position[] = [];

  // find all spots where flowers can go
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const position: Position = { x, y };

      // skip the player start, granny's house, and spots next to trees
      if (
        !positionsEqual(position, PLAYER_START_POSITION) &&
        !positionsEqual(position, grannyHousePosition) &&
        !isAdjacentToTree(position, treePositions)
      ) {
        availablePositions.push(position);
      }
    }
  }

  // pick some random spots for the flowers
  const flowerPositions: Position[] = [];
  const flowersToPlace = Math.min(numFlowers, availablePositions.length);
  const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);

  for (let i = 0; i < flowersToPlace; i++) {
    flowerPositions.push(shuffled[i]);
  }

  return flowerPositions;
};

/**
 * keeps generating levels until we get one that can actually be completed
 * returns the tree and flower positions that make a solvable level
 */
export const generateValidLevel = (
  wolfPosition: Position,
  grannyHousePosition: Position,
  gridSize: number = GRID_SIZE,
  numTrees: number = NUM_TREES,
  numFlowers: number = NUM_FLOWERS,
  maxAttempts: number = 50
): { treePositions: Position[]; flowerPositions: Position[] } | null => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // place trees randomly
    const treePositions = generateTreePositions(wolfPosition, grannyHousePosition, gridSize, numTrees);

    // place flowers randomly
    const flowerPositions = generateFlowerPositions(treePositions, gridSize, grannyHousePosition, numFlowers);

    // make sure this level is actually playable
    const validation = validateLevel(treePositions, flowerPositions, grannyHousePosition, gridSize);

    if (validation.isValid) {
      return { treePositions, flowerPositions };
    }
  }

  // if we couldn't make a good level after trying a bunch, return null
  // (outer loop will retry, so we don't need to warn here - it's expected with high tree density)
  return null;
};

