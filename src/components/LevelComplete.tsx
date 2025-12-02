import React, { useEffect, useState, useRef } from 'react';
import { getUnlockMessage } from '../constants/levelConfig';

interface LevelCompleteProps {
  level: number;
  onComplete: () => void;
  onRestart: () => void;
  onNextLevel?: () => void;
  onReplayLevel?: () => void;
  show: boolean;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({ level, onComplete, onRestart, onNextLevel, onReplayLevel, show }) => {
  const [visible, setVisible] = useState(false);
  const [showRestartMessage, setShowRestartMessage] = useState(false);
  const completedLevelRef = useRef<number | null>(null);
  const hasShownRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restartMessageShownRef = useRef<boolean>(false);

  // store onComplete in a ref so we can call it without causing effect re-runs
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // once restart message is shown, keep it visible - don't let show prop changes hide it
    if (restartMessageShownRef.current) {
      return;
    }

    // only show the message once per level - track which level we've shown
    if (show && hasShownRef.current !== level) {
      console.log('LevelComplete: Starting level completion for level', level);
      hasShownRef.current = level;
      setVisible(true);
      setShowRestartMessage(false);
      restartMessageShownRef.current = false;

      // clear any existing timer before starting a new one
      if (timerRef.current) {
        console.log('LevelComplete: Clearing existing timer');
        clearTimeout(timerRef.current);
      }

      // show the "LEVEL X COMPLETED" message for 3 seconds, then switch to restart message
      console.log('LevelComplete: Setting timer for 3 seconds');
      timerRef.current = setTimeout(() => {
        console.log('LevelComplete: Timer fired - showing restart message');
        completedLevelRef.current = level; // store the level when showing restart message
        restartMessageShownRef.current = true;
        setShowRestartMessage(true);
        setVisible(true); // keep visible when showing restart message
        onCompleteRef.current(); // call the callback using ref
        timerRef.current = null;
      }, 3000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    } else if (!show && hasShownRef.current !== level && !restartMessageShownRef.current) {
      // only reset when show becomes false AND we're on a different level
      // don't reset if we're showing the restart message
      setVisible(false);
      if (hasShownRef.current === level) {
        hasShownRef.current = null;
      }
    }
  }, [show, level]); // removed onComplete from dependencies

  const handleRestart = () => {
    // clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    setShowRestartMessage(false);
    restartMessageShownRef.current = false;
    completedLevelRef.current = null;
    hasShownRef.current = null;
    onRestart();
  };

  const handleNextLevel = () => {
    // clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    setShowRestartMessage(false);
    restartMessageShownRef.current = false;
    completedLevelRef.current = null;
    hasShownRef.current = null;
    if (onNextLevel) {
      onNextLevel();
    }
  };

  const handleReplayLevel = () => {
    // clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    setShowRestartMessage(false);
    restartMessageShownRef.current = false;
    completedLevelRef.current = null;
    hasShownRef.current = null;
    if (onReplayLevel) {
      onReplayLevel();
    }
  };

  // show restart message after completion animation - this takes priority
  if (showRestartMessage) {
    const displayLevel = completedLevelRef.current ?? level;
    const unlockMessage = getUnlockMessage(displayLevel);
    return (
      <div className="pause-menu fade-in">
        <div className="pause-menu-content">
          <h1 className="level-complete-title">LEVEL {displayLevel} COMPLETED!</h1>
          {unlockMessage && (
            <div className="level-complete-unlock-container">
              <p className="level-complete-unlock-text">
                {unlockMessage}
              </p>
            </div>
          )}
          <div className="level-complete-actions">
            {displayLevel < 3 && onNextLevel ? (
              <>
                <p className="level-complete-prompt">Ready for the next challenge?</p>
                <div className="level-complete-buttons">
                  <button className="level-complete-button level-complete-button-primary" onClick={handleNextLevel}>
                    Continue to Level {displayLevel + 1}
                  </button>
                  <button className="level-complete-button level-complete-button-secondary" onClick={handleRestart}>
                    Restart
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="level-complete-prompt">New levels will be added soon!</p>
                <div className="level-complete-buttons">
                  {onReplayLevel && (
                    <button className="level-complete-button level-complete-button-primary" onClick={handleReplayLevel}>
                      Play Again
                    </button>
                  )}
                  <button className={`level-complete-button ${onReplayLevel ? 'level-complete-button-secondary' : 'level-complete-button-primary'}`} onClick={handleRestart}>
                    Restart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // don't show anything if not visible and not showing restart message
  if (!visible) {
    return null;
  }

  // show completion animation first
  return (
    <div className="level-complete-overlay">
      <div className="level-complete-content">
        <div className="level-complete-number">Well Done!</div>
        <div className="level-complete-message">You outsmarted the wolf!</div>
      </div>
    </div>
  );
};

export default LevelComplete;

