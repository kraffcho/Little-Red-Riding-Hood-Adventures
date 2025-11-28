import React, { useState } from 'react';

interface GameOverProps {
  message: string;
  onRestart: () => void;
  isStuck?: boolean;
}

const GameOver: React.FC<GameOverProps> = ({ message, onRestart, isStuck = false }) => {
  const [visible, setVisible] = useState<boolean>(true);

  const handleRestart = () => {
    setVisible(false); // hide this modal
    onRestart(); // restart the game
  };

  const handleCancel = () => {
    setVisible(false); // just close the modal
  };

  return visible ? (
    <div className={`game-over ${isStuck ? 'stuck' : ''}`}>
      <div className="game-over-content">
        <p className="game-over-message" dangerouslySetInnerHTML={{ __html: message }}></p>
        <div className="game-over-buttons">
          <button className="game-over-cta restart" onClick={handleRestart}>Yes</button>
          <button className="game-over-cta cancel" onClick={handleCancel}>No</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default GameOver;
