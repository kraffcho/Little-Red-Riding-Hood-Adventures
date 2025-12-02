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

  // prevent effect re-runs by storing callback in ref
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (restartMessageShownRef.current) {
      return;
    }

    if (show && hasShownRef.current !== level) {
      hasShownRef.current = level;
      setVisible(true);
      setShowRestartMessage(false);
      restartMessageShownRef.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // show completion animation for 3s, then show action buttons
      timerRef.current = setTimeout(() => {
        completedLevelRef.current = level;
        restartMessageShownRef.current = true;
        setShowRestartMessage(true);
        setVisible(true);
        onCompleteRef.current();
        timerRef.current = null;
      }, 3000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    } else if (!show && hasShownRef.current !== level && !restartMessageShownRef.current) {
      setVisible(false);
      if (hasShownRef.current === level) {
        hasShownRef.current = null;
      }
    }
  }, [show, level]);

  const handleRestart = () => {
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

  if (!visible) {
    return null;
  }

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

