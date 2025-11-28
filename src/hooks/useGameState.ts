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
import { findPath, pathExists } from "../utils/pathfinding";
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

    // create a level that can actually be completed - keep trying until we get one that's not stuck
    let levelData: { treePositions: Position[]; flowerPositions: Position[] } | null = null;
    let initialStuckCheck: { stuck: boolean; reason?: string } = { stuck: true, reason: "Failed to generate valid level" };

    // try to generate a valid, non-stuck level (up to 20 attempts to account for wolf stuck cases)
    let attempts = 0;
    let wolfStuckCheck: { stuck: boolean; reason?: string } = { stuck: false };

    while (attempts < 20) {
      attempts++;
      levelData = generateValidLevel(wolfStartPosition);
      if (levelData) {
        initialStuckCheck = isPlayerStuck(
          PLAYER_START_POSITION,
          levelData.flowerPositions,
          levelData.treePositions,
          false
        );

        // check if wolf can reach the player - if not, wolf is stuck
        const wolfCanReachPlayer = pathExists(
          wolfStartPosition,
          PLAYER_START_POSITION,
          levelData.treePositions
        );

        wolfStuckCheck = {
          stuck: !wolfCanReachPlayer,
          reason: wolfCanReachPlayer ? undefined : `Wolf at (${wolfStartPosition.x}, ${wolfStartPosition.y}) cannot reach player at (${PLAYER_START_POSITION.x}, ${PLAYER_START_POSITION.y}) - no path exists`
        };

        // only accept level if player is not stuck AND wolf can reach player
        if (!initialStuckCheck.stuck && !wolfStuckCheck.stuck) {
          console.log(`✅ Game loaded successfully after ${attempts} attempt(s) - player can move, wolf can chase`);
          break; // found a good level!
        } else {
          if (initialStuckCheck.stuck) {
            console.log(`⚠️ Attempt ${attempts}: Player stuck - ${initialStuckCheck.reason || "Unknown reason"}`);
          }
          if (wolfStuckCheck.stuck) {
            console.log(`⚠️ Attempt ${attempts}: ${wolfStuckCheck.reason || "Wolf cannot reach player"}`);
          }
        }
      } else {
        console.log(`⚠️ Attempt ${attempts}: Failed to generate valid level (level generation exhausted 50 internal attempts - will retry)`);
      }
    }

    if (!levelData || initialStuckCheck.stuck || wolfStuckCheck.stuck) {
      const failureReason = !levelData
        ? "Failed to generate valid level"
        : initialStuckCheck.stuck
          ? initialStuckCheck.reason || "Player stuck"
          : wolfStuckCheck.reason || "Wolf stuck";
      console.error(`❌ Failed to generate playable level after ${attempts} attempt(s). Reason: ${failureReason}`);
      // still set up the game state so the board shows something
      setGameState((prev) => ({
        ...prev,
        playerPosition: PLAYER_START_POSITION,
        wolfPosition: wolfStartPosition,
        grannyHousePosition,
        treePositions: levelData?.treePositions || [],
        flowers: levelData?.flowerPositions || [],
        collectedFlowers: 0,
        isHouseOpen: false,
        playerEnteredHouse: false,
        playerCanMove: false,
        wolfMoving: false,
        wolfWon: false,
        gameOver: true,
        playerDirection: "down",
        wolfDirection: "down",
        isStuck: true,
        stuckReason: initialStuckCheck.reason || "Level generation failed",
      }));
      return;
    }

    // levelData is guaranteed to be non-null here (TypeScript assertion)
    const finalLevelData = levelData!;
    setGameState((prev) => ({
      ...prev,
      playerPosition: PLAYER_START_POSITION,
      wolfPosition: wolfStartPosition,
      grannyHousePosition,
      treePositions: finalLevelData.treePositions,
      flowers: finalLevelData.flowerPositions,
      collectedFlowers: 0,
      isHouseOpen: false,
      playerEnteredHouse: false,
      playerCanMove: !initialStuckCheck.stuck,
      wolfMoving: !initialStuckCheck.stuck,
      wolfWon: false,
      gameOver: initialStuckCheck.stuck,
      playerDirection: "down",
      wolfDirection: "down",
      isStuck: initialStuckCheck.stuck,
      stuckReason: initialStuckCheck.reason,
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

        // log when player gets stuck
        if (stuckCheck.stuck && !prev.isStuck) {
          console.log(`🚫 PLAYER STUCK at position (${newPosition.x}, ${newPosition.y}): ${stuckCheck.reason || "Cannot reach objectives"}`);
        }

        return {
          ...prev,
          playerPosition: newPosition,
          playerDirection: direction,
          flowers: newFlowers,
          collectedFlowers: newCollectedFlowers,
          isHouseOpen,
          playerEnteredHouse,
          wolfMoving: playerEnteredHouse || stuckCheck.stuck ? false : prev.wolfMoving,
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
      if (!prev.wolfMoving || prev.gameOver || prev.isStuck) return prev;

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
        // check if we're already at the same position (collision)
        const collision = positionsEqual(prev.wolfPosition, prev.playerPosition);

        if (collision) {
          // wolf caught the player
          return {
            ...prev,
            playerCanMove: false,
            wolfWon: true,
            gameOver: true,
          };
        }

        // wolf can't find a path to the player - wolf is stuck
        const wolfStuckReason = `Wolf at (${prev.wolfPosition.x}, ${prev.wolfPosition.y}) cannot reach player at (${prev.playerPosition.x}, ${prev.playerPosition.y}) - no path exists`;
        console.log(`🐺 WOLF STUCK: ${wolfStuckReason}`);

        // stop the wolf from moving since it's stuck
        return {
          ...prev,
          wolfMoving: false,
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

