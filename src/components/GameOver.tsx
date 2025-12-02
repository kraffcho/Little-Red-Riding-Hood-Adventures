import React, { useState } from 'react';

interface GameOverProps {
  message: string;
  onRetryLevel: () => void;
  onRestartGame: () => void;
  isStuck?: boolean;
  currentLevel?: number;
}

const GameOver: React.FC<GameOverProps> = ({ 
  message, 
  onRetryLevel, 
  onRestartGame, 
  isStuck = false,
  currentLevel = 1 
}) => {
  const [visible, setVisible] = useState<boolean>(true);

  const handleRetryLevel = () => {
    setVisible(false);
    onRetryLevel();
  };

  const handleRestartGame = () => {
    setVisible(false);
    onRestartGame();
  };

  return visible ? (
    <div className={`game-over ${isStuck ? 'stuck' : ''}`}>
      <div className="game-over-content">
        <p className="game-over-message" dangerouslySetInnerHTML={{ __html: message }}></p>
        <div className="game-over-buttons">
          <button className="game-over-cta game-over-cta-primary" onClick={handleRetryLevel}>
            Try Again
          </button>
          <button className="game-over-cta game-over-cta-secondary" onClick={handleRestartGame}>
            Restart
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default GameOver;
