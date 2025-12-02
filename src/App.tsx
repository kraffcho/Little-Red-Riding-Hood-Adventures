import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/layouts.css";
import "./styles/animations.css";
import "./styles/components/header.css";
import "./styles/components/game.css";
import "./styles/components/tooltip.css";
import "./styles/components/quest.css";
import "./styles/components/settings.css";
import "./styles/components/overlays.css";
import "./styles/responsive.css";
import ForestGrid from "./components/game/ForestGrid";
import GameOver from "./components/GameOver";
import Countdown from "./components/Countdown";
import LevelComplete from "./components/LevelComplete";
import TemporaryMessage from "./components/TemporaryMessage";
import PauseMenu from "./components/PauseMenu";
import Header from "./components/ui/Header";
import SettingsMenu from "./components/ui/SettingsMenu";

import { useGameState, useAudio, useKeyboardInput, useSwipeInput } from "./hooks";
import { Direction, ItemType } from "./types";
import { AUDIO_PATHS } from "./constants/gameConfig";
import { getLevelConfig } from "./constants/levelConfig";
import { moveInDirection, positionsEqual, getGrannyQuestMessage, QuestMilestone } from "./utils";

const App: React.FC = () => {
  const {
    gameState,
    movePlayer,
    moveWolf,
    resetGame,
    nextLevel,
    replayLevel,
    useBomb,
    useCloak,
    clearTemporaryMessage,
    startItemSpawning,
    togglePause,
    unpauseGame,
  } = useGameState();

  const {
    isPlayingMusic,
    isSoundEffectsEnabled,
    volume,
    playSound,
    playRandomSound,
    playBackgroundMusic,
    playFlowerCollectSound,
    handleToggleSound,
    handleToggleSoundEffects,
    handleVolumeChange,
    checkMusicCookie,
    resetMusic,
    markUserInteracted,
  } = useAudio();

  // track sound effects to avoid repetition
  const [playedRestrictedEntrySound, setPlayedRestrictedEntrySound] = useState(false);
  const previousFlowerCount = useRef(0);
  const previousInventorySize = useRef(0);
  const questCompletedSoundPlayed = useRef(false);
  const wolfVictorySoundPlayed = useRef(false);
  const previousWolfStunned = useRef(false);

  // countdown and game initialization
  const [countdownComplete, setCountdownComplete] = useState(false);
  const gameResetKey = useRef(0);
  const previousExplosionEffect = useRef<string | null>(null);

  // granny's tooltip system
  const [currentTooltipMilestone, setCurrentTooltipMilestone] = useState<QuestMilestone | null>(null);
  const [currentTooltipMessage, setCurrentTooltipMessage] = useState<string>("");
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shownMilestonesRef = useRef<Set<QuestMilestone>>(new Set());

  // menu states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const pauseMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // show granny's tooltip when player reaches quest milestones
  useEffect(() => {
    if (!countdownComplete || gameState.playerPosition.x === -1) return;

    const levelConfig = getLevelConfig(gameState.currentLevel);
    const numFlowers = levelConfig.numFlowers;
    const halfwayPoint = Math.ceil(numFlowers / 2);
    let milestone: QuestMilestone | null = null;

    // prioritize: entered house > all flowers > halfway point
    if (gameState.playerEnteredHouse && !shownMilestonesRef.current.has("entered_house")) {
      milestone = "entered_house";
      shownMilestonesRef.current.add("entered_house");
    }
    else if (
      gameState.collectedFlowers === numFlowers &&
      !shownMilestonesRef.current.has("all_collected")
    ) {
      milestone = "all_collected";
      shownMilestonesRef.current.add("all_collected");
    }
    else if (
      gameState.collectedFlowers >= halfwayPoint &&
      gameState.collectedFlowers < numFlowers &&
      !shownMilestonesRef.current.has("halfway")
    ) {
      milestone = "halfway";
      shownMilestonesRef.current.add("halfway");
    }

    if (milestone) {
      const questMsg = getGrannyQuestMessage(
        gameState.collectedFlowers,
        gameState.isHouseOpen,
        gameState.playerEnteredHouse,
        milestone,
        gameState.currentLevel
      );

      if (questMsg.message && questMsg.message.trim() !== "") {
        setCurrentTooltipMilestone(milestone);
        setCurrentTooltipMessage(questMsg.message);

        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }

        tooltipTimeoutRef.current = setTimeout(() => {
          setCurrentTooltipMilestone(null);
          setCurrentTooltipMessage("");
          tooltipTimeoutRef.current = null;
        }, 3000);
      }
    }
  }, [gameState.collectedFlowers, gameState.playerEnteredHouse, gameState.isHouseOpen, gameState.currentLevel, countdownComplete]);

  // play quest completed sound when all flowers are collected
  useEffect(() => {
    const levelConfig = getLevelConfig(gameState.currentLevel);
    const numFlowers = levelConfig.numFlowers;
    if (gameState.collectedFlowers === numFlowers && !questCompletedSoundPlayed.current) {
      questCompletedSoundPlayed.current = true;
      playSound(AUDIO_PATHS.QUEST_COMPLETED);
    }
  }, [gameState.collectedFlowers, gameState.currentLevel, playSound]);

  // play sound when collecting flowers
  useEffect(() => {
    if (gameState.collectedFlowers > previousFlowerCount.current) {
      playFlowerCollectSound();
      previousFlowerCount.current = gameState.collectedFlowers;
    }
  }, [gameState.collectedFlowers, playFlowerCollectSound]);

  // play sound when collecting items (bombs or cloaks)
  useEffect(() => {
    if (gameState.inventory.length > previousInventorySize.current) {
      const lastItem = gameState.inventory[gameState.inventory.length - 1];
      if (lastItem === "bomb") {
        playSound(AUDIO_PATHS.COLLECT_BOMB);
      } else if (lastItem === "cloak") {
        playSound(AUDIO_PATHS.COLLECT_ITEM);
      }
      previousInventorySize.current = gameState.inventory.length;
    } else if (gameState.inventory.length < previousInventorySize.current) {
      previousInventorySize.current = gameState.inventory.length;
    }
  }, [gameState.inventory, playSound]);

  // play wolf victory sound when caught
  useEffect(() => {
    if (gameState.wolfWon && gameState.gameOver && !gameState.playerEnteredHouse) {
      if (!wolfVictorySoundPlayed.current) {
        wolfVictorySoundPlayed.current = true;
        playRandomSound(AUDIO_PATHS.WOLF_VICTORY);
      }
    } else if (!gameState.gameOver) {
      wolfVictorySoundPlayed.current = false;
    }
  }, [gameState.wolfWon, gameState.gameOver, gameState.playerEnteredHouse, playRandomSound]);

  // play howl when wolf wakes up from stun
  useEffect(() => {
    if (previousWolfStunned.current && !gameState.wolfStunned) {
      playSound(AUDIO_PATHS.WOLF_HOWL);
    }
    previousWolfStunned.current = gameState.wolfStunned;
  }, [gameState.wolfStunned, playSound]);

  // play explosion sound (once per bomb)
  useEffect(() => {
    if (gameState.explosionEffect) {
      const explosionId = `${gameState.explosionEffect.position.x}-${gameState.explosionEffect.position.y}-${gameState.explosionEffect.startTime}`;
      if (previousExplosionEffect.current !== explosionId) {
        previousExplosionEffect.current = explosionId;
        playRandomSound(AUDIO_PATHS.BOMB_EXPLOSION);
      }
    } else {
      previousExplosionEffect.current = null;
    }
  }, [gameState.explosionEffect, playRandomSound]);

  // toggle pause with ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.code === "Escape") {
        event.preventDefault();
        if (!gameState.gameOver && !gameState.playerEnteredHouse && !gameState.isStuck && countdownComplete) {
          togglePause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, countdownComplete, togglePause]);

  // handle pause menu fade in/out animations
  useEffect(() => {
    if (gameState.paused && countdownComplete) {
      setShowPauseMenu(true);
      if (pauseMenuTimeoutRef.current) {
        clearTimeout(pauseMenuTimeoutRef.current);
        pauseMenuTimeoutRef.current = null;
      }
    } else if (!gameState.paused && showPauseMenu) {
      if (pauseMenuTimeoutRef.current) {
        clearTimeout(pauseMenuTimeoutRef.current);
      }
      pauseMenuTimeoutRef.current = setTimeout(() => {
        setShowPauseMenu(false);
        pauseMenuTimeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (pauseMenuTimeoutRef.current) {
        clearTimeout(pauseMenuTimeoutRef.current);
        pauseMenuTimeoutRef.current = null;
      }
    };
  }, [gameState.paused, countdownComplete]);

  // wolf movement loop with dynamic speed (gets faster after each stun)
  useEffect(() => {
    if (!countdownComplete || !gameState.wolfMoving || gameState.gameOver || gameState.isStuck || gameState.paused) return;

    const intervalId = setInterval(() => {
      moveWolf();
    }, gameState.currentWolfDelay);

    return () => clearInterval(intervalId);
  }, [countdownComplete, gameState.wolfMoving, gameState.gameOver, gameState.isStuck, gameState.paused, gameState.currentWolfDelay, moveWolf]);

  const handlePlayerMove = useCallback((direction: Direction) => {
    if (!countdownComplete || gameState.playerEnteredHouse || gameState.isStuck || gameState.gameOver || gameState.paused) {
      return;
    }

    markUserInteracted();

    // start music on first movement
    if (!isPlayingMusic && !checkMusicCookie()) {
      playBackgroundMusic();
    }

    // prevent entering house until all flowers are collected
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
  useKeyboardInput(handlePlayerMove, gameState.playerCanMove && countdownComplete && !gameState.paused);

  // handle touch/swipe gestures for mobile - disable during countdown
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeInput(
    handlePlayerMove,
    gameState.playerCanMove && countdownComplete && !gameState.paused
  );

  const handleResetGame = useCallback(() => {
    resetMusic();
    resetGame();
    setPlayedRestrictedEntrySound(false);
    previousFlowerCount.current = 0;
    previousInventorySize.current = 0;
    questCompletedSoundPlayed.current = false;
    wolfVictorySoundPlayed.current = false;
    previousWolfStunned.current = false;
    previousExplosionEffect.current = null;
    setCountdownComplete(false);
    gameResetKey.current += 1;
    setCurrentTooltipMilestone(null);
    setCurrentTooltipMessage("");
    shownMilestonesRef.current.clear();
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setIsSettingsOpen(false);
  }, [resetMusic, resetGame]);

  const handleNextLevel = useCallback(() => {
    setCountdownComplete(false);
    gameResetKey.current += 1;
    shownMilestonesRef.current.clear();
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    questCompletedSoundPlayed.current = false;
    previousFlowerCount.current = 0;
    nextLevel();
  }, [nextLevel]);

  const handleReplayLevel = useCallback(() => {
    setCountdownComplete(false);
    gameResetKey.current += 1;
    shownMilestonesRef.current.clear();
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    questCompletedSoundPlayed.current = false;
    previousFlowerCount.current = 0;
    replayLevel();
  }, [replayLevel]);

  const handleCountdownComplete = useCallback(() => {
    setCountdownComplete(true);
    startItemSpawning();

    // show granny's welcome message after countdown fades
    setTimeout(() => {
      if (!shownMilestonesRef.current.has("start") && gameState.collectedFlowers === 0) {
        const questMsg = getGrannyQuestMessage(
          gameState.collectedFlowers,
          gameState.isHouseOpen,
          gameState.playerEnteredHouse,
          "start",
          gameState.currentLevel
        );
        setCurrentTooltipMilestone("start");
        setCurrentTooltipMessage(questMsg.message);
        shownMilestonesRef.current.add("start");
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        tooltipTimeoutRef.current = setTimeout(() => {
          setCurrentTooltipMilestone(null);
          setCurrentTooltipMessage("");
          tooltipTimeoutRef.current = null;
        }, 3000);
      }
    }, 500);
  }, [startItemSpawning, gameState.collectedFlowers]);

  const handleUseItem = useCallback((itemType: ItemType) => {
    if (gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck || gameState.paused) {
      return;
    }

    if (itemType === "bomb") {
      useBomb();
    } else if (itemType === "cloak") {
      useCloak();
      playSound(AUDIO_PATHS.USE_CLOAK);
    }
  }, [useBomb, useCloak, playSound, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, gameState.paused]);

  // listen for space bar to use bomb
  useEffect(() => {
    if (!countdownComplete || gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck || gameState.paused) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        handleUseItem("bomb");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [countdownComplete, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, gameState.paused, handleUseItem]);

  // listen for C key to use hunter's cloak
  useEffect(() => {
    if (!countdownComplete || gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck || gameState.paused) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "c" || event.code === "KeyC") {
        event.preventDefault();
        const hasCloak = gameState.inventory.includes("cloak");
        const isOnCooldown = gameState.cloakCooldownEndTime !== null && Date.now() < gameState.cloakCooldownEndTime;

        if (hasCloak && !isOnCooldown) {
          handleUseItem("cloak");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [countdownComplete, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, gameState.paused, gameState.inventory, gameState.cloakCooldownEndTime, handleUseItem]);

  // wait for game initialization before rendering (gridSize check keeps board visible during resets)
  const isGameInitialized = gameState.gridSize > 0;

  return (
    <div className="App" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* header with inventory and settings button */}
      {isGameInitialized && (
        <Header
          inventory={gameState.inventory}
          onUseItem={handleUseItem}
          bombCooldownEndTime={gameState.bombCooldownEndTime}
          cloakCooldownEndTime={gameState.cloakCooldownEndTime}
          collectedFlowers={gameState.collectedFlowers}
          currentLevel={gameState.currentLevel}
          gameOver={gameState.gameOver}
          playerEnteredHouse={gameState.playerEnteredHouse}
          isStuck={gameState.isStuck}
          paused={gameState.paused}
          countdownComplete={countdownComplete}
          onPauseClick={() => {
            markUserInteracted();
            togglePause();
          }}
          onSettingsClick={() => {
            markUserInteracted();
            if (!isSettingsOpen && !gameState.paused && !gameState.gameOver && countdownComplete) {
              togglePause();
            }
            setIsSettingsOpen(!isSettingsOpen);
          }}
          isSettingsOpen={isSettingsOpen}
        />
      )}
      {isGameInitialized && isSettingsOpen && (
        <SettingsMenu
          volume={volume}
          isPlayingMusic={isPlayingMusic}
          isSoundEffectsEnabled={isSoundEffectsEnabled}
          onVolumeChange={handleVolumeChange}
          onToggleSound={handleToggleSound}
          onToggleSoundEffects={handleToggleSoundEffects}
          onRestart={handleResetGame}
          isOpen={isSettingsOpen}
          onToggle={(shouldUnpause = true) => {
            if (isSettingsOpen && gameState.paused && !gameState.gameOver && shouldUnpause) {
              unpauseGame();
            }
            setIsSettingsOpen(!isSettingsOpen);
          }}
          currentLevel={gameState.currentLevel}
          collectedFlowers={gameState.collectedFlowers}
          totalFlowers={getLevelConfig(gameState.currentLevel).numFlowers}
        />
      )}
      {isGameInitialized && (
        <>
          <div className={`game-board-wrapper ${gameState.explosionEffect ? 'screen-shake' : ''}`}>
            <Countdown
              key={`countdown-${gameResetKey.current}`}
              onComplete={handleCountdownComplete}
              isGameInitialized={isGameInitialized}
              currentLevel={gameState.currentLevel}
            />
            <LevelComplete
              level={gameState.currentLevel}
              show={gameState.playerEnteredHouse}
              onComplete={() => { }}
              onRestart={handleResetGame}
              onNextLevel={handleNextLevel}
              onReplayLevel={handleReplayLevel}
            />
            {showPauseMenu && countdownComplete && (
              <PauseMenu
                onResume={unpauseGame}
                isVisible={gameState.paused}
                currentLevel={gameState.currentLevel}
              />
            )}
            {gameState.temporaryMessage && (
              <TemporaryMessage
                message={gameState.temporaryMessage.text}
                type={gameState.temporaryMessage.type}
                duration={2000}
                onComplete={clearTemporaryMessage}
              />
            )}
            <ForestGrid
              gridSize={gameState.gridSize}
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
              specialItems={gameState.specialItems}
              explosionEffect={gameState.explosionEffect}
              explosionMarks={gameState.explosionMarks}
              wolfStunned={gameState.wolfStunned}
              wolfStunEndTime={gameState.wolfStunEndTime}
              tooltipMessage={currentTooltipMessage}
              showTooltip={currentTooltipMilestone !== null}
              playerInvisible={gameState.playerInvisible}
            />
            {gameState.gameOver && (
              <GameOver
                message={
                  gameState.isStuck
                    ? `<strong>YOU'RE STUCK!</strong><br />${gameState.stuckReason || "You cannot reach any remaining flowers or the house."}`
                    : "<strong>GAME OVER</strong><br />The wolf has caught you!"
                }
                onRetryLevel={handleReplayLevel}
                onRestartGame={handleResetGame}
                isStuck={gameState.isStuck}
                currentLevel={gameState.currentLevel}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
