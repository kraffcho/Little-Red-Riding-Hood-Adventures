import { useState, useEffect, useCallback } from "react";
import { Position, Direction, GameState } from "../types/game";
import {
  GRID_SIZE,
  NUM_FLOWERS,
  PLAYER_START_POSITION,
  getWolfStartPosition,
  getGrannyHousePosition,
} from "../constants/gameConfig";
import {
  isValidPosition,
  moveInDirection,
  positionsEqual,
  getDirectionFromMovement,
} from "../utils/gridUtils";
import { findPath } from "../utils/pathfinding";
import { generateValidLevel } from "../utils/gameGeneration";
import { isPlayerStuck } from "../utils/levelValidation";

/**
 * hook that handles all the game state and logic
 */
export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPosition: { x: -1, y: -1 },
    wolfPosition: { x: -1, y: -1 },
    playerDirection: "down",
    wolfDirection: "down",
    treePositions: [],
    flowers: [],
    grannyHousePosition: { x: -1, y: -1 },
    collectedFlowers: 0,
    isHouseOpen: false,
    playerEnteredHouse: false,
    playerCanMove: true,
    wolfMoving: true,
    wolfWon: false,
    gameOver: false,
  });

  // set up a new game
  const initializeGame = useCallback(() => {
    const wolfStartPosition = getWolfStartPosition();
    const grannyHousePosition = getGrannyHousePosition();

    // create a level that can actually be completed
    const levelData = generateValidLevel(wolfStartPosition);

    if (!levelData) {
      console.error("Failed to generate valid level, using fallback");
      // fallback: use empty level if we couldn't generate a valid one (shouldn't happen)
      setGameState((prev) => ({
        ...prev,
        playerPosition: PLAYER_START_POSITION,
        wolfPosition: wolfStartPosition,
        grannyHousePosition,
        treePositions: [],
        flowers: [],
        collectedFlowers: 0,
        isHouseOpen: false,
        playerEnteredHouse: false,
        playerCanMove: true,
        wolfMoving: true,
        wolfWon: false,
        gameOver: false,
        playerDirection: "down",
        wolfDirection: "down",
        isStuck: false,
        stuckReason: undefined,
      }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      playerPosition: PLAYER_START_POSITION,
      wolfPosition: wolfStartPosition,
      grannyHousePosition,
      treePositions: levelData.treePositions,
      flowers: levelData.flowerPositions,
      collectedFlowers: 0,
      isHouseOpen: false,
      playerEnteredHouse: false,
      playerCanMove: true,
      wolfMoving: true,
      wolfWon: false,
      gameOver: false,
      playerDirection: "down",
      wolfDirection: "down",
      isStuck: false,
      stuckReason: undefined,
    }));
  }, []);

  // start the game when component loads
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // move the player in the given direction
  const movePlayer = useCallback(
    (direction: Direction) => {
      setGameState((prev) => {
        if (!prev.playerCanMove) return prev;

        const newPosition = moveInDirection(prev.playerPosition, direction);

        // make sure we can actually move here
        if (!isValidPosition(newPosition, prev.treePositions)) {
          return prev;
        }

        // block entry if trying to get into the house before finishing the quest
        if (
          positionsEqual(newPosition, prev.grannyHousePosition) &&
          !prev.isHouseOpen
        ) {
          return prev;
        }

        // see if we picked up a flower
        const flowerIndex = prev.flowers.findIndex(
          (flower) =>
            flower.x === newPosition.x && flower.y === newPosition.y
        );
        const hasFlower = flowerIndex !== -1;
        const newFlowers = hasFlower
          ? prev.flowers.filter((_, index) => index !== flowerIndex)
          : prev.flowers;
        const newCollectedFlowers = hasFlower
          ? prev.collectedFlowers + 1
          : prev.collectedFlowers;

        // check if we got all the flowers
        const allFlowersCollected = newCollectedFlowers === NUM_FLOWERS;
        const isHouseOpen = allFlowersCollected || prev.isHouseOpen;

        // see if we made it into the house
        const playerEnteredHouse =
          positionsEqual(newPosition, prev.grannyHousePosition) &&
          isHouseOpen;

        // check if the wolf got us
        const collision = positionsEqual(newPosition, prev.wolfPosition);
        const wolfWon = collision;

        // make sure we didn't trap ourselves
        const stuckCheck = isPlayerStuck(
          newPosition,
          newFlowers,
          prev.treePositions,
          isHouseOpen
        );

        return {
          ...prev,
          playerPosition: newPosition,
          playerDirection: direction,
          flowers: newFlowers,
          collectedFlowers: newCollectedFlowers,
          isHouseOpen,
          playerEnteredHouse,
          wolfMoving: playerEnteredHouse ? false : prev.wolfMoving,
          playerCanMove: !wolfWon && !stuckCheck.stuck && !playerEnteredHouse,
          wolfWon,
          gameOver: wolfWon || stuckCheck.stuck,
          isStuck: stuckCheck.stuck,
          stuckReason: stuckCheck.reason,
        };
      });
    },
    []
  );

  // move the wolf toward the player using pathfinding
  const moveWolf = useCallback(() => {
    setGameState((prev) => {
      if (!prev.wolfMoving || prev.gameOver) return prev;

      // don't chase if player is safe in the house
      if (
        prev.isHouseOpen &&
        positionsEqual(prev.playerPosition, prev.grannyHousePosition)
      ) {
        return prev;
      }

      const nextPosition = findPath(
        prev.wolfPosition,
        prev.playerPosition,
        prev.treePositions
      );

      if (!nextPosition) {
        // we're already there or can't find a path
        const collision = positionsEqual(prev.wolfPosition, prev.playerPosition);
        return {
          ...prev,
          playerCanMove: !collision,
          wolfWon: collision,
          gameOver: collision,
        };
      }

      const wolfDirection = getDirectionFromMovement(
        prev.wolfPosition,
        nextPosition
      );

      // see if we caught the player
      const collision = positionsEqual(nextPosition, prev.playerPosition);

      return {
        ...prev,
        wolfPosition: nextPosition,
        wolfDirection,
        playerCanMove: !collision,
        wolfWon: collision,
        gameOver: collision,
      };
    });
  }, []);

  // start over from the beginning
  const resetGame = useCallback(() => {
    setGameState({
      playerPosition: { x: -1, y: -1 },
      wolfPosition: { x: -1, y: -1 },
      playerDirection: "down",
      wolfDirection: "down",
      treePositions: [],
      flowers: [],
      grannyHousePosition: { x: -1, y: -1 },
      collectedFlowers: 0,
      isHouseOpen: false,
      playerEnteredHouse: false,
      playerCanMove: true,
      wolfMoving: true,
      wolfWon: false,
      gameOver: false,
      isStuck: false,
      stuckReason: undefined,
    });

    // set up a new game after a tiny delay
    setTimeout(() => {
      initializeGame();
    }, 100);
  }, [initializeGame]);

  return {
    gameState,
    movePlayer,
    moveWolf,
    resetGame,
    initializeGame,
  };
};

