import { useState, useEffect, useCallback, useRef } from "react";
import { Position, Direction, GameState, ItemType, SpecialItem, ExplosionEffect, ExplosionMark } from "../types";
import {
  GRID_SIZE,
  NUM_FLOWERS,
  PLAYER_START_POSITION,
  getWolfStartPosition,
  getGrannyHousePosition,
  getGridSize,
  getNumTrees,
  ITEM_SPAWN_DELAY,
  MAX_BOMBS_ON_MAP,
  BOMB_STUN_DURATION,
  BOMB_EXPLOSION_RADIUS,
  BOMB_EXPLOSION_DURATION,
  BOMB_COOLDOWN_DURATION,
  EXPLOSION_MARK_DURATION,
  ENEMY_DELAY,
  WOLF_SPEED_INCREASE_PERCENTAGE,
  MAX_WOLF_SPEED_INCREASES,
  CLOAK_SPAWN_DELAY_MIN,
  CLOAK_SPAWN_DELAY_MAX,
  CLOAK_INVISIBILITY_DURATION,
  CLOAK_COOLDOWN_DURATION,
  CLOAK_WOLF_CONFUSION_INTERVAL,
} from "../constants/gameConfig";
import {
  isValidPosition,
  moveInDirection,
  positionsEqual,
  getDirectionFromMovement,
  findPath,
  pathExists,
  generateValidLevel,
  isPlayerStuck,
  generateRandomItemPosition,
  isWithinRadius,
  generateItemId,
} from "../utils";
import { useLevelState } from "./useLevelState";
import { useInventoryState } from "./useInventoryState";
import { useGameLifecycle } from "./useGameLifecycle";
import { useBombMechanics } from "./useBombMechanics";
import { useCloakMechanics } from "./useCloakMechanics";

/**
 * hook that handles all the game state and logic
 */
