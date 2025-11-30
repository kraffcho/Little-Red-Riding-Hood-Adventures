import { useState, useCallback, useRef } from "react";

/**
 * Hook that manages game lifecycle state: game over, stuck, pause, temporary messages
 */
export const useGameLifecycle = () => {
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isStuck, setIsStuck] = useState<boolean>(false);
  const [stuckReason, setStuckReason] = useState<string | undefined>(undefined);
  const [temporaryMessage, setTemporaryMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [paused, setPaused] = useState<boolean>(false);
  
  const gameStartTimeRef = useRef<number | null>(null);

  /**
   * Set game over state
   */
  const setGameOverState = useCallback((over: boolean) => {
    setGameOver(over);
  }, []);

  /**
   * Set stuck state
   */
  const setStuckState = useCallback((stuck: boolean, reason?: string) => {
    setIsStuck(stuck);
    setStuckReason(reason);
  }, []);

  /**
   * Set temporary message
   */
  const setTemporaryMessageState = useCallback((message: { text: string; type: 'success' | 'error' } | null) => {
    setTemporaryMessage(message);
  }, []);

  /**
   * Clear temporary message
   */
  const clearTemporaryMessage = useCallback(() => {
    setTemporaryMessage(null);
  }, []);

  /**
   * Pause the game
   */
  const pauseGame = useCallback(() => {
    setPaused(true);
  }, []);

  /**
   * Unpause the game
   */
  const unpauseGame = useCallback(() => {
    setPaused(false);
  }, []);

  /**
   * Toggle pause state
   */
  const togglePause = useCallback(() => {
    setPaused((prev) => !prev);
  }, []);

  /**
   * Set game start time
   */
  const setGameStartTime = useCallback((time: number) => {
    gameStartTimeRef.current = time;
  }, []);

  /**
   * Get game start time
   */
  const getGameStartTime = useCallback(() => {
    return gameStartTimeRef.current;
  }, []);

  /**
   * Clear game start time
   */
  const clearGameStartTime = useCallback(() => {
    gameStartTimeRef.current = null;
  }, []);

  /**
   * Reset all lifecycle state
   */
  const resetLifecycle = useCallback(() => {
    setGameOver(false);
    setIsStuck(false);
    setStuckReason(undefined);
    setTemporaryMessage(null);
    setPaused(false);
    gameStartTimeRef.current = null;
  }, []);

  return {
    // State
    gameOver,
    isStuck,
    stuckReason,
    temporaryMessage,
    paused,
    gameStartTimeRef,
    
    // Actions
    setGameOverState,
    setStuckState,
    setTemporaryMessageState,
    clearTemporaryMessage,
    pauseGame,
    unpauseGame,
    togglePause,
    setGameStartTime,
    getGameStartTime,
    clearGameStartTime,
    resetLifecycle,
  };
};

