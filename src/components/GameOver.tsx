import React, { useState } from 'react';

interface GameOverProps {
  message: string;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ message, onRestart }) => {
  const [visible, setVisible] = useState<boolean>(true);

  const handleRestart = () => {
    setVisible(false); // Hide the game-over component
    onRestart(); // Call the onRestart function passed as props
  };

  const handleCancel = () => {
    setVisible(false); // Hide the game-over component
  };

  return visible ? (
    <div className="game-over">
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
