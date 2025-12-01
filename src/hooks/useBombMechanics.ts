import { useState, useCallback, useEffect } from "react";
import { Position, ExplosionEffect, ExplosionMark } from "../types";
import {
  BOMB_STUN_DURATION,
  BOMB_EXPLOSION_RADIUS,
  BOMB_EXPLOSION_DURATION,
  BOMB_COOLDOWN_DURATION,
  EXPLOSION_MARK_DURATION,
} from "../constants/gameConfig";
import { isWithinRadius } from "../utils";

/**
 * Hook that manages bomb mechanics: explosions, stun effects, cooldowns, and explosion marks
 */
export const useBombMechanics = () => {
  const [explosionEffect, setExplosionEffect] = useState<ExplosionEffect | null>(null);
  const [explosionMarks, setExplosionMarks] = useState<ExplosionMark[]>([]);
  const [bombCooldownEndTime, setBombCooldownEndTime] = useState<number | null>(null);

  /**
   * Create an explosion effect at the given position
   */
  const createExplosion = useCallback((position: Position) => {
    const effect: ExplosionEffect = {
      position,
      radius: BOMB_EXPLOSION_RADIUS,
      startTime: Date.now(),
      duration: BOMB_EXPLOSION_DURATION,
    };
    setExplosionEffect(effect);
  }, []);

  /**
   * Clear explosion effect
   */
  const clearExplosionEffect = useCallback(() => {
    setExplosionEffect(null);
  }, []);

  /**
   * Add an explosion mark at the given position
   */
  const addExplosionMark = useCallback((position: Position) => {
    setExplosionMarks((prev) => {
      // check if mark already exists at this position
      const hasMark = prev.some(
        (mark) => mark.position.x === position.x && mark.position.y === position.y
      );
      if (hasMark) {
        return prev;
      }
      return [...prev, { position, createdAt: Date.now() }];
    });
  }, []);

  /**
   * Clear all explosion marks
   */
  const clearExplosionMarks = useCallback(() => {
    setExplosionMarks([]);
  }, []);

  /**
   * Check if a position is within explosion radius
   */
  const isInExplosionRadius = useCallback((position: Position, explosionPosition: Position): boolean => {
    return isWithinRadius(position, explosionPosition, BOMB_EXPLOSION_RADIUS);
  }, []);

  /**
   * Start bomb cooldown
   */
  const startBombCooldown = useCallback(() => {
    setBombCooldownEndTime(Date.now() + BOMB_COOLDOWN_DURATION);
  }, []);

  /**
   * Clear bomb cooldown
   */
  const clearBombCooldown = useCallback(() => {
    setBombCooldownEndTime(null);
  }, []);

  /**
   * Check if bomb is on cooldown
   */
  const isBombOnCooldown = useCallback((): boolean => {
    return bombCooldownEndTime !== null && Date.now() < bombCooldownEndTime;
  }, [bombCooldownEndTime]);

  /**
   * Use a bomb - returns explosion data and stun information
   */
  const useBomb = useCallback((context: {
    playerPosition: Position;
    wolfPosition: Position;
    hasBomb: boolean;
    gameOver: boolean;
    playerEnteredHouse: boolean;
    isOnCooldown: boolean;
  }): {
    success: boolean;
    explosionPosition?: Position;
    wolfStunned?: boolean;
    stunEndTime?: number;
    cooldownEndTime?: number;
  } => {
    if (!context.hasBomb || context.gameOver || context.playerEnteredHouse || context.isOnCooldown) {
      return { success: false };
    }

    const explosionPosition = context.playerPosition;
    const wolfInRadius = isWithinRadius(
      context.wolfPosition,
      explosionPosition,
      BOMB_EXPLOSION_RADIUS
    );

    const result: {
      success: boolean;
      explosionPosition?: Position;
      wolfStunned?: boolean;
      stunEndTime?: number;
      cooldownEndTime?: number;
    } = {
      success: true,
      explosionPosition,
    };

    if (wolfInRadius) {
      result.wolfStunned = true;
      result.stunEndTime = Date.now() + BOMB_STUN_DURATION;
    }

    result.cooldownEndTime = Date.now() + BOMB_COOLDOWN_DURATION;

    return result;
  }, []);

  /**
   * Reset all bomb mechanics state
   */
  const resetBombMechanics = useCallback(() => {
    setExplosionEffect(null);
    setExplosionMarks([]);
    setBombCooldownEndTime(null);
  }, []);

  // clear explosion effect after duration
  useEffect(() => {
    if (explosionEffect) {
      const timer = setTimeout(() => {
        clearExplosionEffect();
      }, BOMB_EXPLOSION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [explosionEffect, clearExplosionEffect]);

  // remove explosion marks after they expire
  useEffect(() => {
    if (explosionMarks.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setExplosionMarks((prev) => {
        const validMarks = prev.filter(
          (mark) => now - mark.createdAt < EXPLOSION_MARK_DURATION
        );
        return validMarks.length !== prev.length ? validMarks : prev;
      });
    }, 1000); // check every second

    return () => clearInterval(interval);
  }, [explosionMarks]);

  return {
    // State
    explosionEffect,
    explosionMarks,
    bombCooldownEndTime,
    
    // Actions
    createExplosion,
    clearExplosionEffect,
    addExplosionMark,
    clearExplosionMarks,
    isInExplosionRadius,
    startBombCooldown,
    clearBombCooldown,
    isBombOnCooldown,
    useBomb,
    resetBombMechanics,
  };
};

