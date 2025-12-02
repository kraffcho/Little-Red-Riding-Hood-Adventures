import { useState, useCallback } from "react";
import { Position } from "../types";
import {
  PLAYER_START_POSITION,
  getWolfStartPosition,
  getGrannyHousePosition,
  getGridSize,
  getNumTrees,
  NUM_FLOWERS,
} from "../constants/gameConfig";
import { getLevelConfig } from "../constants/levelConfig";
import {
  generateValidLevel,
  isPlayerStuck,
  pathExists,
} from "../utils";

// manages level generation, grid size, trees, flowers, and house position
export const useLevelState = () => {
  const [levelState, setLevelState] = useState<{
    gridSize: number;
    treePositions: Position[];
    flowers: Position[];
    grannyHousePosition: Position;
    collectedFlowers: number;
    isHouseOpen: boolean;
    currentLevel: number;
  }>({
    gridSize: getGridSize(),
    treePositions: [],
    flowers: [],
    grannyHousePosition: { x: -1, y: -1 },
    collectedFlowers: 0,
    isHouseOpen: false,
    currentLevel: 1,
  });

  /**
   * Generate a new level with valid tree and flower positions
   * Returns level data if successful, null if failed
   */
  const generateLevel = useCallback((level: number = 1): {
    treePositions: Position[];
    flowerPositions: Position[];
    wolfStartPosition: Position;
    grannyHousePosition: Position;
    gridSize: number;
  } | null => {
    const gridSize = getGridSize();
    const levelConfig = getLevelConfig(level, typeof window !== "undefined" ? window.innerWidth : undefined);
    const numTrees = typeof levelConfig.numTrees === 'number'
      ? levelConfig.numTrees
      : levelConfig.numTrees();
    const numFlowers = levelConfig.numFlowers;
    const wolfStartPosition = getWolfStartPosition(gridSize);
    const grannyHousePosition = getGrannyHousePosition(gridSize);

    // create a level that can actually be completed - keep trying until we get one that's not stuck
    let levelData: { treePositions: Position[]; flowerPositions: Position[] } | null = null;
    let initialStuckCheck: { stuck: boolean; reason?: string } = { stuck: true, reason: "Failed to generate valid level" };

    // try to generate a valid, non-stuck level (up to 20 attempts to account for wolf stuck cases)
    let attempts = 0;
    let wolfStuckCheck: { stuck: boolean; reason?: string } = { stuck: false };

    while (attempts < 20) {
      attempts++;
      levelData = generateValidLevel(wolfStartPosition, grannyHousePosition, gridSize, numTrees, numFlowers);
      if (levelData) {
        initialStuckCheck = isPlayerStuck(
          PLAYER_START_POSITION,
          levelData.flowerPositions,
          levelData.treePositions,
          grannyHousePosition,
          false,
          gridSize,
          0, // collectedFlowers at start
          numFlowers // totalFlowers for this level
        );

        // check if wolf can reach the player - if not, wolf is stuck
        const wolfCanReachPlayer = pathExists(
          wolfStartPosition,
          PLAYER_START_POSITION,
          levelData.treePositions,
          gridSize
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
      return null;
    }

    return {
      treePositions: levelData.treePositions,
      flowerPositions: levelData.flowerPositions,
      wolfStartPosition,
      grannyHousePosition,
      gridSize,
    };
  }, []);

  /**
   * Initialize level state with generated level data
   */
  const initializeLevel = useCallback((levelData: {
    treePositions: Position[];
    flowerPositions: Position[];
    grannyHousePosition: Position;
    gridSize: number;
  }) => {
    setLevelState({
      gridSize: levelData.gridSize,
      treePositions: levelData.treePositions,
      flowers: levelData.flowerPositions,
      grannyHousePosition: levelData.grannyHousePosition,
      collectedFlowers: 0,
      isHouseOpen: false,
      currentLevel: 1,
    });
  }, []);

  /**
   * Collect a flower at the given position
   */
  const collectFlower = useCallback((position: Position) => {
    setLevelState((prev) => {
      const flowerIndex = prev.flowers.findIndex(
        (flower) => flower.x === position.x && flower.y === position.y
      );

      if (flowerIndex === -1) {
        return prev; // flower not found at this position
      }

      const newFlowers = prev.flowers.filter((_, index) => index !== flowerIndex);
      const newCollectedFlowers = prev.collectedFlowers + 1;
      const allFlowersCollected = newCollectedFlowers === NUM_FLOWERS;

      return {
        ...prev,
        flowers: newFlowers,
        collectedFlowers: newCollectedFlowers,
        isHouseOpen: allFlowersCollected || prev.isHouseOpen,
      };
    });
  }, []);

  /**
   * Reset level state
   */
  const resetLevel = useCallback(() => {
    setLevelState({
      gridSize: getGridSize(),
      treePositions: [],
      flowers: [],
      grannyHousePosition: { x: -1, y: -1 },
      collectedFlowers: 0,
      isHouseOpen: false,
      currentLevel: 1,
    });
  }, []);

  /**
   * Increment level number
   */
  const nextLevel = useCallback(() => {
    setLevelState((prev) => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
    }));
  }, []);

  return {
    levelState,
    generateLevel,
    initializeLevel,
    collectFlower,
    resetLevel,
    nextLevel,
  };
};

