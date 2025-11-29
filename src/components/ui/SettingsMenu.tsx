import React, { useState, useRef, useEffect } from "react";

interface SettingsMenuProps {
  volume: number;
  isPlayingMusic: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleSound: () => void;
  onRestart: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  volume,
  isPlayingMusic,
  onVolumeChange,
  onToggleSound,
  onRestart,
  isOpen,
  onToggle,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // close the menu if user clicks somewhere else
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-menu-dropdown" ref={menuRef}>
      <div className="settings-menu-header">
        <h3>Settings</h3>
        <button type="button" className="settings-menu-close" onClick={onToggle}>
          ×
        </button>
      </div>
      <div className="settings-menu-content">
        <div className="settings-menu-section">
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
          <span className="settings-volume-value">{Math.round(volume * 100)}%</span>
        </div>
        <div className="settings-menu-section">
          <button type="button" onClick={onToggleSound} className="settings-toggle-button">
            {isPlayingMusic ? "🔇 Mute" : "🔊 Unmute"}
          </button>
        </div>
        <div className="settings-menu-section">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(); // close the menu first
              onRestart(); // then restart the game
            }} 
            className="settings-restart-button"
          >
            🔄 Restart Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;

