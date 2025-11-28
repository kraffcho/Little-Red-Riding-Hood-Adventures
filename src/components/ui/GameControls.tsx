import React from "react";

interface GameControlsProps {
  volume: number;
  isPlayingMusic: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleSound: () => void;
  onRestart: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  volume,
  isPlayingMusic,
  onVolumeChange,
  onToggleSound,
  onRestart,
}) => {
  return (
    <div className="game-controls">
      <div className="game-sound">
        <div className="game-sound-volume">
          <label htmlFor="volumeSlider">🔊 Volume:</label>
          <input
            type="range"
            id="volumeSlider"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          />
        </div>
        <button onClick={onToggleSound}>
          {isPlayingMusic ? "Pause Sound" : "Play Sound"}
        </button>
      </div>
      <div className="game-reset">
        <p>If you ever need a fresh start...</p>
        <button onClick={onRestart}>Restart</button>
      </div>
    </div>
  );
};

export default GameControls;

