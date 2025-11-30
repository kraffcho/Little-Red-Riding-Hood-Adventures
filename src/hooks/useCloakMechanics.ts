import { useState, useCallback, useEffect, useRef } from "react";
import { Direction } from "../types";
import {
  CLOAK_INVISIBILITY_DURATION,
  CLOAK_COOLDOWN_DURATION,
  CLOAK_WOLF_CONFUSION_INTERVAL,
} from "../constants/gameConfig";

/**
 * Hook that manages Hunter's Cloak mechanics: invisibility, cooldowns, and wolf confusion
 */
export const useCloakMechanics = () => {
  const [playerInvisible, setPlayerInvisible] = useState<boolean>(false);
  const [cloakInvisibilityEndTime, setCloakInvisibilityEndTime] = useState<number | null>(null);
  const [cloakCooldownEndTime, setCloakCooldownEndTime] = useState<number | null>(null);
  const [cloakSpawned, setCloakSpawned] = useState<boolean>(false);
  
  const wolfConfusionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Activate cloak invisibility
   */
  const activateInvisibility = useCallback(() => {
    const endTime = Date.now() + CLOAK_INVISIBILITY_DURATION;
    setPlayerInvisible(true);
    setCloakInvisibilityEndTime(endTime);
    setCloakCooldownEndTime(Date.now() + CLOAK_COOLDOWN_DURATION);
  }, []);

  /**
   * Clear invisibility immediately
   */
  const clearInvisibility = useCallback(() => {
    setPlayerInvisible(false);
    setCloakInvisibilityEndTime(null);
  }, []);

  /**
   * Check if cloak is on cooldown
   */
  const isCloakOnCooldown = useCallback((): boolean => {
    return cloakCooldownEndTime !== null && Date.now() < cloakCooldownEndTime;
  }, [cloakCooldownEndTime]);

  /**
   * Check if player is currently invisible
   */
  const isPlayerInvisible = useCallback((): boolean => {
    return playerInvisible;
  }, [playerInvisible]);

  /**
   * Mark cloak as spawned
   */
  const markCloakSpawned = useCallback(() => {
    setCloakSpawned(true);
  }, []);

  /**
   * Reset cloak spawn state
   */
  const resetCloakSpawned = useCallback(() => {
    setCloakSpawned(false);
  }, []);

  /**
   * Start wolf confusion animation (alternating direction)
   */
  const startWolfConfusion = useCallback((
    onDirectionChange: (direction: Direction) => void
  ) => {
    if (wolfConfusionIntervalRef.current) {
      clearInterval(wolfConfusionIntervalRef.current);
    }

    // start with current direction, then alternate
    let isLeft = true;
    wolfConfusionIntervalRef.current = setInterval(() => {
      onDirectionChange(isLeft ? "left" : "right");
      isLeft = !isLeft;
    }, CLOAK_WOLF_CONFUSION_INTERVAL);
  }, []);

  /**
   * Stop wolf confusion animation
   */
  const stopWolfConfusion = useCallback(() => {
    if (wolfConfusionIntervalRef.current) {
      clearInterval(wolfConfusionIntervalRef.current);
      wolfConfusionIntervalRef.current = null;
    }
  }, []);

  /**
   * Use the cloak - returns result of activation
   */
  const useCloak = useCallback((context: {
    hasCloak: boolean;
    gameOver: boolean;
    playerEnteredHouse: boolean;
    isOnCooldown: boolean;
    alreadyInvisible: boolean;
  }): {
    success: boolean;
    invisibilityEndTime?: number;
    cooldownEndTime?: number;
  } => {
    if (
      !context.hasCloak ||
      context.gameOver ||
      context.playerEnteredHouse ||
      context.isOnCooldown ||
      context.alreadyInvisible
    ) {
      return { success: false };
    }

    const invisibilityEndTime = Date.now() + CLOAK_INVISIBILITY_DURATION;
    const cooldownEndTime = Date.now() + CLOAK_COOLDOWN_DURATION;

    return {
      success: true,
      invisibilityEndTime,
      cooldownEndTime,
    };
  }, []);

  /**
   * Reset all cloak mechanics state
   */
  const resetCloakMechanics = useCallback(() => {
    setPlayerInvisible(false);
    setCloakInvisibilityEndTime(null);
    setCloakCooldownEndTime(null);
    setCloakSpawned(false);
    stopWolfConfusion();
  }, [stopWolfConfusion]);

  // automatically clear invisibility when time expires
  useEffect(() => {
    if (cloakInvisibilityEndTime) {
      const checkInvisibility = setInterval(() => {
        if (Date.now() >= cloakInvisibilityEndTime) {
          clearInvisibility();
          stopWolfConfusion();
        }
      }, 100); // check every 100ms

      return () => clearInterval(checkInvisibility);
    }
  }, [cloakInvisibilityEndTime, clearInvisibility, stopWolfConfusion]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopWolfConfusion();
    };
  }, [stopWolfConfusion]);

  return {
    // State
    playerInvisible,
    cloakInvisibilityEndTime,
    cloakCooldownEndTime,
    cloakSpawned,
    wolfConfusionIntervalRef,
    
    // Actions
    activateInvisibility,
    clearInvisibility,
    isCloakOnCooldown,
    isPlayerInvisible,
    markCloakSpawned,
    resetCloakSpawned,
    startWolfConfusion,
    stopWolfConfusion,
    useCloak,
    resetCloakMechanics,
    
    // Setters (for direct state updates when needed)
    setPlayerInvisible,
    setCloakInvisibilityEndTime,
    setCloakCooldownEndTime,
  };
};

