import React, { useState, useRef, useEffect } from "react";
import GameControls from "./GameControls";

interface SettingsMenuProps {
  volume: number;
  isPlayingMusic: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleSound: () => void;
  onRestart: () => void;
  onInteraction?: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  volume,
  isPlayingMusic,
  onVolumeChange,
  onToggleSound,
  onRestart,
  onInteraction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close the menu if user clicks somewhere else
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (onInteraction) {
      onInteraction();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="settings-menu-container" ref={menuRef}>
      <button className="settings-menu-button" onClick={toggleMenu} aria-label="Settings">
        ⚙️
      </button>
      {isOpen && (
        <div className="settings-menu-dropdown">
          <div className="settings-menu-header">
            <h3>Settings</h3>
            <button className="settings-menu-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="settings-menu-content">
            <GameControls
              volume={volume}
              isPlayingMusic={isPlayingMusic}
              onVolumeChange={onVolumeChange}
              onToggleSound={onToggleSound}
              onRestart={onRestart}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;