export const useGameState = () => {
  // use level state hook for level generation logic
  // Note: For now, we only use generateLevel. Level state remains in gameState for backward compatibility
  const { generateLevel } = useLevelState();

  // use inventory state hook for timer refs and helper functions
  // Note: State remains in gameState for now, we use the hook for refs and future migration
  const { itemSpawnTimerRef, cloakSpawnTimerRef } = useInventoryState();

  // use game lifecycle hook for gameStartTimeRef and helper functions
  // Note: Lifecycle state (gameOver, paused, isStuck, temporaryMessage) remains in gameState for backward compatibility
  // We use the hook for gameStartTimeRef and helper functions (setGameStartTime, clearGameStartTime)
  const { gameStartTimeRef, setGameStartTime, clearGameStartTime } = useGameLifecycle();

  // use bomb mechanics hook for bomb-related logic
  // Note: Bomb state (explosionEffect, explosionMarks, bombCooldownEndTime) is synced with gameState for compatibility
  const {
    explosionEffect: hookExplosionEffect,
    explosionMarks: hookExplosionMarks,
    bombCooldownEndTime: hookBombCooldownEndTime,
    createExplosion,
    addExplosionMark,
    useBomb: hookUseBomb,
    startBombCooldown,
    resetBombMechanics,
  } = useBombMechanics();

  // use cloak mechanics hook for cloak-related logic
  // Note: Cloak state (playerInvisible, cloakInvisibilityEndTime, cloakCooldownEndTime, cloakSpawned) is synced with gameState for compatibility
  const {
    playerInvisible: hookPlayerInvisible,
    cloakInvisibilityEndTime: hookCloakInvisibilityEndTime,
    cloakCooldownEndTime: hookCloakCooldownEndTime,
    cloakSpawned: hookCloakSpawned,
    wolfConfusionIntervalRef,
    activateInvisibility,
    clearInvisibility,
    useCloak: hookUseCloak,
    startWolfConfusion,
    stopWolfConfusion,
    resetCloakMechanics,
  } = useCloakMechanics();

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
    gridSize: getGridSize(), // initialize with current responsive grid size
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
    // explosion marks
    explosionMarks: [],
    // wolf speed - starts at base delay, decreases with each stun
    currentWolfDelay: ENEMY_DELAY,
    // track how many times wolf has been stunned (for max 5 speed increases)
    wolfStunCount: 0,
    // hunter's cloak system
    playerInvisible: false,
    cloakInvisibilityEndTime: null,
    cloakCooldownEndTime: null,
    cloakSpawned: false,
    // pause system
    paused: false,
  });

  // Note: gameStartTimeRef is now provided by useGameLifecycle hook
  // Note: itemSpawnTimerRef and cloakSpawnTimerRef are now provided by useInventoryState hook
  // Note: wolfConfusionIntervalRef is now provided by useCloakMechanics hook

  // set up a new game
  const initializeGame = useCallback(() => {
    // use level state hook to generate the level
    const levelData = generateLevel();

    if (!levelData) {
      // level generation failed - set up failed state
      const gridSize = getGridSize();
      const wolfStartPosition = getWolfStartPosition(gridSize);
      const grannyHousePosition = getGrannyHousePosition(gridSize);

      console.error(`❌ Failed to generate playable level. Reason: Level generation failed`);
      // still set up the game state so the board shows something
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
        playerCanMove: false,
        wolfMoving: false,
        wolfWon: false,
        gameOver: true,
        playerDirection: "down",
        wolfDirection: "down",
        isStuck: true,
        stuckReason: "Level generation failed",
        gridSize: gridSize,
        // reset special items
        inventory: [],
        specialItems: [],
        wolfStunned: false,
        wolfStunEndTime: null,
        explosionEffect: null,
      }));
      return;
    }

    // level generation succeeded - calculate stuck checks for game state
    const initialStuckCheck = isPlayerStuck(
      PLAYER_START_POSITION,
      levelData.flowerPositions,
      levelData.treePositions,
      levelData.grannyHousePosition,
      false,
      levelData.gridSize
    );

    // level generation succeeded - set up game state
    setGameState((prev) => ({
      ...prev,
      playerPosition: PLAYER_START_POSITION,
      wolfPosition: levelData.wolfStartPosition,
      grannyHousePosition: levelData.grannyHousePosition,
      treePositions: levelData.treePositions,
      flowers: levelData.flowerPositions,
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
      gridSize: levelData.gridSize, // store the responsive grid size
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
      // explosion marks
      explosionMarks: [],
      // reset wolf speed to base delay
      currentWolfDelay: ENEMY_DELAY,
      // reset stun count
      wolfStunCount: 0,
      // reset hunter's cloak system
      playerInvisible: false,
      cloakInvisibilityEndTime: null,
      cloakCooldownEndTime: null,
      cloakSpawned: false,
      // reset pause state
      paused: false,
    }));

    // clear game start time and timer - will be set when gameplay actually starts (after countdown)
    clearGameStartTime();
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
      cloakSpawnTimerRef.current = null;
    }
    if (wolfConfusionIntervalRef.current) {
      clearInterval(wolfConfusionIntervalRef.current);
      wolfConfusionIntervalRef.current = null;
    }

    // Note: We're using generateLevel from useLevelState for level generation logic,
    // but keeping all state in gameState for now to maintain backward compatibility
  }, [generateLevel]);

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

        // make sure we can actually move here (use gridSize from state)
        if (!isValidPosition(newPosition, prev.treePositions, prev.gridSize)) {
          return prev;
        }

        // when player is invisible, treat wolf as an obstacle (can't move onto wolf's tile)
        if (prev.playerInvisible && positionsEqual(newPosition, prev.wolfPosition)) {
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

        // if player enters house while invisible, immediately clear invisibility
        // this prevents the house and tooltip from becoming invisible
        const shouldClearInvisibility = playerEnteredHouse && prev.playerInvisible;

        // check if the wolf got us (only if player is not invisible)
        const collision = positionsEqual(newPosition, prev.wolfPosition) && !prev.playerInvisible;
        const wolfWon = collision;

        // make sure we didn't trap ourselves
        const stuckCheck = isPlayerStuck(
          newPosition,
          newFlowers,
          prev.treePositions,
          prev.grannyHousePosition,
          isHouseOpen,
          prev.gridSize
        );

        // log when player gets stuck
        if (stuckCheck.stuck && !prev.isStuck) {
          console.log(`🚫 PLAYER STUCK at position (${newPosition.x}, ${newPosition.y}): ${stuckCheck.reason || "Cannot reach objectives"}`);
        }

        // set message when item is collected
        let temporaryMessage = prev.temporaryMessage;
        if (hasItem && collectedItem) {
          if (collectedItem.type === "bomb") {
            temporaryMessage = { text: "+1 💣 BOMB!", type: 'success' as const };
          } else if (collectedItem.type === "cloak") {
            temporaryMessage = { text: "🧥 HUNTER'S CLOAK!", type: 'success' as const };
          }
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
          // clear invisibility if player entered house
          playerInvisible: shouldClearInvisibility ? false : prev.playerInvisible,
          cloakInvisibilityEndTime: shouldClearInvisibility ? null : prev.cloakInvisibilityEndTime,
          wolfMoving: playerEnteredHouse || stuckCheck.stuck || prev.wolfStunned ? false : prev.wolfMoving,
          playerCanMove: !wolfWon && !stuckCheck.stuck && !playerEnteredHouse,
          wolfWon,
          gameOver: wolfWon || stuckCheck.stuck,
          isStuck: stuckCheck.stuck,
          stuckReason: stuckCheck.reason,
          temporaryMessage,
        };
      });
    },
    []
  );

  // move the wolf toward the player using pathfinding
  const moveWolf = useCallback(() => {
    setGameState((prev) => {
      if (!prev.wolfMoving || prev.gameOver || prev.isStuck || prev.wolfStunned || prev.playerInvisible) return prev;

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
        prev.treePositions,
        prev.gridSize
      );

      if (!nextPosition) {
        // check if we're already at the same position (collision) - only if player is visible
        const collision = positionsEqual(prev.wolfPosition, prev.playerPosition) && !prev.playerInvisible;

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
      if (prev.gameOver || prev.playerEnteredHouse || prev.paused) {
        // clear timer if game is over or paused
        if (prev.gameOver || prev.playerEnteredHouse) {
          if (itemSpawnTimerRef.current) {
            clearTimeout(itemSpawnTimerRef.current);
            itemSpawnTimerRef.current = null;
          }
        }
        // if paused, reschedule for later
        if (prev.paused && !prev.gameOver && !prev.playerEnteredHouse) {
          if (itemSpawnTimerRef.current) {
            clearTimeout(itemSpawnTimerRef.current);
          }
          itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);
        }
        return prev;
      }

      // count current bombs on the map
      const currentBombCount = prev.specialItems.filter((item) => item.type === "bomb").length;

      // don't spawn if we've reached the max number of bombs
      if (currentBombCount >= MAX_BOMBS_ON_MAP) {
        // schedule the next spawn attempt after a delay
        if (itemSpawnTimerRef.current) {
          clearTimeout(itemSpawnTimerRef.current);
        }
        itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);
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

      const gridSize = getGridSize();
      const itemPosition = generateRandomItemPosition(
        existingPositions,
        prev.treePositions,
        gridSize,
        prev.grannyHousePosition
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

  // spawn the hunter's cloak once per level (random 20-40 seconds)
  const spawnCloak = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || prev.playerEnteredHouse || prev.cloakSpawned || prev.paused) {
        // clear timer if game is over or cloak already spawned
        if (prev.gameOver || prev.playerEnteredHouse || prev.cloakSpawned) {
          if (cloakSpawnTimerRef.current) {
            clearTimeout(cloakSpawnTimerRef.current);
            cloakSpawnTimerRef.current = null;
          }
        }
        // if paused, reschedule for later
        if (prev.paused && !prev.gameOver && !prev.playerEnteredHouse && !prev.cloakSpawned) {
          if (cloakSpawnTimerRef.current) {
            clearTimeout(cloakSpawnTimerRef.current);
          }
          cloakSpawnTimerRef.current = setTimeout(spawnCloak, 2000);
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

      const gridSize = getGridSize();
      const itemPosition = generateRandomItemPosition(
        existingPositions,
        prev.treePositions,
        gridSize,
        prev.grannyHousePosition
      );

      if (!itemPosition) {
        // couldn't find a valid position, try again after a short delay
        if (cloakSpawnTimerRef.current) {
          clearTimeout(cloakSpawnTimerRef.current);
        }
        cloakSpawnTimerRef.current = setTimeout(spawnCloak, 2000);
        return prev;
      }

      const newItem: SpecialItem = {
        id: generateItemId(),
        type: "cloak",
        position: itemPosition,
      };

      return {
        ...prev,
        specialItems: [...prev.specialItems, newItem],
        cloakSpawned: true,
        temporaryMessage: { text: "🧥 HUNTER'S CLOAK APPEARED!", type: 'success' as const },
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
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
    }

    // set game start time
    setGameStartTime(Date.now());

    // start the spawning timer - this will spawn the first item after ITEM_SPAWN_DELAY
    itemSpawnTimerRef.current = setTimeout(() => {
      spawnSpecialItem();
    }, ITEM_SPAWN_DELAY);

    // spawn cloak at random interval between 20-40 seconds (once per level)
    const cloakSpawnDelay = Math.floor(
      Math.random() * (CLOAK_SPAWN_DELAY_MAX - CLOAK_SPAWN_DELAY_MIN + 1) + CLOAK_SPAWN_DELAY_MIN
    );
    cloakSpawnTimerRef.current = setTimeout(() => {
      spawnCloak();
    }, cloakSpawnDelay);
  }, [gameState.playerPosition, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, spawnSpecialItem, spawnCloak]);

  // stop item spawning when game ends or conditions change
  useEffect(() => {
    if (gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck) {
      // stop spawning if game is over, ended, or stuck
      if (itemSpawnTimerRef.current) {
        clearTimeout(itemSpawnTimerRef.current);
        itemSpawnTimerRef.current = null;
      }
      if (cloakSpawnTimerRef.current) {
        clearTimeout(cloakSpawnTimerRef.current);
        cloakSpawnTimerRef.current = null;
      }
    }
  }, [gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck]);

  // update wolf stun timer - when wolf wakes up, reduce delay (make it faster) by 10%, max 5 times
  useEffect(() => {
    if (gameState.wolfStunned && gameState.wolfStunEndTime) {
      const checkStun = setInterval(() => {
        setGameState((prev) => {
          if (prev.wolfStunEndTime && Date.now() >= prev.wolfStunEndTime) {
            // wolf just woke up
            // only reduce delay if we haven't reached the maximum speed increases yet (max 5 times)
            const shouldIncreaseSpeed = prev.wolfStunCount < MAX_WOLF_SPEED_INCREASES;
            const newDelay = shouldIncreaseSpeed
              ? prev.currentWolfDelay * (1 - WOLF_SPEED_INCREASE_PERCENTAGE)
              : prev.currentWolfDelay;
            const newStunCount = shouldIncreaseSpeed
              ? prev.wolfStunCount + 1
              : prev.wolfStunCount;

            return {
              ...prev,
              wolfStunned: false,
              wolfStunEndTime: null,
              wolfMoving: !prev.gameOver && !prev.isStuck,
              currentWolfDelay: newDelay,
              wolfStunCount: newStunCount,
            };
          }
          return prev;
        });
      }, 100); // check every 100ms

      return () => clearInterval(checkStun);
    }
  }, [gameState.wolfStunned, gameState.wolfStunEndTime]);

  // update invisibility timer - when invisibility ends, make player visible again
  useEffect(() => {
    if (gameState.playerInvisible && gameState.cloakInvisibilityEndTime) {
      const checkInvisibility = setInterval(() => {
        setGameState((prev) => {
          if (prev.cloakInvisibilityEndTime && Date.now() >= prev.cloakInvisibilityEndTime) {
            // invisibility ended
            return {
              ...prev,
              playerInvisible: false,
              cloakInvisibilityEndTime: null,
              wolfMoving: !prev.gameOver && !prev.isStuck && !prev.wolfStunned,
            };
          }
          return prev;
        });
      }, 100); // check every 100ms

      return () => clearInterval(checkInvisibility);
    }
  }, [gameState.playerInvisible, gameState.cloakInvisibilityEndTime]);

  // make wolf look confused (alternate left/right) when player is invisible
  useEffect(() => {
    if (gameState.playerInvisible) {
      // start confusion animation
      wolfConfusionIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          if (!prev.playerInvisible) {
            return prev; // stop if invisibility ended
          }
          // alternate between left and right
          const newDirection = prev.wolfDirection === "left" ? "right" : "left";
          return {
            ...prev,
            wolfDirection: newDirection,
          };
        });
      }, CLOAK_WOLF_CONFUSION_INTERVAL);

      return () => {
        if (wolfConfusionIntervalRef.current) {
          clearInterval(wolfConfusionIntervalRef.current);
          wolfConfusionIntervalRef.current = null;
        }
      };
    } else {
      // stop confusion animation when player becomes visible
      if (wolfConfusionIntervalRef.current) {
        clearInterval(wolfConfusionIntervalRef.current);
        wolfConfusionIntervalRef.current = null;
      }
    }
  }, [gameState.playerInvisible]);

  // sync bomb mechanics state from hook to gameState
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      explosionEffect: hookExplosionEffect,
      explosionMarks: hookExplosionMarks,
      bombCooldownEndTime: hookBombCooldownEndTime,
    }));
  }, [hookExplosionEffect, hookExplosionMarks, hookBombCooldownEndTime]);

  // sync cloak mechanics state from hook to gameState
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      playerInvisible: hookPlayerInvisible,
      cloakInvisibilityEndTime: hookCloakInvisibilityEndTime,
      cloakCooldownEndTime: hookCloakCooldownEndTime,
      cloakSpawned: hookCloakSpawned,
    }));
  }, [hookPlayerInvisible, hookCloakInvisibilityEndTime, hookCloakCooldownEndTime, hookCloakSpawned]);

  // use a bomb item - now using useBombMechanics hook
  const useBomb = useCallback(() => {
    setGameState((prev) => {
      const bombIndex = prev.inventory.indexOf("bomb");
      const isOnCooldown = hookBombCooldownEndTime !== null && Date.now() < hookBombCooldownEndTime;

      if (bombIndex === -1 || prev.gameOver || prev.playerEnteredHouse || isOnCooldown) {
        return prev;
      }

      // use hook's useBomb function to calculate bomb logic
      const bombResult = hookUseBomb({
        playerPosition: prev.playerPosition,
        wolfPosition: prev.wolfPosition,
        hasBomb: true,
        gameOver: prev.gameOver,
        playerEnteredHouse: prev.playerEnteredHouse,
        isOnCooldown,
      });

      if (!bombResult.success) {
        return prev;
      }

      // remove bomb from inventory
      const newInventory = prev.inventory.filter((_, index) => index !== bombIndex);

      // create explosion effect using hook
      createExplosion(prev.playerPosition);

      // add explosion mark using hook
      addExplosionMark(prev.playerPosition);

      // start cooldown using hook
      startBombCooldown();

      let newWolfStunned = prev.wolfStunned;
      let newWolfStunEndTime = prev.wolfStunEndTime;
      let newWolfMoving = prev.wolfMoving;

      if (bombResult.wolfStunned && bombResult.stunEndTime) {
        // stun the wolf
        newWolfStunned = true;
        newWolfStunEndTime = bombResult.stunEndTime;
        newWolfMoving = false;
      }

      // set temporary message based on whether wolf was stunned
      const temporaryMessage = bombResult.wolfStunned
        ? { text: "WOLF STUNNED!", type: 'success' as const }
        : { text: "MISSED!", type: 'error' as const };

      // Note: explosionEffect, explosionMarks, and bombCooldownEndTime will be synced from hook via useEffect
      return {
        ...prev,
        inventory: newInventory,
        wolfStunned: newWolfStunned,
        wolfStunEndTime: newWolfStunEndTime,
        wolfMoving: newWolfMoving,
        temporaryMessage,
      };
    });
  }, [hookUseBomb, hookBombCooldownEndTime, createExplosion, addExplosionMark, startBombCooldown]);

  // use hunter's cloak to become invisible
  const useCloak = useCallback(() => {
    setGameState((prev) => {
      // check if player has cloak and is not on cooldown
      const hasCloak = prev.inventory.includes("cloak");
      const isOnCooldown = prev.cloakCooldownEndTime !== null && Date.now() < prev.cloakCooldownEndTime;

      if (!hasCloak || prev.gameOver || prev.playerEnteredHouse || isOnCooldown || prev.playerInvisible) {
        return prev;
      }

      // activate invisibility
      const invisibilityEndTime = Date.now() + CLOAK_INVISIBILITY_DURATION;
      const cooldownEndTime = Date.now() + CLOAK_COOLDOWN_DURATION;

      return {
        ...prev,
        playerInvisible: true,
        cloakInvisibilityEndTime: invisibilityEndTime,
        cloakCooldownEndTime: cooldownEndTime,
        wolfMoving: false, // stop wolf when player becomes invisible
        temporaryMessage: { text: "🧥 INVISIBLE!", type: 'success' as const },
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
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
      cloakSpawnTimerRef.current = null;
    }
    if (wolfConfusionIntervalRef.current) {
      clearInterval(wolfConfusionIntervalRef.current);
      wolfConfusionIntervalRef.current = null;
    }
    clearGameStartTime();
    resetBombMechanics();

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
      gridSize: getGridSize(), // preserve or update grid size on reset
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
      // explosion marks
      explosionMarks: [],
      // reset wolf speed to base delay
      currentWolfDelay: ENEMY_DELAY,
      // reset stun count
      wolfStunCount: 0,
      // reset hunter's cloak system
      playerInvisible: false,
      cloakInvisibilityEndTime: null,
      cloakCooldownEndTime: null,
      cloakSpawned: false,
      // reset pause state
      paused: false,
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

  // pause the game
  const pauseGame = useCallback(() => {
    setGameState((prev) => {
      // don't pause if game is over, completed, or already paused
      if (prev.gameOver || prev.playerEnteredHouse || prev.isStuck || prev.paused) {
        return prev;
      }
      return {
        ...prev,
        paused: true,
        playerCanMove: false,
        wolfMoving: false,
      };
    });
  }, []);

  // unpause the game
  const unpauseGame = useCallback(() => {
    setGameState((prev) => {
      // don't unpause if game is over, completed, or not paused
      if (prev.gameOver || prev.playerEnteredHouse || prev.isStuck || !prev.paused) {
        return prev;
      }
      return {
        ...prev,
        paused: false,
        playerCanMove: true,
        wolfMoving: !prev.wolfStunned && !prev.playerInvisible,
      };
    });
  }, []);

  // toggle pause state
  const togglePause = useCallback(() => {
    setGameState((prev) => {
      // don't allow pausing if game is over, completed, or stuck
      if (prev.gameOver || prev.playerEnteredHouse || prev.isStuck) {
        return prev;
      }
      if (prev.paused) {
        return {
          ...prev,
          paused: false,
          playerCanMove: true,
          wolfMoving: !prev.wolfStunned && !prev.playerInvisible,
        };
      } else {
        return {
          ...prev,
          paused: true,
          playerCanMove: false,
          wolfMoving: false,
        };
      }
    });
  }, []);

  return {
    gameState,
    movePlayer,
    moveWolf,
    resetGame,
    initializeGame,
    useBomb,
    useCloak,
    clearTemporaryMessage,
    pauseGame,
    unpauseGame,
    togglePause,
    startItemSpawning,
  };
};

