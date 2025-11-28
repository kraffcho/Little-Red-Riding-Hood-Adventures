import { Position } from "../types/game";
import { pathExists, findAllReachablePositions } from "./pathfinding";
import { PLAYER_START_POSITION, getGrannyHousePosition } from "../constants/gameConfig";
import { positionsEqual } from "./gridUtils";

/**
 * makes sure a level can actually be completed
 * checks that:
 * 1. all flowers can be reached from the start
 * 2. the house can be reached from the start
 * 3. the house can be reached from any flower position
 */
export const validateLevel = (
  treePositions: Position[],
  flowerPositions: Position[]
): { isValid: boolean; reason?: string } => {
  const grannyHousePosition = getGrannyHousePosition();

  // first, make sure we can reach the house from the start
  if (!pathExists(PLAYER_START_POSITION, grannyHousePosition, treePositions)) {
    return {
      isValid: false,
      reason: "House is not reachable from starting position",
    };
  }

  // next, make sure we can reach all flowers from the start
  for (const flower of flowerPositions) {
    if (!pathExists(PLAYER_START_POSITION, flower, treePositions)) {
      return {
        isValid: false,
        reason: `Flower at (${flower.x}, ${flower.y}) is not reachable from start`,
      };
    }
  }

  // also check that we can get to the house from each flower
  // this makes sure the player can actually finish the quest
  for (const flower of flowerPositions) {
    if (!pathExists(flower, grannyHousePosition, treePositions)) {
      return {
        isValid: false,
        reason: `House is not reachable from flower at (${flower.x}, ${flower.y})`,
      };
    }
  }

  // finally, make sure everything is connected using flood fill
  // this checks if all important spots are in one connected area
  const reachableFromStart = findAllReachablePositions(PLAYER_START_POSITION, treePositions);

  const posKey = (pos: Position) => `${pos.x},${pos.y}`;

  // make sure the house is reachable
  if (!reachableFromStart.has(posKey(grannyHousePosition))) {
    return {
      isValid: false,
      reason: "House is in a disconnected area",
    };
  }

  // make sure all flowers are reachable
  for (const flower of flowerPositions) {
    if (!reachableFromStart.has(posKey(flower))) {
      return {
        isValid: false,
        reason: `Flower at (${flower.x}, ${flower.y}) is in a disconnected area`,
      };
    }
  }

  return { isValid: true };
};

/**
 * checks if the player is stuck and can't reach remaining flowers or the house
 */
export const isPlayerStuck = (
  playerPosition: Position,
  remainingFlowers: Position[],
  treePositions: Position[],
  isHouseOpen: boolean
): { stuck: boolean; reason?: string } => {
  const grannyHousePosition = getGrannyHousePosition();

  // if the house is open and we can reach it, we're good
  if (isHouseOpen) {
    if (pathExists(playerPosition, grannyHousePosition, treePositions)) {
      return { stuck: false };
    } else {
      return {
        stuck: true,
        reason: "Cannot reach Granny's house from current position",
      };
    }
  }

  // if the house is still closed, check if we can reach any remaining flowers
  if (remainingFlowers.length === 0) {
    return {
      stuck: true,
      reason: "No flowers remaining but house is not open",
    };
  }

  // see if we can reach at least one flower
  for (const flower of remainingFlowers) {
    if (pathExists(playerPosition, flower, treePositions)) {
      return { stuck: false };
    }
  }

  return {
    stuck: true,
    reason: "Cannot reach any remaining flowers from current position",
  };
};

