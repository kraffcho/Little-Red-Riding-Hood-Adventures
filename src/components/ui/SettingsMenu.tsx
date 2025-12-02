import React, { useState, useRef, useEffect } from "react";
import VolumeIcon from "./icons/VolumeIcon";
import RestartIcon from "./icons/RestartIcon";
import Credits from "./Credits";

interface SettingsMenuProps {
  volume: number;
  isPlayingMusic: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleSound: () => void;
  onRestart: () => void;
  isOpen: boolean;
  onToggle: (shouldUnpause?: boolean) => void;
  currentLevel: number;
  collectedFlowers: number;
  totalFlowers: number;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  volume,
  isPlayingMusic,
  onVolumeChange,
  onToggleSound,
  onRestart,
  isOpen,
  onToggle,
  currentLevel,
  collectedFlowers,
  totalFlowers,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const totalLevels = 3; // Update this when adding more levels
  const levelProgress = (currentLevel / totalLevels) * 100;
  const currentLevelProgress = (collectedFlowers / totalFlowers) * 100;

  // close the menu if user clicks somewhere else (but not the settings button)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // don't close if clicking on the settings button or its children
      const isSettingsButton = target.closest('.header-settings-button');

      if (menuRef.current && !menuRef.current.contains(target) && !isSettingsButton) {
        if (isOpen) {
          onToggle(true);
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
        <h3>Game Menu</h3>
      </div>
      <div className="settings-menu-content">
        {/* Game Progress Section */}
        <div className="settings-menu-section settings-progress-section">
          <div className="settings-progress-item">
            <div className="settings-progress-header">
              <span className="settings-progress-icon">🎮</span>
              <div className="settings-progress-text">
                <span className="settings-progress-value">Level {currentLevel} of {totalLevels}</span>
              </div>
            </div>
            <div className="settings-progress-bar-container">
              <div
                className="settings-progress-bar-fill"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          <div className="settings-progress-item settings-progress-item-flowers">
            <div className="settings-progress-header">
              <span className="settings-progress-icon">💐</span>
              <div className="settings-progress-text">
                <span className="settings-progress-value">{collectedFlowers} / {totalFlowers} flowers</span>
              </div>
            </div>
            <div className="settings-progress-bar-container">
              <div
                className="settings-progress-bar-fill settings-progress-bar-flowers"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Audio Controls Section */}
        <div className="settings-menu-section">
          <div className="settings-section-title">
            <span>🔊 Audio</span>
          </div>
          <div className="settings-volume-control">
            <div className="settings-volume-header">
              <VolumeIcon className="settings-menu-icon" muted={!isPlayingMusic} />
              <label htmlFor="volumeSlider" className="settings-menu-label">Volume</label>
              <span className="settings-volume-value">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              id="volumeSlider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newVolume = parseFloat(e.target.value);
                onVolumeChange(newVolume);
              }}
              onInput={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newVolume = parseFloat((e.target as HTMLInputElement).value);
                onVolumeChange(newVolume);
              }}
              className="settings-volume-slider"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSound();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="settings-menu-item-button"
          >
            <VolumeIcon className="settings-item-icon" muted={!isPlayingMusic} />
            <span>{isPlayingMusic ? "Mute Sound" : "Unmute Sound"}</span>
          </button>
        </div>

        {/* Actions Section */}
        <div className="settings-menu-section">
          <div className="settings-section-title">
            <span>⚙️ Actions</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
              onRestart();
            }}
            className="settings-menu-item-button settings-restart-button"
          >
            <RestartIcon className="settings-item-icon" />
            <span>Restart Game</span>
          </button>
        </div>

        <Credits variant="settings-menu" />
      </div>
    </div>
  );
};

export default SettingsMenu;

