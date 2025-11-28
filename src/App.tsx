import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";
import ForestGrid from "./ForestGrid";
import GameOver from "./components/GameOver";
import QuestProgress from "./components/ui/QuestProgress";
import QuestInfo from "./components/ui/QuestInfo";
import SettingsMenu from "./components/ui/SettingsMenu";

import { useGameState } from "./hooks/useGameState";
import { useAudio } from "./hooks/useAudio";
import { useKeyboardInput, useSwipeInput } from "./hooks/useInput";
import { Direction } from "./types/game";
import { AUDIO_PATHS, NUM_FLOWERS, ENEMY_DELAY, GRID_SIZE } from "./constants/gameConfig";
import { moveInDirection, positionsEqual } from "./utils/gridUtils";

const App: React.FC = () => {
  const {
    gameState,
    movePlayer,
    moveWolf,
    resetGame,
  } = useGameState();

  const {
    isPlayingMusic,
    volume,
    playSound,
    playRandomSound,
    playBackgroundMusic,
    playFlowerCollectSound,
    handleToggleSound,
    handleVolumeChange,
    checkMusicCookie,
    resetMusic,
    markUserInteracted,
  } = useAudio();

  const [playedRestrictedEntrySound, setPlayedRestrictedEntrySound] = useState(false);
  const previousFlowerCount = useRef(0);
  const questCompletedSoundPlayed = useRef(false);

  // play a sound when all flowers are collected
  useEffect(() => {
    if (gameState.collectedFlowers === NUM_FLOWERS && !questCompletedSoundPlayed.current) {
      questCompletedSoundPlayed.current = true;
      playSound(AUDIO_PATHS.QUEST_COMPLETED);
    }
  }, [gameState.collectedFlowers, playSound]);

  // play a sound effect when we pick up a flower
  useEffect(() => {
    if (gameState.collectedFlowers > previousFlowerCount.current) {
      playFlowerCollectSound();
      previousFlowerCount.current = gameState.collectedFlowers;
    }
  }, [gameState.collectedFlowers, playFlowerCollectSound]);

  // play a sound when the wolf catches us
  useEffect(() => {
    if (gameState.wolfWon && gameState.gameOver) {
      playRandomSound(AUDIO_PATHS.WOLF_VICTORY);
    }
  }, [gameState.wolfWon, gameState.gameOver, playRandomSound]);

  // make the wolf chase the player every so often
  useEffect(() => {
    if (!gameState.wolfMoving || gameState.gameOver) return;

    const intervalId = setInterval(() => {
      moveWolf();
    }, ENEMY_DELAY);

    return () => clearInterval(intervalId);
  }, [gameState.wolfMoving, gameState.gameOver, moveWolf]);

  // handle when the player moves - play music, check house entry, etc.
  const handlePlayerMove = useCallback((direction: Direction) => {
    // mark that the user has done something
    markUserInteracted();

    // start playing music on the first move (if not paused before)
    if (!isPlayingMusic && !checkMusicCookie()) {
      playBackgroundMusic();
    }

    // block entry to the house if quest isn't done yet
    const newPosition = moveInDirection(gameState.playerPosition, direction);
    const isAttemptingHouseEntry = positionsEqual(newPosition, gameState.grannyHousePosition);

    if (isAttemptingHouseEntry && !gameState.isHouseOpen) {
      if (!playedRestrictedEntrySound) {
        playSound(AUDIO_PATHS.RESTRICTED_ENTRY);
        setPlayedRestrictedEntrySound(true);
      }
      return;
    }

    movePlayer(direction);
  }, [
    isPlayingMusic,
    checkMusicCookie,
    playBackgroundMusic,
    gameState.playerPosition,
    gameState.grannyHousePosition,
    gameState.isHouseOpen,
    gameState.collectedFlowers,
    playedRestrictedEntrySound,
    playSound,
    movePlayer,
    markUserInteracted,
  ]);

  // listen for arrow key presses
  useKeyboardInput(handlePlayerMove, gameState.playerCanMove);

  // handle touch/swipe gestures for mobile
  const { handleTouchStart, handleTouchEnd } = useSwipeInput(
    handlePlayerMove,
    gameState.playerCanMove
  );

  const handleResetGame = useCallback(() => {
    resetMusic();
    resetGame();
    setPlayedRestrictedEntrySound(false);
    previousFlowerCount.current = 0;
    questCompletedSoundPlayed.current = false;
  }, [resetMusic, resetGame]);

  return (
    <div className="App" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <ForestGrid
        gridSize={GRID_SIZE}
        playerPosition={gameState.playerPosition}
        wolfPosition={gameState.wolfPosition}
        grannyHousePosition={gameState.grannyHousePosition}
        treePositions={gameState.treePositions}
        playerDirection={gameState.playerDirection}
        wolfDirection={gameState.wolfDirection}
        isPlayerWolfOverlap={
          gameState.playerPosition.x === gameState.wolfPosition.x &&
          gameState.playerPosition.y === gameState.wolfPosition.y
        }
        flowers={gameState.flowers}
        collectedFlowers={gameState.collectedFlowers}
        isHouseOpen={gameState.isHouseOpen}
        playerEnteredHouse={gameState.playerEnteredHouse}
      />
      <div className="quest-header">
        <QuestInfo
          collectedFlowers={gameState.collectedFlowers}
          isHouseOpen={gameState.isHouseOpen}
        />
        <QuestProgress collectedFlowers={gameState.collectedFlowers} />
      </div>
      <SettingsMenu
        volume={volume}
        isPlayingMusic={isPlayingMusic}
        onVolumeChange={handleVolumeChange}
        onToggleSound={handleToggleSound}
        onRestart={handleResetGame}
        onInteraction={markUserInteracted}
      />
      {gameState.gameOver && (
        <GameOver
          message={
            gameState.isStuck
              ? `<strong>YOU'RE STUCK!</strong><br />${gameState.stuckReason || "You cannot reach any remaining flowers or the house."}<br /><br />Would you like to restart?`
              : "<strong>GAME OVER</strong><br />The wolf has caught you! Play again?"
          }
          onRestart={handleResetGame}
        />
      )}
    </div>
  );
};

export default App;
