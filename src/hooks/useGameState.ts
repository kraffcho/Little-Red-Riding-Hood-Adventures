import { useState, useEffect, useCallback, useRef } from "react";
import { Position, Direction, GameState, ItemType, SpecialItem, ExplosionEffect } from "../types/game";
import {
  GRID_SIZE,
  NUM_FLOWERS,
  PLAYER_START_POSITION,
  getWolfStartPosition,
  getGrannyHousePosition,
  ITEM_SPAWN_DELAY,
  BOMB_STUN_DURATION,
  BOMB_EXPLOSION_RADIUS,
  BOMB_EXPLOSION_DURATION,
  BOMB_COOLDOWN_DURATION,
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
import {
  generateRandomItemPosition,
  isWithinRadius,
  generateItemId,
} from "../utils/itemUtils";

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
    // special items system
    inventory: [],
    specialItems: [],
    wolfStunned: false,
    wolfStunEndTime: null,
    explosionEffect: null,
    // level tracking - start at level 1
    currentLevel: 1,
    // bomb cooldown
    bombCooldownEndTime: null,
    // temporary message
    temporaryMessage: null,
  });

  const gameStartTimeRef = useRef<number | null>(null);
  const itemSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        // reset special items
        inventory: [],
        specialItems: [],
        wolfStunned: false,
        wolfStunEndTime: null,
        explosionEffect: null,
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
      // reset special items
      inventory: [],
      specialItems: [],
      wolfStunned: false,
      wolfStunEndTime: null,
      explosionEffect: null,
      // level tracking - start at level 1
      currentLevel: 1,
      // temporary message
      temporaryMessage: null,
    }));

    // clear game start time and timer - will be set when gameplay actually starts (after countdown)
    gameStartTimeRef.current = null;
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
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

        // see if we picked up a special item
        const itemIndex = prev.specialItems.findIndex(
          (item) =>
            item.position.x === newPosition.x && item.position.y === newPosition.y
        );
        const hasItem = itemIndex !== -1;
        const collectedItem = hasItem ? prev.specialItems[itemIndex] : null;
        const newSpecialItems = hasItem
          ? prev.specialItems.filter((_, index) => index !== itemIndex)
          : prev.specialItems;
        const newInventory = hasItem && collectedItem
          ? [...prev.inventory, collectedItem.type]
          : prev.inventory;

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
          specialItems: newSpecialItems,
          inventory: newInventory,
          isHouseOpen,
          playerEnteredHouse,
          wolfMoving: playerEnteredHouse || stuckCheck.stuck || prev.wolfStunned ? false : prev.wolfMoving,
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
      if (!prev.wolfMoving || prev.gameOver || prev.isStuck || prev.wolfStunned) return prev;

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

  // spawn a special item on the board
  const spawnSpecialItem = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || prev.playerEnteredHouse) {
        // clear timer if game is over
        if (itemSpawnTimerRef.current) {
          clearTimeout(itemSpawnTimerRef.current);
          itemSpawnTimerRef.current = null;
        }
        return prev;
      }

      // find all existing positions to avoid
      const existingPositions: Position[] = [
        prev.playerPosition,
        prev.wolfPosition,
        prev.grannyHousePosition,
        ...prev.flowers,
        ...prev.specialItems.map((item) => item.position),
      ];

      const itemPosition = generateRandomItemPosition(
        existingPositions,
        prev.treePositions
      );

      if (!itemPosition) {
        // couldn't find a valid position, try again after a short delay
        if (itemSpawnTimerRef.current) {
          clearTimeout(itemSpawnTimerRef.current);
        }
        itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);
        return prev;
      }

      const newItem: SpecialItem = {
        id: generateItemId(),
        type: "bomb", // for now, only bombs spawn
        position: itemPosition,
      };

      // schedule the next spawn after successfully spawning this item
      if (itemSpawnTimerRef.current) {
        clearTimeout(itemSpawnTimerRef.current);
      }
      itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);

      return {
        ...prev,
        specialItems: [...prev.specialItems, newItem],
      };
    });
  }, []);

  // start item spawning timer when gameplay begins (after countdown)
  const startItemSpawning = useCallback(() => {
    // check if game is properly initialized and ready
    const isGameInitialized = gameState.playerPosition.x >= 0 && gameState.playerPosition.y >= 0;

    if (!isGameInitialized || gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck) {
      return; // don't start if conditions aren't right
    }

    // clear any existing timer first
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
    }

    // set game start time
    gameStartTimeRef.current = Date.now();

    // start the spawning timer - this will spawn the first item after ITEM_SPAWN_DELAY
    itemSpawnTimerRef.current = setTimeout(() => {
      spawnSpecialItem();
    }, ITEM_SPAWN_DELAY);
  }, [gameState.playerPosition, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, spawnSpecialItem]);

  // stop item spawning when game ends or conditions change
  useEffect(() => {
    if (gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck) {
      // stop spawning if game is over, ended, or stuck
      if (itemSpawnTimerRef.current) {
        clearTimeout(itemSpawnTimerRef.current);
        itemSpawnTimerRef.current = null;
      }
    }
  }, [gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck]);

  // update wolf stun timer
  useEffect(() => {
    if (gameState.wolfStunned && gameState.wolfStunEndTime) {
      const checkStun = setInterval(() => {
        setGameState((prev) => {
          if (prev.wolfStunEndTime && Date.now() >= prev.wolfStunEndTime) {
            return {
              ...prev,
              wolfStunned: false,
              wolfStunEndTime: null,
              wolfMoving: !prev.gameOver && !prev.isStuck,
            };
          }
          return prev;
        });
      }, 100); // check every 100ms

      return () => clearInterval(checkStun);
    }
  }, [gameState.wolfStunned, gameState.wolfStunEndTime]);

  // clear explosion effect after duration
  useEffect(() => {
    if (gameState.explosionEffect) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          explosionEffect: null,
        }));
      }, BOMB_EXPLOSION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [gameState.explosionEffect]);

  // update bomb cooldown timer
  useEffect(() => {
    if (gameState.bombCooldownEndTime) {
      const checkCooldown = setInterval(() => {
        setGameState((prev) => {
          if (prev.bombCooldownEndTime && Date.now() >= prev.bombCooldownEndTime) {
            return {
              ...prev,
              bombCooldownEndTime: null,
            };
          }
          return prev;
        });
      }, 100); // check every 100ms

      return () => clearInterval(checkCooldown);
    }
  }, [gameState.bombCooldownEndTime]);

  // use a bomb item
  const useBomb = useCallback(() => {
    setGameState((prev) => {
      const bombIndex = prev.inventory.indexOf("bomb");
      const isOnCooldown = prev.bombCooldownEndTime !== null && Date.now() < prev.bombCooldownEndTime;

      if (bombIndex === -1 || prev.gameOver || prev.playerEnteredHouse || isOnCooldown) {
        return prev;
      }

      // remove bomb from inventory
      const newInventory = prev.inventory.filter((_, index) => index !== bombIndex);

      // create explosion effect
      const explosionEffect: ExplosionEffect = {
        position: prev.playerPosition,
        radius: BOMB_EXPLOSION_RADIUS,
        startTime: Date.now(),
        duration: BOMB_EXPLOSION_DURATION,
      };

      // check if wolf is within explosion radius
      const wolfInRadius = isWithinRadius(
        prev.wolfPosition,
        prev.playerPosition,
        BOMB_EXPLOSION_RADIUS
      );

      let newWolfStunned = prev.wolfStunned;
      let newWolfStunEndTime = prev.wolfStunEndTime;
      let newWolfMoving = prev.wolfMoving;

      if (wolfInRadius) {
        // stun the wolf
        const stunEndTime = Date.now() + BOMB_STUN_DURATION;
        newWolfStunned = true;
        newWolfStunEndTime = stunEndTime;
        newWolfMoving = false;
      }

      // set cooldown after using bomb
      const cooldownEndTime = Date.now() + BOMB_COOLDOWN_DURATION;

      // set temporary message based on whether wolf was stunned
      const temporaryMessage = wolfInRadius
        ? { text: "WOLF STUNNED!", type: 'success' as const }
        : { text: "MISSED!", type: 'error' as const };

      return {
        ...prev,
        inventory: newInventory,
        explosionEffect,
        wolfStunned: newWolfStunned,
        wolfStunEndTime: newWolfStunEndTime,
        wolfMoving: newWolfMoving,
        bombCooldownEndTime: cooldownEndTime,
        temporaryMessage,
      };
    });
  }, []);

  // start over from the beginning
  const resetGame = useCallback(() => {
    // clear timers
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
    gameStartTimeRef.current = null;

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
      playerCanMove: false,
      wolfMoving: false,
      wolfWon: false,
      gameOver: false,
      isStuck: false,
      stuckReason: undefined,
      // reset special items
      inventory: [],
      specialItems: [],
      wolfStunned: false,
      wolfStunEndTime: null,
      explosionEffect: null,
      // level tracking - start at level 1
      currentLevel: 1,
      // bomb cooldown
      bombCooldownEndTime: null,
      // temporary message
      temporaryMessage: null,
    });

    // set up a new game after a tiny delay
    setTimeout(() => {
      initializeGame();
    }, 100);
  }, [initializeGame]);

  // clear temporary message
  const clearTemporaryMessage = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      temporaryMessage: null,
    }));
  }, []);

  return {
    gameState,
    movePlayer,
    moveWolf,
    resetGame,
    initializeGame,
    useBomb,
    clearTemporaryMessage,
    startItemSpawning,
  };
};

