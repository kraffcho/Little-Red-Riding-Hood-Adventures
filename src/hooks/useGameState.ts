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
import { getLevelConfig } from "../constants/levelConfig";
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

// main game state orchestrator - coordinates all game logic and state updates
export const useGameState = () => {
  const { generateLevel } = useLevelState();
  const { itemSpawnTimerRef, cloakSpawnTimerRef } = useInventoryState();
  const { gameStartTimeRef, setGameStartTime, clearGameStartTime } = useGameLifecycle();

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
    setCurrentWolfDelay,
  } = useWolfState();

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
    gridSize: getGridSize(),
    inventory: [],
    specialItems: [],
    wolfStunned: false,
    wolfStunEndTime: null,
    explosionEffect: null,
    currentLevel: 1,
    bombCooldownEndTime: null,
    temporaryMessage: null,
    explosionMarks: [],
    currentWolfDelay: ENEMY_DELAY,
    wolfStunCount: 0,
    playerInvisible: false,
    cloakInvisibilityEndTime: null,
    cloakCooldownEndTime: null,
    cloakSpawned: false,
    paused: false,
  });

  const initializeGame = useCallback((level: number = 1) => {
    const levelData = generateLevel(level);

    if (!levelData) {
      const gridSize = getGridSize();
      const wolfStartPosition = getWolfStartPosition(gridSize);
      const grannyHousePosition = getGrannyHousePosition(gridSize);

      console.error(`❌ Failed to generate playable level. Reason: Level generation failed`);

      resetWolfState();
      setWolfPositionState(wolfStartPosition);

      resetPlayerState();
      setPlayerPositionState(PLAYER_START_POSITION);
      setPlayerCanMoveState(false);

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
        inventory: [],
        specialItems: [],
        explosionEffect: null,
      }));
      return;
    }

    const levelConfig = getLevelConfig(level);
    const initialStuckCheck = isPlayerStuck(
      PLAYER_START_POSITION,
      levelData.flowerPositions,
      levelData.treePositions,
      levelData.grannyHousePosition,
      false,
      levelData.gridSize,
      0,
      levelConfig.numFlowers
    );

    resetWolfSpeed();
    setCurrentWolfDelay(levelConfig.enemyDelay);
    setWolfPositionState(levelData.wolfStartPosition);
    setWolfDirectionState("down");
    setWolfMovingState(!initialStuckCheck.stuck);

    initializePlayer();
    setPlayerCanMoveState(!initialStuckCheck.stuck);

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
      // level tracking - use provided level
      currentLevel: level,
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
  }, [generateLevel, resetWolfSpeed, resetWolfState, resetPlayerState, setWolfPositionState, setWolfDirectionState, setWolfMovingState, initializePlayer, setPlayerCanMoveState, setPlayerPositionState, setCurrentWolfDelay]);

  useEffect(() => {
    initializeGame(1);
  }, [initializeGame]);

  const movePlayer = useCallback(
    (direction: Direction) => {
      setGameState((prev) => {
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
          currentLevel: prev.currentLevel,
        });

        if (!moveResult.success || !moveResult.newPosition) {
          return prev;
        }

        const newPosition = moveResult.newPosition;

        setPlayerPositionState(newPosition);
        setPlayerDirectionState(direction);

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

        const levelConfig = getLevelConfig(prev.currentLevel);
        const allFlowersCollected = newCollectedFlowers === levelConfig.numFlowers;
        if (allFlowersCollected && !hookIsHouseOpen) {
          openHouse();
        }

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

        if (moveResult.enteredHouse) {
          setPlayerEnteredHouseState(true);

          if (hookPlayerInvisible) {
            clearInvisibility();
          }
        }

        const wolfWon = moveResult.collision || false;

        const stuck = moveResult.stuck || false;
        if (stuck && !prev.isStuck && moveResult.stuckReason) {
          console.log(`🚫 PLAYER STUCK at position (${newPosition.x}, ${newPosition.y}): ${moveResult.stuckReason}`);
        }

        let temporaryMessage = prev.temporaryMessage;
        if (hasItem && collectedItem) {
          if (collectedItem.type === "bomb") {
            temporaryMessage = { text: "+1 💣 BOMB!", type: 'success' as const };
          } else if (collectedItem.type === "cloak") {
            temporaryMessage = { text: "🧥 HUNTER'S CLOAK!", type: 'success' as const };
          }
        }

        if (moveResult.enteredHouse || stuck || hookWolfStunned) {
          setWolfMovingState(false);
        }

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

  const moveWolf = useCallback(() => {
    setGameState((prev) => {
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
        if (result.stuck) {
          const wolfStuckReason = `Wolf at (${hookWolfPosition.x}, ${hookWolfPosition.y}) cannot reach player at (${prev.playerPosition.x}, ${prev.playerPosition.y}) - no path exists`;
          console.log(`🐺 WOLF STUCK: ${wolfStuckReason}`);
          setWolfMovingState(false);
          return prev;
        }

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
      }

      setWolfPositionState(result.newPosition);
      setWolfDirectionState(result.direction);

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

  const spawnSpecialItem = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || prev.playerEnteredHouse || prev.paused) {
        if (prev.gameOver || prev.playerEnteredHouse) {
          if (itemSpawnTimerRef.current) {
            clearTimeout(itemSpawnTimerRef.current);
            itemSpawnTimerRef.current = null;
          }
        }
        if (prev.paused && !prev.gameOver && !prev.playerEnteredHouse) {
          if (itemSpawnTimerRef.current) {
            clearTimeout(itemSpawnTimerRef.current);
          }
          itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);
        }
        return prev;
      }

      const levelConfig = getLevelConfig(prev.currentLevel);
      if (!levelConfig.bombUnlocked) {
        return prev;
      }

      const currentBombCount = prev.specialItems.filter((item) => item.type === "bomb").length;

      if (currentBombCount >= MAX_BOMBS_ON_MAP) {
        if (itemSpawnTimerRef.current) {
          clearTimeout(itemSpawnTimerRef.current);
        }
        itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);
        return prev;
      }

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
        if (itemSpawnTimerRef.current) {
          clearTimeout(itemSpawnTimerRef.current);
        }
        itemSpawnTimerRef.current = setTimeout(spawnSpecialItem, ITEM_SPAWN_DELAY);
        return prev;
      }

      const newItem: SpecialItem = {
        id: generateItemId(),
        type: "bomb",
        position: itemPosition,
      };

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

  // spawn cloak once per level at random time (20-40s)
  const spawnCloak = useCallback(() => {
    setGameState((prev) => {
      const levelConfig = getLevelConfig(prev.currentLevel);
      if (!levelConfig.cloakUnlocked) {
        return prev;
      }

      if (prev.gameOver || prev.playerEnteredHouse || prev.cloakSpawned || prev.paused) {
        if (prev.gameOver || prev.playerEnteredHouse || prev.cloakSpawned) {
          if (cloakSpawnTimerRef.current) {
            clearTimeout(cloakSpawnTimerRef.current);
            cloakSpawnTimerRef.current = null;
          }
        }
        if (prev.paused && !prev.gameOver && !prev.playerEnteredHouse && !prev.cloakSpawned) {
          if (cloakSpawnTimerRef.current) {
            clearTimeout(cloakSpawnTimerRef.current);
          }
          cloakSpawnTimerRef.current = setTimeout(spawnCloak, 2000);
        }
        return prev;
      }

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

      markCloakSpawned();

      return {
        ...prev,
        specialItems: [...prev.specialItems, newItem],
        temporaryMessage: { text: "🧥 HUNTER'S CLOAK APPEARED!", type: 'success' as const },
      };
    });
  }, []);

  const startItemSpawning = useCallback(() => {
    const isGameInitialized = gameState.playerPosition.x >= 0 && gameState.playerPosition.y >= 0;

    if (!isGameInitialized || gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck) {
      return;
    }

    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
    }
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
    }

    setGameStartTime(Date.now());

    const levelConfig = getLevelConfig(gameState.currentLevel);

    if (levelConfig.bombUnlocked) {
      itemSpawnTimerRef.current = setTimeout(() => {
        spawnSpecialItem();
      }, ITEM_SPAWN_DELAY);
    }

    if (levelConfig.cloakUnlocked) {
      const cloakSpawnDelay = Math.floor(
        Math.random() * (CLOAK_SPAWN_DELAY_MAX - CLOAK_SPAWN_DELAY_MIN + 1) + CLOAK_SPAWN_DELAY_MIN
      );
      cloakSpawnTimerRef.current = setTimeout(() => {
        spawnCloak();
      }, cloakSpawnDelay);
    }
  }, [gameState.playerPosition, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, spawnSpecialItem, spawnCloak]);

  useEffect(() => {
    if (gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck) {
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

  // wake wolf when stun expires and resume movement
  const stunTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stunTimerRef.current) {
      clearTimeout(stunTimerRef.current);
      stunTimerRef.current = null;
    }

    if (hookWolfStunned && hookWolfStunEndTime) {
      const stunEndTime = hookWolfStunEndTime;
      const stunDuration = stunEndTime - Date.now();

      if (stunDuration > 0) {
        stunTimerRef.current = setTimeout(() => {
          wakeWolf();

          const resumeMovement = () => {
            setGameState((prev) => {
              const playerInHouse = positionsEqual(prev.playerPosition, prev.grannyHousePosition) && prev.isHouseOpen;
              if (!prev.gameOver && !prev.isStuck && !prev.playerInvisible && !playerInHouse) {
                setWolfMovingState(true);
              }
              return prev;
            });
          };

          resumeMovement();
          setTimeout(resumeMovement, 50);

          stunTimerRef.current = null;
        }, stunDuration);
      } else {
        wakeWolf();
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

  // animate wolf confusion when player is invisible
  useEffect(() => {
    if (hookPlayerInvisible) {
      startWolfConfusion((newDirection: Direction) => {
        setGameState((prev) => ({
          ...prev,
          wolfDirection: newDirection,
        }));
      });
    } else {
      stopWolfConfusion();
    }

    return () => {
      stopWolfConfusion();
    };
  }, [hookPlayerInvisible, startWolfConfusion, stopWolfConfusion]);

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
        setWolfMovingState(true);
      }
    }
  }, [gameState.gameOver, gameState.isStuck, gameState.playerPosition, gameState.grannyHousePosition, gameState.isHouseOpen, gameState.wolfStunned, gameState.wolfMoving, hookPlayerInvisible, hookWolfStunned, hookWolfStunEndTime, hookWolfMoving, setWolfMovingState]);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      explosionEffect: hookExplosionEffect,
      explosionMarks: hookExplosionMarks,
      bombCooldownEndTime: hookBombCooldownEndTime,
    }));
  }, [hookExplosionEffect, hookExplosionMarks, hookBombCooldownEndTime]);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      playerInvisible: hookPlayerInvisible,
      cloakInvisibilityEndTime: hookCloakInvisibilityEndTime,
      cloakCooldownEndTime: hookCloakCooldownEndTime,
      cloakSpawned: hookCloakSpawned,
    }));
  }, [hookPlayerInvisible, hookCloakInvisibilityEndTime, hookCloakCooldownEndTime, hookCloakSpawned]);

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

  const useBomb = useCallback(() => {
    setGameState((prev) => {
      const levelConfig = getLevelConfig(prev.currentLevel);
      if (!levelConfig.bombUnlocked) {
        return prev;
      }

      const bombIndex = prev.inventory.indexOf("bomb");
      const isOnCooldown = hookBombCooldownEndTime !== null && Date.now() < hookBombCooldownEndTime;

      if (bombIndex === -1 || prev.gameOver || prev.playerEnteredHouse || isOnCooldown) {
        return prev;
      }

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

      const newInventory = prev.inventory.filter((_, index) => index !== bombIndex);

      createExplosion(prev.playerPosition);
      addExplosionMark(prev.playerPosition);
      startBombCooldown();

      if (bombResult.wolfStunned && bombResult.stunEndTime) {
        const stunDuration = bombResult.stunEndTime - Date.now();
        stunWolf(stunDuration);
      }

      const temporaryMessage = bombResult.wolfStunned
        ? { text: "WOLF STUNNED!", type: 'success' as const }
        : { text: "MISSED!", type: 'error' as const };

      return {
        ...prev,
        inventory: newInventory,
        temporaryMessage,
      };
    });
  }, [hookUseBomb, hookBombCooldownEndTime, createExplosion, addExplosionMark, startBombCooldown, stunWolf]);

  const useCloak = useCallback(() => {
    setGameState((prev) => {
      const levelConfig = getLevelConfig(prev.currentLevel);
      if (!levelConfig.cloakUnlocked) {
        return prev;
      }

      const hasCloak = prev.inventory.includes("cloak");
      const isOnCooldown = hookCloakCooldownEndTime !== null && Date.now() < hookCloakCooldownEndTime;

      if (!hasCloak || prev.gameOver || prev.playerEnteredHouse || isOnCooldown || hookPlayerInvisible) {
        return prev;
      }

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

      activateInvisibility();

      return {
        ...prev,
        wolfMoving: false,
        temporaryMessage: { text: "🧥 INVISIBLE!", type: 'success' as const },
      };
    });
  }, [hookUseCloak, hookCloakCooldownEndTime, hookPlayerInvisible, activateInvisibility]);

  const resetGame = useCallback(() => {
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
      cloakSpawnTimerRef.current = null;
    }
    clearGameStartTime();
    resetBombMechanics();
    resetCloakMechanics();
    resetWolfState();
    resetPlayerState();

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
      gridSize: getGridSize(),
      inventory: [],
      specialItems: [],
      wolfStunned: false,
      wolfStunEndTime: null,
      explosionEffect: null,
      currentLevel: 1,
      bombCooldownEndTime: null,
      temporaryMessage: null,
      explosionMarks: [],
      currentWolfDelay: ENEMY_DELAY,
      wolfStunCount: 0,
      playerInvisible: false,
      cloakInvisibilityEndTime: null,
      cloakCooldownEndTime: null,
      cloakSpawned: false,
      paused: false,
    });

    setTimeout(() => {
      initializeGame(1);
    }, 100);
  }, [initializeGame, resetWolfState, resetPlayerState, clearGameStartTime, resetBombMechanics, resetCloakMechanics]);

  const nextLevel = useCallback(() => {
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
      cloakSpawnTimerRef.current = null;
    }

    clearGameStartTime();
    resetBombMechanics();
    resetCloakMechanics();
    resetWolfState();
    resetPlayerState();

    setGameState((prev) => {
      const newLevel = prev.currentLevel + 1;

      setTimeout(() => {
        initializeGame(newLevel);
      }, 100);

      return {
        ...prev,
        playerPosition: { x: -1, y: -1 },
        wolfPosition: { x: -1, y: -1 },
        playerEnteredHouse: false,
        gameOver: false,
        isStuck: false,
        paused: false,
        collectedFlowers: 0,
        isHouseOpen: false,
        inventory: [],
        specialItems: [],
        explosionEffect: null,
        temporaryMessage: null,
        explosionMarks: [],
        currentLevel: newLevel,
        wolfStunned: false,
        wolfStunEndTime: null,
        playerInvisible: false,
        cloakInvisibilityEndTime: null,
        cloakCooldownEndTime: null,
        cloakSpawned: false,
        bombCooldownEndTime: null,
      };
    });
  }, [initializeGame, clearGameStartTime, resetBombMechanics, resetCloakMechanics, resetWolfState, resetPlayerState, setCurrentWolfDelay]);

  const replayLevel = useCallback(() => {
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
      cloakSpawnTimerRef.current = null;
    }

    clearGameStartTime();
    resetBombMechanics();
    resetCloakMechanics();
    resetWolfState();
    resetPlayerState();

    setGameState((prev) => {
      const sameLevel = prev.currentLevel;

      setTimeout(() => {
        initializeGame(sameLevel);
      }, 100);

      return {
        ...prev,
        playerPosition: { x: -1, y: -1 },
        wolfPosition: { x: -1, y: -1 },
        playerEnteredHouse: false,
        gameOver: false,
        isStuck: false,
        paused: false,
        collectedFlowers: 0,
        isHouseOpen: false,
        inventory: [],
        specialItems: [],
        explosionEffect: null,
        temporaryMessage: null,
        explosionMarks: [],
        currentLevel: sameLevel,
        wolfStunned: false,
        wolfStunEndTime: null,
        playerInvisible: false,
        cloakInvisibilityEndTime: null,
        cloakCooldownEndTime: null,
        cloakSpawned: false,
        bombCooldownEndTime: null,
      };
    });
  }, [initializeGame, clearGameStartTime, resetBombMechanics, resetCloakMechanics, resetWolfState, resetPlayerState, setCurrentWolfDelay]);

  const clearTemporaryMessage = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      temporaryMessage: null,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => {
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

  const unpauseGame = useCallback(() => {
    setGameState((prev) => {
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

  const togglePause = useCallback(() => {
    setGameState((prev) => {
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
    nextLevel,
    replayLevel,
    useBomb,
    useCloak,
    clearTemporaryMessage,
    pauseGame,
    unpauseGame,
    togglePause,
    startItemSpawning,
  };
};

