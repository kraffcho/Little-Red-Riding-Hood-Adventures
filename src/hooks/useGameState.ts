import { useState, useEffect, useCallback, useRef } from "react";
import { Position, Direction, GameState, SpecialItem } from "../types";
import {
  NUM_FLOWERS,
  PLAYER_START_POSITION,
  getWolfStartPosition,
  getGrannyHousePosition,
  getGridSize,
  ITEM_SPAWN_DELAY,
  MAX_BOMBS_ON_MAP,
  ENEMY_DELAY,
  CLOAK_SPAWN_DELAY_MIN,
  CLOAK_SPAWN_DELAY_MAX,
} from "../constants/gameConfig";
import {
  positionsEqual,
  isPlayerStuck,
  generateRandomItemPosition,
  generateItemId,
} from "../utils";
import { useLevelState } from "./useLevelState";
import { useInventoryState } from "./useInventoryState";
import { useGameLifecycle } from "./useGameLifecycle";
import { useBombMechanics } from "./useBombMechanics";
import { useCloakMechanics } from "./useCloakMechanics";
import { useWolfState } from "./useWolfState";
import { usePlayerState } from "./usePlayerState";

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
    markCloakSpawned,
    resetCloakMechanics,
  } = useCloakMechanics();

  // use wolf state hook for wolf-related logic
  // Note: Wolf state is synced with gameState for compatibility
  const {
    wolfPosition: hookWolfPosition,
    wolfDirection: hookWolfDirection,
    wolfMoving: hookWolfMoving,
    wolfStunned: hookWolfStunned,
    wolfStunEndTime: hookWolfStunEndTime,
    currentWolfDelay: hookCurrentWolfDelay,
    wolfStunCount: hookWolfStunCount,
    wolfWon: hookWolfWon,
    setWolfPositionState,
    setWolfDirectionState,
    setWolfMovingState,
    stunWolf,
    wakeWolf,
    moveWolf: hookMoveWolf,
    resetWolfSpeed,
    resetWolfState,
  } = useWolfState();

  // use player state hook for player-related logic
  // Note: Player state is synced with gameState for compatibility
  const {
    playerPosition: hookPlayerPosition,
    playerDirection: hookPlayerDirection,
    playerCanMove: hookPlayerCanMove,
    playerEnteredHouse: hookPlayerEnteredHouse,
    isHouseOpen: hookIsHouseOpen,
    setPlayerPositionState,
    setPlayerDirectionState,
    setPlayerCanMoveState,
    openHouse,
    setPlayerEnteredHouseState,
    movePlayer: hookMovePlayer,
    resetPlayerState,
    initializePlayer,
  } = usePlayerState();

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

      // reset wolf state using hook
      resetWolfState();
      setWolfPositionState(wolfStartPosition);

      // reset player state using hook
      resetPlayerState();
      setPlayerPositionState(PLAYER_START_POSITION);
      setPlayerCanMoveState(false);

      // still set up the game state so the board shows something
      setGameState((prev) => ({
        ...prev,
        playerPosition: PLAYER_START_POSITION,
        grannyHousePosition,
        treePositions: [],
        flowers: [],
        collectedFlowers: 0,
        isHouseOpen: false,
        playerEnteredHouse: false,
        playerCanMove: false,
        wolfWon: false,
        gameOver: true,
        playerDirection: "down",
        isStuck: true,
        stuckReason: "Level generation failed",
        gridSize: gridSize,
        // reset special items
        inventory: [],
        specialItems: [],
        explosionEffect: null,
        // Note: wolf state will be synced from hook via useEffect
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

    // reset wolf state using hook
    resetWolfSpeed();
    setWolfPositionState(levelData.wolfStartPosition);
    setWolfDirectionState("down");
    setWolfMovingState(!initialStuckCheck.stuck);

    // reset player state using hook
    initializePlayer();
    setPlayerCanMoveState(!initialStuckCheck.stuck);

    // level generation succeeded - set up game state
    setGameState((prev) => ({
      ...prev,
      grannyHousePosition: levelData.grannyHousePosition,
      treePositions: levelData.treePositions,
      flowers: levelData.flowerPositions,
      collectedFlowers: 0,
      gameOver: initialStuckCheck.stuck,
      isStuck: initialStuckCheck.stuck,
      stuckReason: initialStuckCheck.reason,
      gridSize: levelData.gridSize, // store the responsive grid size
      // reset special items
      inventory: [],
      specialItems: [],
      explosionEffect: null,
      // level tracking - start at level 1
      currentLevel: 1,
      // temporary message
      temporaryMessage: null,
      // explosion marks
      explosionMarks: [],
      // Note: player state (position, direction, canMove, enteredHouse, isHouseOpen) will be synced from hook via useEffect
      // Note: wolf state (position, direction, moving, stunned, etc.) will be synced from hook via useEffect
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
    // Note: wolfConfusionIntervalRef is now managed by useCloakMechanics hook

    // Note: We're using generateLevel from useLevelState for level generation logic,
    // but keeping all state in gameState for now to maintain backward compatibility
  }, [generateLevel, resetWolfSpeed, resetWolfState, resetPlayerState, setWolfPositionState, setWolfDirectionState, setWolfMovingState, initializePlayer, setPlayerCanMoveState, setPlayerPositionState]);

  // start the game when component loads
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // move the player in the given direction
  const movePlayer = useCallback(
    (direction: Direction) => {
      setGameState((prev) => {
        // use hook's movePlayer function to handle movement logic
        const moveResult = hookMovePlayer({
          direction,
          treePositions: prev.treePositions,
          gridSize: prev.gridSize,
          wolfPosition: hookWolfPosition,
          playerInvisible: hookPlayerInvisible,
          grannyHousePosition: prev.grannyHousePosition,
          flowers: prev.flowers,
          collectedFlowers: prev.collectedFlowers,
          isHouseOpen: hookIsHouseOpen,
          gameOver: prev.gameOver,
          paused: prev.paused,
        });

        if (!moveResult.success || !moveResult.newPosition) {
          return prev;
        }

        const newPosition = moveResult.newPosition;

        // update hook state (will sync to gameState via useEffect)
        setPlayerPositionState(newPosition);
        setPlayerDirectionState(direction);

        // handle flower collection
        const flowerIndex = prev.flowers.findIndex(
          (flower) => flower.x === newPosition.x && flower.y === newPosition.y
        );
        const hasFlower = moveResult.collectedFlower || flowerIndex !== -1;
        const newFlowers = hasFlower
          ? prev.flowers.filter((_, index) => index !== flowerIndex)
          : prev.flowers;
        const newCollectedFlowers = hasFlower
          ? prev.collectedFlowers + 1
          : prev.collectedFlowers;

        // check if all flowers collected - open house via hook
        const allFlowersCollected = newCollectedFlowers === NUM_FLOWERS;
        if (allFlowersCollected && !hookIsHouseOpen) {
          openHouse();
        }

        // see if we picked up a special item
        const itemIndex = prev.specialItems.findIndex(
          (item) => item.position.x === newPosition.x && item.position.y === newPosition.y
        );
        const hasItem = itemIndex !== -1;
        const collectedItem = hasItem ? prev.specialItems[itemIndex] : null;
        const newSpecialItems = hasItem
          ? prev.specialItems.filter((_, index) => index !== itemIndex)
          : prev.specialItems;
        const newInventory = hasItem && collectedItem
          ? [...prev.inventory, collectedItem.type]
          : prev.inventory;

        // handle house entry
        if (moveResult.enteredHouse) {
          setPlayerEnteredHouseState(true);

          // if player enters house while invisible, immediately clear invisibility
          if (hookPlayerInvisible) {
            clearInvisibility();
          }
        }

        // handle collision with wolf
        const wolfWon = moveResult.collision || false;

        // handle stuck state
        const stuck = moveResult.stuck || false;
        if (stuck && !prev.isStuck && moveResult.stuckReason) {
          console.log(`🚫 PLAYER STUCK at position (${newPosition.x}, ${newPosition.y}): ${moveResult.stuckReason}`);
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

        // update wolf movement based on game state
        if (moveResult.enteredHouse || stuck || hookWolfStunned) {
          setWolfMovingState(false);
        }

        // Note: player state (position, direction, canMove, enteredHouse, isHouseOpen) will be synced from hook via useEffect
        return {
          ...prev,
          flowers: newFlowers,
          collectedFlowers: newCollectedFlowers,
          specialItems: newSpecialItems,
          inventory: newInventory,
          wolfWon,
          gameOver: wolfWon || stuck,
          isStuck: stuck,
          stuckReason: moveResult.stuckReason,
          temporaryMessage,
        };
      });
    },
    [hookMovePlayer, hookWolfPosition, hookPlayerInvisible, hookIsHouseOpen, hookWolfStunned, setPlayerPositionState, setPlayerDirectionState, setPlayerEnteredHouseState, setWolfMovingState, openHouse, clearInvisibility]
  );

  // move the wolf toward the player using pathfinding
  const moveWolf = useCallback(() => {
    setGameState((prev) => {
      // use hook's moveWolf function
      const result = hookMoveWolf({
        playerPosition: prev.playerPosition,
        treePositions: prev.treePositions,
        gridSize: prev.gridSize,
        gameOver: prev.gameOver,
        isStuck: prev.isStuck ?? false,
        playerInvisible: hookPlayerInvisible,
        isHouseOpen: prev.isHouseOpen,
        playerInHouse: positionsEqual(prev.playerPosition, prev.grannyHousePosition) && prev.isHouseOpen,
      });

      if (!result.newPosition) {
        // wolf didn't move - handle stuck or collision cases
        if (result.stuck) {
          const wolfStuckReason = `Wolf at (${hookWolfPosition.x}, ${hookWolfPosition.y}) cannot reach player at (${prev.playerPosition.x}, ${prev.playerPosition.y}) - no path exists`;
          console.log(`🐺 WOLF STUCK: ${wolfStuckReason}`);
          setWolfMovingState(false);
          return prev;
        }

        if (result.collision) {
          // wolf caught the player (already at same position)
          setWolfMovingState(false);
          return {
            ...prev,
            playerCanMove: false,
            wolfWon: true,
            gameOver: true,
          };
        }

        return prev;
      }

      // wolf moved - update hook state (will sync to gameState via useEffect)
      setWolfPositionState(result.newPosition);
      setWolfDirectionState(result.direction);

      // check collision with new position
      if (result.collision) {
        setWolfMovingState(false);
        return {
          ...prev,
          playerCanMove: false,
          wolfWon: true,
          gameOver: true,
        };
      }

      return prev;
    });
  }, [hookMoveWolf, hookPlayerInvisible, hookWolfPosition, setWolfPositionState, setWolfDirectionState, setWolfMovingState]);

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

      // mark cloak as spawned using hook function (state will sync via useEffect)
      markCloakSpawned();

      return {
        ...prev,
        specialItems: [...prev.specialItems, newItem],
        // Note: cloakSpawned will be synced from hook via useEffect
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

  // check when the wolf's stun expires and wake it up, then resume movement if the game is still active
  const stunTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // clear any existing timer when stun state changes
    if (stunTimerRef.current) {
      clearTimeout(stunTimerRef.current);
      stunTimerRef.current = null;
    }

    if (hookWolfStunned && hookWolfStunEndTime) {
      const stunEndTime = hookWolfStunEndTime;
      const stunDuration = stunEndTime - Date.now();

      // only set timer if stun hasn't already expired
      if (stunDuration > 0) {
        stunTimerRef.current = setTimeout(() => {
          // wolf is awake now, use the hook's wakeWolf function (it handles speed increase automatically)
          wakeWolf();

          // immediately try to resume movement - use current gameState at timeout execution
          // check conditions synchronously at timeout execution time
          const resumeMovement = () => {
            setGameState((prev) => {
              const playerInHouse = positionsEqual(prev.playerPosition, prev.grannyHousePosition) && prev.isHouseOpen;
              if (!prev.gameOver && !prev.isStuck && !prev.playerInvisible && !playerInHouse) {
                setWolfMovingState(true);
              }
              return prev;
            });
          };

          // try immediately
          resumeMovement();
          // also try after a small delay as fallback in case state hasn't synced yet
          setTimeout(resumeMovement, 50);

          stunTimerRef.current = null;
        }, stunDuration);
      } else {
        // stun already expired, wake immediately
        wakeWolf();
        // resume movement immediately for already-expired stuns
        setGameState((prev) => {
          const playerInHouse = positionsEqual(prev.playerPosition, prev.grannyHousePosition) && prev.isHouseOpen;
          if (!prev.gameOver && !prev.isStuck && !prev.playerInvisible && !playerInHouse) {
            setWolfMovingState(true);
          }
          return prev;
        });
      }

      return () => {
        if (stunTimerRef.current) {
          clearTimeout(stunTimerRef.current);
          stunTimerRef.current = null;
        }
      };
    }
  }, [hookWolfStunned, hookWolfStunEndTime, wakeWolf, setWolfMovingState]);

  // coordinate wolf confusion animation when player becomes invisible (hook handles the interval)
  useEffect(() => {
    if (hookPlayerInvisible) {
      // start confusion animation using hook function
      startWolfConfusion((newDirection: Direction) => {
        setGameState((prev) => ({
          ...prev,
          wolfDirection: newDirection,
        }));
      });
    } else {
      // stop confusion animation when player becomes visible
      stopWolfConfusion();
    }

    return () => {
      stopWolfConfusion();
    };
  }, [hookPlayerInvisible, startWolfConfusion, stopWolfConfusion]);

  // resume wolf movement when invisibility ends
  useEffect(() => {
    if (!hookPlayerInvisible && gameState.wolfMoving === false && !gameState.gameOver && !gameState.isStuck && !gameState.wolfStunned) {
      setGameState((prev) => ({
        ...prev,
        wolfMoving: true,
      }));
    }
  }, [hookPlayerInvisible, gameState.wolfMoving, gameState.gameOver, gameState.isStuck, gameState.wolfStunned]);

  // fallback: resume wolf movement after stun expires if it's not moving but should be
  useEffect(() => {
    // only check if stun has expired (not stunned in hook and gameState, and no stun end time)
    const stunExpired = !hookWolfStunned && hookWolfStunEndTime === null && !gameState.wolfStunned;
    const notMoving = !hookWolfMoving && !gameState.wolfMoving;

    if (stunExpired && notMoving) {
      const playerInHouse = positionsEqual(gameState.playerPosition, gameState.grannyHousePosition) && gameState.isHouseOpen;
      const shouldBeMoving =
        !gameState.gameOver &&
        !gameState.isStuck &&
        !hookPlayerInvisible &&
        !playerInHouse;

      if (shouldBeMoving) {
        // wolf should be moving but isn't - resume movement
        setWolfMovingState(true);
      }
    }
  }, [gameState.gameOver, gameState.isStuck, gameState.playerPosition, gameState.grannyHousePosition, gameState.isHouseOpen, gameState.wolfStunned, gameState.wolfMoving, hookPlayerInvisible, hookWolfStunned, hookWolfStunEndTime, hookWolfMoving, setWolfMovingState]);

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

  // sync wolf state from hook to gameState
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      wolfPosition: hookWolfPosition,
      wolfDirection: hookWolfDirection,
      wolfMoving: hookWolfMoving,
      wolfStunned: hookWolfStunned,
      wolfStunEndTime: hookWolfStunEndTime,
      currentWolfDelay: hookCurrentWolfDelay,
      wolfStunCount: hookWolfStunCount,
      wolfWon: hookWolfWon,
    }));
  }, [hookWolfPosition, hookWolfDirection, hookWolfMoving, hookWolfStunned, hookWolfStunEndTime, hookCurrentWolfDelay, hookWolfStunCount, hookWolfWon]);

  // sync player state from hook to gameState
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      playerPosition: hookPlayerPosition,
      playerDirection: hookPlayerDirection,
      playerCanMove: hookPlayerCanMove,
      playerEnteredHouse: hookPlayerEnteredHouse,
      isHouseOpen: hookIsHouseOpen,
    }));
  }, [hookPlayerPosition, hookPlayerDirection, hookPlayerCanMove, hookPlayerEnteredHouse, hookIsHouseOpen]);

  // use a bomb item
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

      if (bombResult.wolfStunned && bombResult.stunEndTime) {
        // stun the wolf using hook function
        const stunDuration = bombResult.stunEndTime - Date.now();
        stunWolf(stunDuration);
      }

      // set temporary message based on whether wolf was stunned
      const temporaryMessage = bombResult.wolfStunned
        ? { text: "WOLF STUNNED!", type: 'success' as const }
        : { text: "MISSED!", type: 'error' as const };

      // Note: wolf state (wolfStunned, wolfStunEndTime, wolfMoving) will be synced from hook via useEffect
      // Note: explosionEffect, explosionMarks, and bombCooldownEndTime will be synced from hook via useEffect
      return {
        ...prev,
        inventory: newInventory,
        temporaryMessage,
      };
    });
  }, [hookUseBomb, hookBombCooldownEndTime, createExplosion, addExplosionMark, startBombCooldown, stunWolf]);

  // use hunter's cloak to become invisible
  const useCloak = useCallback(() => {
    setGameState((prev) => {
      // check if player has cloak and is not on cooldown
      const hasCloak = prev.inventory.includes("cloak");
      const isOnCooldown = hookCloakCooldownEndTime !== null && Date.now() < hookCloakCooldownEndTime;

      if (!hasCloak || prev.gameOver || prev.playerEnteredHouse || isOnCooldown || hookPlayerInvisible) {
        return prev;
      }

      // use hook's useCloak function to validate and get times
      const cloakResult = hookUseCloak({
        hasCloak,
        gameOver: prev.gameOver,
        playerEnteredHouse: prev.playerEnteredHouse,
        isOnCooldown,
        alreadyInvisible: hookPlayerInvisible,
      });

      if (!cloakResult.success) {
        return prev;
      }

      // activate invisibility using hook function (it sets the state in the hook)
      activateInvisibility();

      // Note: cloak state (playerInvisible, cloakInvisibilityEndTime, cloakCooldownEndTime) will be synced from hook via useEffect
      return {
        ...prev,
        wolfMoving: false, // stop wolf when player becomes invisible
        temporaryMessage: { text: "🧥 INVISIBLE!", type: 'success' as const },
      };
    });
  }, [hookUseCloak, hookCloakCooldownEndTime, hookPlayerInvisible, activateInvisibility]);

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
    // Note: wolfConfusionIntervalRef is now managed by useCloakMechanics hook
    clearGameStartTime();
    resetBombMechanics();
    resetCloakMechanics(); // this will also clear wolfConfusionIntervalRef
    resetWolfState(); // reset all wolf state
    resetPlayerState(); // reset all player state

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
      wolfMoving: false, // will be synced from hook
      wolfWon: false, // will be synced from hook
      gameOver: false,
      isStuck: false,
      stuckReason: undefined,
      gridSize: getGridSize(), // preserve or update grid size on reset
      // reset special items
      inventory: [],
      specialItems: [],
      wolfStunned: false, // will be synced from hook
      wolfStunEndTime: null, // will be synced from hook
      explosionEffect: null,
      // level tracking - start at level 1
      currentLevel: 1,
      // bomb cooldown
      bombCooldownEndTime: null,
      // temporary message
      temporaryMessage: null,
      // explosion marks
      explosionMarks: [],
      // wolf speed - will be synced from hook
      currentWolfDelay: ENEMY_DELAY,
      wolfStunCount: 0,
      // Note: wolf state will be synced from hook via useEffect after resetWolfState() is called
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
  }, [initializeGame, resetWolfState, resetPlayerState, clearGameStartTime, resetBombMechanics, resetCloakMechanics]);

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

