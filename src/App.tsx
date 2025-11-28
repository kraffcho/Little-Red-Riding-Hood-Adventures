import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";
import ForestGrid from "./ForestGrid";
import GameOver from "./components/GameOver";
import Countdown from "./components/Countdown";
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
  const [countdownComplete, setCountdownComplete] = useState(false);
  const gameResetKey = useRef(0);

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

  // make the wolf chase the player every so often - wait for countdown to finish
  useEffect(() => {
    if (!countdownComplete || !gameState.wolfMoving || gameState.gameOver || gameState.isStuck) return;

    const intervalId = setInterval(() => {
      moveWolf();
    }, ENEMY_DELAY);

    return () => clearInterval(intervalId);
  }, [countdownComplete, gameState.wolfMoving, gameState.gameOver, gameState.isStuck, moveWolf]);

  // handle when the player moves - play music, check house entry, etc.
  const handlePlayerMove = useCallback((direction: Direction) => {
    // prevent movement if countdown hasn't finished, player has entered house, is stuck, or game is over
    if (!countdownComplete || gameState.playerEnteredHouse || gameState.isStuck || gameState.gameOver) {
      return;
    }

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
    gameState.isStuck,
    gameState.gameOver,
    gameState.playerEnteredHouse,
    playedRestrictedEntrySound,
    playSound,
    movePlayer,
    markUserInteracted,
    countdownComplete,
  ]);

  // listen for arrow key presses - disable during countdown
  useKeyboardInput(handlePlayerMove, gameState.playerCanMove && countdownComplete);

  // handle touch/swipe gestures for mobile - disable during countdown
  const { handleTouchStart, handleTouchEnd } = useSwipeInput(
    handlePlayerMove,
    gameState.playerCanMove && countdownComplete
  );

  const handleResetGame = useCallback(() => {
    resetMusic();
    resetGame();
    setPlayedRestrictedEntrySound(false);
    previousFlowerCount.current = 0;
    questCompletedSoundPlayed.current = false;
    setCountdownComplete(false); // reset countdown for new game
    gameResetKey.current += 1; // increment to force countdown remount
  }, [resetMusic, resetGame]);

  const handleCountdownComplete = useCallback(() => {
    setCountdownComplete(true);
  }, []);

  // don't render the board until the game is initialized (positions are valid)
  const isGameInitialized = gameState.playerPosition.x >= 0 && gameState.playerPosition.y >= 0;

  return (
    <div className="App" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {isGameInitialized && (
        <>
          <Countdown
            key={`countdown-${gameResetKey.current}`}
            onComplete={handleCountdownComplete}
            isGameInitialized={isGameInitialized}
          />
          <div className="game-board-wrapper">
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
              gameOver={gameState.gameOver}
              wolfWon={gameState.wolfWon}
            />
            {gameState.gameOver && (
              <GameOver
                message={
                  gameState.isStuck
                    ? `<strong>YOU'RE STUCK!</strong><br />${gameState.stuckReason || "You cannot reach any remaining flowers or the house."}<br /><br />Restart the game?`
                    : "<strong>GAME OVER</strong><br />The wolf has caught you!<br />Play again?"
                }
                onRestart={handleResetGame}
                isStuck={gameState.isStuck}
              />
            )}
          </div>
          <div className="quest-panel">
            <QuestInfo
              collectedFlowers={gameState.collectedFlowers}
              isHouseOpen={gameState.isHouseOpen}
            />
            <QuestProgress collectedFlowers={gameState.collectedFlowers} />
          </div>
        </>
      )}
      <SettingsMenu
        volume={volume}
        isPlayingMusic={isPlayingMusic}
        onVolumeChange={handleVolumeChange}
        onToggleSound={handleToggleSound}
        onRestart={handleResetGame}
        onInteraction={markUserInteracted}
      />
    </div>
  );
};

export default App;
