import React, { useEffect, useState } from 'react';

interface LevelCompleteProps {
  level: number;
  onComplete: () => void;
  show: boolean;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({ level, onComplete, show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // show the message for 3 seconds, then call onComplete
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onComplete]);

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

