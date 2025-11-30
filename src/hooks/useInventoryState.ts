import { useState, useCallback, useRef } from "react";
import { Position, ItemType, SpecialItem } from "../types";
import {
  ITEM_SPAWN_DELAY,
  MAX_BOMBS_ON_MAP,
  CLOAK_SPAWN_DELAY_MIN,
  CLOAK_SPAWN_DELAY_MAX,
  getGridSize,
} from "../constants/gameConfig";
import {
  generateRandomItemPosition,
  generateItemId,
} from "../utils";

/**
 * Hook that manages inventory and special items spawning on the map
 */
export const useInventoryState = () => {
  const [inventory, setInventory] = useState<ItemType[]>([]);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  
  const itemSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cloakSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Add an item to inventory
   */
  const addToInventory = useCallback((itemType: ItemType) => {
    setInventory((prev) => [...prev, itemType]);
  }, []);

  /**
   * Remove an item from inventory
   */
  const removeFromInventory = useCallback((itemType: ItemType) => {
    setInventory((prev) => {
      const index = prev.indexOf(itemType);
      if (index === -1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * Clear all inventory
   */
  const clearInventory = useCallback(() => {
    setInventory([]);
  }, []);

  /**
   * Add a special item to the map
   */
  const addSpecialItem = useCallback((item: SpecialItem) => {
    setSpecialItems((prev) => [...prev, item]);
  }, []);

  /**
   * Remove a special item from the map
   */
  const removeSpecialItem = useCallback((itemId: string) => {
    setSpecialItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  /**
   * Remove special item by position
   */
  const removeSpecialItemByPosition = useCallback((position: Position) => {
    setSpecialItems((prev) =>
      prev.filter(
        (item) => !(item.position.x === position.x && item.position.y === position.y)
      )
    );
  }, []);

  /**
   * Clear all special items from map
   */
  const clearSpecialItems = useCallback(() => {
    setSpecialItems([]);
  }, []);

  /**
   * Spawn a special item (bomb) on the map
   */
  const spawnSpecialItem = useCallback((context: {
    playerPosition: Position;
    wolfPosition: Position;
    grannyHousePosition: Position;
    flowers: Position[];
    treePositions: Position[];
    gridSize: number;
    gameOver: boolean;
    playerEnteredHouse: boolean;
    paused: boolean;
  }): { item: SpecialItem | null; shouldContinueSpawning: boolean } => {
    if (context.gameOver || context.playerEnteredHouse || context.paused) {
      return { item: null, shouldContinueSpawning: false };
    }

    // check how many bombs are already on the map
    const currentBombCount = specialItems.filter((item) => item.type === "bomb").length;

    // don't spawn if we've reached the max
    if (currentBombCount >= MAX_BOMBS_ON_MAP) {
      return { item: null, shouldContinueSpawning: true }; // continue spawning later
    }

    // find all existing positions to avoid
    const existingPositions: Position[] = [
      context.playerPosition,
      context.wolfPosition,
      context.grannyHousePosition,
      ...context.flowers,
      ...specialItems.map((item) => item.position),
    ];

    const itemPosition = generateRandomItemPosition(
      existingPositions,
      context.treePositions,
      context.gridSize,
      context.grannyHousePosition
    );

    if (!itemPosition) {
      // couldn't find a valid position, try again later
      return { item: null, shouldContinueSpawning: true };
    }

    const newItem: SpecialItem = {
      id: generateItemId(),
      type: "bomb", // for now, only bombs spawn
      position: itemPosition,
    };

    return { item: newItem, shouldContinueSpawning: true };
  }, [specialItems]);

  /**
   * Spawn the hunter's cloak once per level
   */
  const spawnCloak = useCallback((context: {
    playerPosition: Position;
    wolfPosition: Position;
    grannyHousePosition: Position;
    flowers: Position[];
    treePositions: Position[];
    gridSize: number;
    gameOver: boolean;
    playerEnteredHouse: boolean;
    paused: boolean;
    cloakSpawned: boolean;
  }): { item: SpecialItem | null; message: string | null } => {
    if (context.gameOver || context.playerEnteredHouse || context.cloakSpawned || context.paused) {
      return { item: null, message: null };
    }

    // find all existing positions to avoid
    const existingPositions: Position[] = [
      context.playerPosition,
      context.wolfPosition,
      context.grannyHousePosition,
      ...context.flowers,
      ...specialItems.map((item) => item.position),
    ];

    const itemPosition = generateRandomItemPosition(
      existingPositions,
      context.treePositions,
      context.gridSize,
      context.grannyHousePosition
    );

    if (!itemPosition) {
      return { item: null, message: null }; // couldn't find position
    }

    const newItem: SpecialItem = {
      id: generateItemId(),
      type: "cloak",
      position: itemPosition,
    };

    return {
      item: newItem,
      message: "🧥 HUNTER'S CLOAK APPEARED!",
    };
  }, [specialItems]);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (itemSpawnTimerRef.current) {
      clearTimeout(itemSpawnTimerRef.current);
      itemSpawnTimerRef.current = null;
    }
    if (cloakSpawnTimerRef.current) {
      clearTimeout(cloakSpawnTimerRef.current);
      cloakSpawnTimerRef.current = null;
    }
  }, []);

  /**
   * Reset inventory state
   */
  const resetInventory = useCallback(() => {
    setInventory([]);
    setSpecialItems([]);
    clearTimers();
  }, [clearTimers]);

  return {
    inventory,
    specialItems,
    itemSpawnTimerRef,
    cloakSpawnTimerRef,
    addToInventory,
    removeFromInventory,
    clearInventory,
    addSpecialItem,
    removeSpecialItem,
    removeSpecialItemByPosition,
    clearSpecialItems,
    spawnSpecialItem,
    spawnCloak,
    clearTimers,
    resetInventory,
  };
};

