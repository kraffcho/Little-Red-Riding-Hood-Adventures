import React, { useEffect, useState, useRef } from 'react';

interface LevelCompleteProps {
  level: number;
  onComplete: () => void;
  show: boolean;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({ level, onComplete, show }) => {
  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef<number | null>(null);

  useEffect(() => {
    // only show the message once per level - track which level we've shown
    if (show && hasShownRef.current !== level) {
      hasShownRef.current = level;
      setVisible(true);
      // show the message for 3 seconds, then call onComplete
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    } else if (!show) {
      // reset when show becomes false (new level starting)
      if (hasShownRef.current === level) {
        hasShownRef.current = null;
      }
      setVisible(false);
    }
  }, [show, level, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <div className="level-complete-overlay">
      <div className="level-complete-content">
        <div className="level-complete-number">LEVEL {level}</div>
        <div className="level-complete-message">COMPLETED</div>
      </div>
    </div>
  );
};

export default LevelComplete;

