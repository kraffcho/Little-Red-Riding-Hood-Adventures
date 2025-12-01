import { useState, useCallback } from "react";
import { Position, Direction } from "../types";
import {
  ENEMY_DELAY,
  WOLF_SPEED_INCREASE_PERCENTAGE,
  MAX_WOLF_SPEED_INCREASES,
} from "../constants/gameConfig";
import { findPath, getDirectionFromMovement, positionsEqual } from "../utils";

/**
 * Hook that manages wolf state: position, movement, pathfinding, stun mechanics, and speed
 */
export const useWolfState = () => {
  const [wolfPosition, setWolfPosition] = useState<Position>({ x: -1, y: -1 });
  const [wolfDirection, setWolfDirection] = useState<Direction>("down");
  const [wolfMoving, setWolfMoving] = useState<boolean>(true);
  const [wolfStunned, setWolfStunned] = useState<boolean>(false);
  const [wolfStunEndTime, setWolfStunEndTime] = useState<number | null>(null);
  const [currentWolfDelay, setCurrentWolfDelay] = useState<number>(ENEMY_DELAY);
  const [wolfStunCount, setWolfStunCount] = useState<number>(0);
  const [wolfWon, setWolfWon] = useState<boolean>(false);

  /**
   * Set wolf position
   */
  const setWolfPositionState = useCallback((position: Position) => {
    setWolfPosition(position);
  }, []);

  /**
   * Set wolf direction
   */
  const setWolfDirectionState = useCallback((direction: Direction) => {
    setWolfDirection(direction);
  }, []);

  /**
   * Set wolf moving state
   */
  const setWolfMovingState = useCallback((moving: boolean) => {
    setWolfMoving(moving);
  }, []);

  /**
   * Stun the wolf
   */
  const stunWolf = useCallback((stunDuration: number) => {
    setWolfStunned(true);
    setWolfStunEndTime(Date.now() + stunDuration);
    setWolfMoving(false);
  }, []);

  /**
   * Wake up wolf from stun and optionally increase speed
   */
  const wakeWolf = useCallback(() => {
    setWolfStunned(false);
    setWolfStunEndTime(null);
    
    // increase speed if we haven't reached max speed increases
    if (wolfStunCount < MAX_WOLF_SPEED_INCREASES) {
      setCurrentWolfDelay((prev) => prev * (1 - WOLF_SPEED_INCREASE_PERCENTAGE));
      setWolfStunCount((prev) => prev + 1);
    }
  }, [wolfStunCount]);

  /**
   * Move wolf toward player using pathfinding
   */
  const moveWolf = useCallback((context: {
    playerPosition: Position;
    treePositions: Position[];
    gridSize: number;
    gameOver: boolean;
    isStuck: boolean;
    playerInvisible: boolean;
    isHouseOpen: boolean;
    playerInHouse: boolean;
  }): {
    newPosition: Position | null;
    direction: Direction;
    collision: boolean;
    stuck: boolean;
  } => {
    if (
      !wolfMoving ||
      context.gameOver ||
      context.isStuck ||
      wolfStunned ||
      context.playerInvisible
    ) {
      return {
        newPosition: null,
        direction: wolfDirection,
        collision: false,
        stuck: false,
      };
    }

    // don't chase if player is safe in the house
    if (
      context.isHouseOpen &&
      context.playerInHouse
    ) {
      return {
        newPosition: null,
        direction: wolfDirection,
        collision: false,
        stuck: false,
      };
    }

    const nextPosition = findPath(
      wolfPosition,
      context.playerPosition,
      context.treePositions,
      context.gridSize
    );

    if (!nextPosition) {
      // check if we're already at the same position (collision)
      const collision = positionsEqual(wolfPosition, context.playerPosition) && !context.playerInvisible;
      
      if (collision) {
        return {
          newPosition: wolfPosition,
          direction: wolfDirection,
          collision: true,
          stuck: false,
        };
      }

      // wolf can't find a path - stuck
      return {
        newPosition: wolfPosition,
        direction: wolfDirection,
        collision: false,
        stuck: true,
      };
    }

    const newDirection = getDirectionFromMovement(wolfPosition, nextPosition);
    const collision = positionsEqual(nextPosition, context.playerPosition);

    return {
      newPosition: nextPosition,
      direction: newDirection,
      collision,
      stuck: false,
    };
  }, [wolfPosition, wolfDirection, wolfMoving, wolfStunned]);

  /**
   * Reset wolf speed to base delay
   */
  const resetWolfSpeed = useCallback(() => {
    setCurrentWolfDelay(ENEMY_DELAY);
    setWolfStunCount(0);
  }, []);

  /**
   * Reset all wolf state
   */
  const resetWolfState = useCallback(() => {
    setWolfPosition({ x: -1, y: -1 });
    setWolfDirection("down");
    setWolfMoving(true);
    setWolfStunned(false);
    setWolfStunEndTime(null);
    setCurrentWolfDelay(ENEMY_DELAY);
    setWolfStunCount(0);
    setWolfWon(false);
  }, []);

  return {
    // State
    wolfPosition,
    wolfDirection,
    wolfMoving,
    wolfStunned,
    wolfStunEndTime,
    currentWolfDelay,
    wolfStunCount,
    wolfWon,
    
    // Actions
    setWolfPositionState,
    setWolfDirectionState,
    setWolfMovingState,
    stunWolf,
    wakeWolf,
    moveWolf,
    resetWolfSpeed,
    resetWolfState,
    
    // Setters (for direct state updates)
    setWolfPosition,
    setWolfDirection,
    setWolfMoving,
    setWolfStunned,
    setWolfStunEndTime,
    setCurrentWolfDelay,
    setWolfStunCount,
    setWolfWon,
  };
};

