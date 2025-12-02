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
  const previousInventorySize = useRef(0);
  const questCompletedSoundPlayed = useRef(false);
  const wolfVictorySoundPlayed = useRef(false);
  const previousWolfStunned = useRef(false);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const gameResetKey = useRef(0);
  const previousExplosionEffect = useRef<string | null>(null);
  const [currentTooltipMilestone, setCurrentTooltipMilestone] = useState<QuestMilestone | null>(null);
  const [currentTooltipMessage, setCurrentTooltipMessage] = useState<string>("");
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shownMilestonesRef = useRef<Set<QuestMilestone>>(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const pauseMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // detect quest milestones and show tooltip for 3 seconds
  useEffect(() => {
    // only check milestones when countdown is complete and game is initialized
    if (!countdownComplete || gameState.playerPosition.x === -1) return;

    const levelConfig = getLevelConfig(gameState.currentLevel);
    const numFlowers = levelConfig.numFlowers;
    const halfwayPoint = Math.ceil(numFlowers / 2);
    let milestone: QuestMilestone | null = null;

    // start milestone is handled in handleCountdownComplete, skip it here

    // check for entered house milestone (highest priority - if player enters house, show that message first)
    if (gameState.playerEnteredHouse && !shownMilestonesRef.current.has("entered_house")) {
      milestone = "entered_house";
      shownMilestonesRef.current.add("entered_house");
    }
    // check for all collected milestone (higher priority than halfway - show immediately when all collected)
    else if (
      gameState.collectedFlowers === numFlowers &&
      !shownMilestonesRef.current.has("all_collected")
    ) {
      milestone = "all_collected";
      shownMilestonesRef.current.add("all_collected");
    }
    // check for halfway milestone (lowest priority)
    else if (
      gameState.collectedFlowers >= halfwayPoint &&
      gameState.collectedFlowers < numFlowers &&
      !shownMilestonesRef.current.has("halfway")
    ) {
      milestone = "halfway";
      shownMilestonesRef.current.add("halfway");
    }

    // show tooltip if we have a new milestone
    if (milestone) {
      // get the message for this milestone
      const questMsg = getGrannyQuestMessage(
        gameState.collectedFlowers,
        gameState.isHouseOpen,
        gameState.playerEnteredHouse,
        milestone,
        gameState.currentLevel
      );

      // only set tooltip if we have a valid message
      if (questMsg.message && questMsg.message.trim() !== "") {
        setCurrentTooltipMilestone(milestone);
        setCurrentTooltipMessage(questMsg.message);
        // clear any existing timeout
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        // hide tooltip after 3 seconds
        tooltipTimeoutRef.current = setTimeout(() => {
          setCurrentTooltipMilestone(null);
          setCurrentTooltipMessage("");
          tooltipTimeoutRef.current = null;
        }, 3000);
      }
    }
  }, [gameState.collectedFlowers, gameState.playerEnteredHouse, gameState.isHouseOpen, gameState.currentLevel, countdownComplete]);

  // play a sound when all flowers are collected
  useEffect(() => {
    const levelConfig = getLevelConfig(gameState.currentLevel);
    const numFlowers = levelConfig.numFlowers;
    if (gameState.collectedFlowers === numFlowers && !questCompletedSoundPlayed.current) {
      questCompletedSoundPlayed.current = true;
      playSound(AUDIO_PATHS.QUEST_COMPLETED);
    }
  }, [gameState.collectedFlowers, gameState.currentLevel, playSound]);

  // play a sound effect when we pick up a flower
  useEffect(() => {
    if (gameState.collectedFlowers > previousFlowerCount.current) {
      playFlowerCollectSound();
      previousFlowerCount.current = gameState.collectedFlowers;
    }
  }, [gameState.collectedFlowers, playFlowerCollectSound]);

  // play a sound effect when we collect a bomb item
  useEffect(() => {
    if (gameState.inventory.length > previousInventorySize.current) {
      // inventory size increased - a new item was collected
      // check if the last item added is a bomb
      const lastItem = gameState.inventory[gameState.inventory.length - 1];
      if (lastItem === "bomb") {
        playSound(AUDIO_PATHS.COLLECT_BOMB);
      } else if (lastItem === "cloak") {
        playSound(AUDIO_PATHS.COLLECT_ITEM); // reuse collect-item sound for cloak
      }
      previousInventorySize.current = gameState.inventory.length;
    } else if (gameState.inventory.length < previousInventorySize.current) {
      // inventory decreased (item was used)
      previousInventorySize.current = gameState.inventory.length;
    }
  }, [gameState.inventory, playSound]);

  // play a sound when the wolf catches us (only if player hasn't entered house)
  useEffect(() => {
    if (gameState.wolfWon && gameState.gameOver && !gameState.playerEnteredHouse) {
      // only play sound if we haven't already played it for this game over
      if (!wolfVictorySoundPlayed.current) {
        wolfVictorySoundPlayed.current = true;
        playRandomSound(AUDIO_PATHS.WOLF_VICTORY);
      }
    } else if (!gameState.gameOver) {
      // reset when game is not over
      wolfVictorySoundPlayed.current = false;
    }
  }, [gameState.wolfWon, gameState.gameOver, gameState.playerEnteredHouse, playRandomSound]);

  // play howl sound when wolf wakes up from stun
  useEffect(() => {
    // check if wolf just woke up (was stunned, now not stunned)
    if (previousWolfStunned.current && !gameState.wolfStunned) {
      playSound(AUDIO_PATHS.WOLF_HOWL);
    }
    previousWolfStunned.current = gameState.wolfStunned;
  }, [gameState.wolfStunned, playSound]);

  // play a sound when bomb explodes
  useEffect(() => {
    if (gameState.explosionEffect) {
      const explosionId = `${gameState.explosionEffect.position.x}-${gameState.explosionEffect.position.y}-${gameState.explosionEffect.startTime}`;
      // only play sound once per explosion
      if (previousExplosionEffect.current !== explosionId) {
        previousExplosionEffect.current = explosionId;
        playRandomSound(AUDIO_PATHS.BOMB_EXPLOSION);
      }
    } else {
      // reset when explosion effect is cleared
      previousExplosionEffect.current = null;
    }
  }, [gameState.explosionEffect, playRandomSound]);

  // handle Esc key for pause/unpause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.code === "Escape") {
        // prevent default browser behavior (e.g., closing modals)
        event.preventDefault();
        // don't allow pausing if game is over, completed, or stuck
        if (!gameState.gameOver && !gameState.playerEnteredHouse && !gameState.isStuck && countdownComplete) {
          togglePause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, countdownComplete, togglePause]);

  // handle pause menu visibility with fade animations
  useEffect(() => {
    if (gameState.paused && countdownComplete) {
      // Show pause menu immediately when paused
      setShowPauseMenu(true);
      // Clear any existing timeout
      if (pauseMenuTimeoutRef.current) {
        clearTimeout(pauseMenuTimeoutRef.current);
        pauseMenuTimeoutRef.current = null;
      }
    } else if (!gameState.paused && showPauseMenu) {
      // When unpaused, wait for fade-out animation before hiding
      if (pauseMenuTimeoutRef.current) {
        clearTimeout(pauseMenuTimeoutRef.current);
      }
      pauseMenuTimeoutRef.current = setTimeout(() => {
        setShowPauseMenu(false);
        pauseMenuTimeoutRef.current = null;
      }, 300); // Match fade-out animation duration
    }

    return () => {
      if (pauseMenuTimeoutRef.current) {
        clearTimeout(pauseMenuTimeoutRef.current);
        pauseMenuTimeoutRef.current = null;
      }
    };
  }, [gameState.paused, countdownComplete]);

  // make the wolf chase the player every so often - wait for countdown to finish
  // use dynamic delay that decreases after each stun (wolf becomes faster)
  useEffect(() => {
    if (!countdownComplete || !gameState.wolfMoving || gameState.gameOver || gameState.isStuck || gameState.paused) return;

    const intervalId = setInterval(() => {
      moveWolf();
    }, gameState.currentWolfDelay);

    return () => clearInterval(intervalId);
  }, [countdownComplete, gameState.wolfMoving, gameState.gameOver, gameState.isStuck, gameState.paused, gameState.currentWolfDelay, moveWolf]);

  // handle when the player moves - play music, check house entry, etc.
  const handlePlayerMove = useCallback((direction: Direction) => {
    // prevent movement if countdown hasn't finished, player has entered house, is stuck, game is over, or paused
    if (!countdownComplete || gameState.playerEnteredHouse || gameState.isStuck || gameState.gameOver || gameState.paused) {
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
  useKeyboardInput(handlePlayerMove, gameState.playerCanMove && countdownComplete && !gameState.paused);

  // handle touch/swipe gestures for mobile - disable during countdown
  const { handleTouchStart, handleTouchEnd } = useSwipeInput(
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
    setCountdownComplete(false); // reset countdown for new game
    gameResetKey.current += 1; // increment to force countdown remount
    // reset tooltip milestones
    setCurrentTooltipMilestone(null);
    setCurrentTooltipMessage("");
    shownMilestonesRef.current.clear();
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setIsSettingsOpen(false); // close settings menu on restart
  }, [resetMusic, resetGame]);

  const handleNextLevel = useCallback(() => {
    // reset countdown state for new level
    setCountdownComplete(false);
    gameResetKey.current += 1; // increment to force countdown remount
    // reset tooltip milestones for new level
    shownMilestonesRef.current.clear();
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    // reset quest completed sound flag
    questCompletedSoundPlayed.current = false;
    // reset previous flower count for new level
    previousFlowerCount.current = 0;
    // call nextLevel to advance to next level
    nextLevel();
  }, [nextLevel]);

  const handleReplayLevel = useCallback(() => {
    // reset countdown state for replay
    setCountdownComplete(false);
    gameResetKey.current += 1; // increment to force countdown remount
    // reset tooltip milestones for replay
    shownMilestonesRef.current.clear();
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    // reset quest completed sound flag
    questCompletedSoundPlayed.current = false;
    // reset previous flower count for replay
    previousFlowerCount.current = 0;
    // call replayLevel to regenerate the same level
    replayLevel();
  }, [replayLevel]);

  const handleCountdownComplete = useCallback(() => {
    setCountdownComplete(true);
    // start item spawning timer when countdown completes
    startItemSpawning();
    // trigger start milestone tooltip after a brief delay (so countdown message can fade)
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

  // handle item usage
  const handleUseItem = useCallback((itemType: ItemType) => {
    // prevent item usage when level is completed, game is over, or paused
    if (gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck || gameState.paused) {
      return; // do nothing and don't play sounds
    }

    if (itemType === "bomb") {
      useBomb();
    } else if (itemType === "cloak") {
      useCloak();
      playSound(AUDIO_PATHS.USE_CLOAK);
    }
    // future items can be handled here
  }, [useBomb, useCloak, playSound, gameState.gameOver, gameState.playerEnteredHouse, gameState.isStuck, gameState.paused]);

  // listen for space bar to use bomb
  useEffect(() => {
    if (!countdownComplete || gameState.gameOver || gameState.playerEnteredHouse || gameState.isStuck || gameState.paused) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault(); // prevent page scroll
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
        // check if player has cloak and is not on cooldown
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

  // don't render the board until the game is initialized
  // check if gridSize is set (which is always set during reset) to keep board visible during reset/retry
  const isGameInitialized = gameState.gridSize > 0;

  return (
    <div className="App" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
            setIsSettingsOpen(!isSettingsOpen);
          }}
          isSettingsOpen={isSettingsOpen}
        />
      )}
      {isGameInitialized && isSettingsOpen && (
        <SettingsMenu
          volume={volume}
          isPlayingMusic={isPlayingMusic}
          onVolumeChange={handleVolumeChange}
          onToggleSound={handleToggleSound}
          onRestart={handleResetGame}
          isOpen={isSettingsOpen}
          onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
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
              onComplete={() => {
                // level complete message has been shown, now showing restart message
              }}
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
