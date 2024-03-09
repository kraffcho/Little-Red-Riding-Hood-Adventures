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

  return visible ? (
    <div className="game-over">
      <div className="game-over-content">
        <p className="game-over-message">{message}</p>
        <button className="game-over-restart" onClick={handleRestart}>Restart</button>
      </div>
    </div>
  ) : null;
};

export default GameOver;
