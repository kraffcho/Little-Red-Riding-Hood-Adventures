import { useState, useCallback } from "react";
import { Position, Direction } from "../types";
import {
  PLAYER_START_POSITION,
} from "../constants/gameConfig";
import { getLevelConfig } from "../constants/levelConfig";
import {
  moveInDirection,
  isValidPosition,
  positionsEqual,
  isPlayerStuck,
} from "../utils";

/**
 * Hook that manages player state: position, movement, house entry, and movement permissions
 */
export const usePlayerState = () => {
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: -1, y: -1 });
  const [playerDirection, setPlayerDirection] = useState<Direction>("down");
  const [playerCanMove, setPlayerCanMove] = useState<boolean>(true);
  const [playerEnteredHouse, setPlayerEnteredHouse] = useState<boolean>(false);
  const [isHouseOpen, setIsHouseOpen] = useState<boolean>(false);

  /**
   * Set player position
   */
  const setPlayerPositionState = useCallback((position: Position) => {
    setPlayerPosition(position);
  }, []);

  /**
   * Set player direction
   */
  const setPlayerDirectionState = useCallback((direction: Direction) => {
    setPlayerDirection(direction);
  }, []);

  /**
   * Set player can move state
   */
  const setPlayerCanMoveState = useCallback((canMove: boolean) => {
    setPlayerCanMove(canMove);
  }, []);

  /**
   * Open the house (when all flowers collected)
   */
  const openHouse = useCallback(() => {
    setIsHouseOpen(true);
  }, []);

  /**
   * Set player entered house state
   */
  const setPlayerEnteredHouseState = useCallback((entered: boolean) => {
    setPlayerEnteredHouse(entered);
    if (entered) {
      setPlayerCanMove(false);
    }
  }, []);

  /**
   * Move player in a direction - returns movement result
   */
  const movePlayer = useCallback((context: {
    direction: Direction;
    treePositions: Position[];
    gridSize: number;
    wolfPosition: Position;
    playerInvisible: boolean;
    grannyHousePosition: Position;
    flowers: Position[];
    collectedFlowers: number;
    isHouseOpen: boolean;
    gameOver: boolean;
    paused: boolean;
    currentLevel: number;
  }): {
    success: boolean;
    newPosition?: Position;
    collectedFlower?: boolean;
    enteredHouse?: boolean;
    collision?: boolean;
    stuck?: boolean;
    stuckReason?: string;
  } => {
    if (!playerCanMove || context.paused || context.gameOver) {
      return { success: false };
    }

    const newPosition = moveInDirection(playerPosition, context.direction);

    // check if position is valid (not a tree or out of bounds)
    if (!isValidPosition(newPosition, context.treePositions, context.gridSize)) {
      return { success: false };
    }

    // when player is invisible, treat wolf as an obstacle
    if (context.playerInvisible && positionsEqual(newPosition, context.wolfPosition)) {
      return { success: false };
    }

    // check if trying to enter house before it's open
    if (
      positionsEqual(newPosition, context.grannyHousePosition) &&
      !context.isHouseOpen
    ) {
      return { success: false };
    }

    // check for flower collection
    const flowerIndex = context.flowers.findIndex(
      (flower) => flower.x === newPosition.x && flower.y === newPosition.y
    );
    const collectedFlower = flowerIndex !== -1;

    // check if all flowers collected (house should open) - use level-specific count
    const levelConfig = getLevelConfig(context.currentLevel);
    const totalFlowers = levelConfig.numFlowers;
    const newCollectedFlowers = context.collectedFlowers + (collectedFlower ? 1 : 0);
    const allFlowersCollected = newCollectedFlowers === totalFlowers;
    const houseShouldBeOpen = allFlowersCollected || context.isHouseOpen;

    // check if player entered house
    const enteredHouse =
      positionsEqual(newPosition, context.grannyHousePosition) &&
      houseShouldBeOpen;

    // check for collision with wolf (only if player is visible)
    const collision = positionsEqual(newPosition, context.wolfPosition) && !context.playerInvisible;

    // check if player would be stuck at new position
    const remainingFlowers = collectedFlower
      ? context.flowers.filter((_, index) => index !== flowerIndex)
      : context.flowers;

    const stuckCheck = isPlayerStuck(
      newPosition,
      remainingFlowers,
      context.treePositions,
      context.grannyHousePosition,
      houseShouldBeOpen,
      context.gridSize,
      newCollectedFlowers,
      totalFlowers
    );

    return {
      success: true,
      newPosition,
      collectedFlower,
      enteredHouse,
      collision,
      stuck: stuckCheck.stuck,
      stuckReason: stuckCheck.reason,
    };
  }, [playerPosition, playerCanMove]);

  /**
   * Reset player state
   */
  const resetPlayerState = useCallback(() => {
    setPlayerPosition(PLAYER_START_POSITION);
    setPlayerDirection("down");
    setPlayerCanMove(true);
    setPlayerEnteredHouse(false);
    setIsHouseOpen(false);
  }, []);

  /**
   * Initialize player to starting position
   */
  const initializePlayer = useCallback(() => {
    setPlayerPosition(PLAYER_START_POSITION);
    setPlayerDirection("down");
    setPlayerCanMove(true);
    setPlayerEnteredHouse(false);
    setIsHouseOpen(false);
  }, []);

  return {
    // State
    playerPosition,
    playerDirection,
    playerCanMove,
    playerEnteredHouse,
    isHouseOpen,

    // Actions
    setPlayerPositionState,
    setPlayerDirectionState,
    setPlayerCanMoveState,
    openHouse,
    setPlayerEnteredHouseState,
    movePlayer,
    resetPlayerState,
    initializePlayer,

    // Setters (for direct state updates)
    setPlayerPosition,
    setPlayerDirection,
    setPlayerCanMove,
    setPlayerEnteredHouse,
    setIsHouseOpen,
  };
};

