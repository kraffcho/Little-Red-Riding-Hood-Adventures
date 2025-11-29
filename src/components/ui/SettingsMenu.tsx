import React, { useState, useRef, useEffect } from "react";
import VolumeIcon from "./icons/VolumeIcon";
import RestartIcon from "./icons/RestartIcon";
import CloseIcon from "./icons/CloseIcon";

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
        <button type="button" className="settings-menu-close" onClick={onToggle} aria-label="Close settings">
          <CloseIcon />
        </button>
      </div>
      <div className="settings-menu-content">
        <div className="settings-menu-section">
          <div className="settings-menu-section-header">
            <VolumeIcon className="settings-menu-icon" muted={!isPlayingMusic} />
            <label htmlFor="volumeSlider" className="settings-menu-label">Volume</label>
          </div>
          <div className="settings-volume-control">
            <input
              type="range"
              id="volumeSlider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="settings-volume-slider"
            />
            <span className="settings-volume-value">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="settings-menu-divider"></div>

        <div className="settings-menu-section">
          <button 
            type="button" 
            onClick={onToggleSound} 
            className="settings-action-button settings-toggle-button"
          >
            <VolumeIcon className="settings-action-icon" muted={!isPlayingMusic} />
            <span>{isPlayingMusic ? "Mute Sound" : "Unmute Sound"}</span>
          </button>
        </div>

        <div className="settings-menu-divider"></div>

        <div className="settings-menu-section">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
              onRestart();
            }} 
            className="settings-action-button settings-restart-button"
          >
            <RestartIcon className="settings-action-icon" />
            <span>Restart Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;

