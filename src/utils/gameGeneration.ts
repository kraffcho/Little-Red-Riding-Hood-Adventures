import { Position } from "../types/game";
import { GRID_SIZE, NUM_TREES, NUM_FLOWERS, PLAYER_START_POSITION, getWolfStartPosition, getGrannyHousePosition } from "../constants/gameConfig";
import { isAdjacentToTree, isValidPosition } from "./gridUtils";
import { positionsEqual } from "./gridUtils";
import { validateLevel } from "./levelValidation";

/**
 * places trees randomly around the grid
 */
export const generateTreePositions = (
  wolfPosition: Position,
  grannyHousePosition: Position
): Position[] => {
  const treePositions: Position[] = [];
  const excludedPositions = new Set<string>();

  // keep track of spots we can't use
  excludedPositions.add(`${PLAYER_START_POSITION.x},${PLAYER_START_POSITION.y}`);
  excludedPositions.add(`${wolfPosition.x},${wolfPosition.y}`);

  // don't put trees next to granny's house
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const x = grannyHousePosition.x + dx;
      const y = grannyHousePosition.y + dy;
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        excludedPositions.add(`${x},${y}`);
      }
    }
  }

  for (let i = 0; i < NUM_TREES; i++) {
    let position: Position;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
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
  treePositions: Position[]
): Position[] => {
  const availablePositions: Position[] = [];
  const grannyHousePosition = getGrannyHousePosition();

  // find all spots where flowers can go
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
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
  const numFlowers = Math.min(NUM_FLOWERS, availablePositions.length);
  const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);

  for (let i = 0; i < numFlowers; i++) {
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
  maxAttempts: number = 50
): { treePositions: Position[]; flowerPositions: Position[] } | null => {
  const grannyHousePosition = getGrannyHousePosition();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // place trees randomly
    const treePositions = generateTreePositions(wolfPosition, grannyHousePosition);

    // place flowers randomly
    const flowerPositions = generateFlowerPositions(treePositions);

    // make sure this level is actually playable
    const validation = validateLevel(treePositions, flowerPositions);

    if (validation.isValid) {
      return { treePositions, flowerPositions };
    }
  }

  // if we couldn't make a good level after trying a bunch, return null
  // (outer loop will retry, so we don't need to warn here - it's expected with high tree density)
  return null;
};

