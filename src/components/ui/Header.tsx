import React, { useEffect, useRef } from "react";
import HeaderInventory from "./HeaderInventory";
import SettingsIcon from "./icons/SettingsIcon";
import PauseIcon from "./icons/PauseIcon";
import PlayIcon from "./icons/PlayIcon";
import { ItemType } from "../../types";
import { getLevelConfig } from "../../constants/levelConfig";

interface HeaderProps {
  inventory: ItemType[];
  onUseItem: (itemType: ItemType) => void;
  bombCooldownEndTime: number | null;
  cloakCooldownEndTime: number | null;
  collectedFlowers: number;
  currentLevel: number;
  onSettingsClick: () => void;
  onPauseClick: () => void;
  gameOver?: boolean;
  playerEnteredHouse?: boolean;
  isStuck?: boolean;
  paused?: boolean;
  countdownComplete?: boolean;
  isSettingsOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  inventory,
  onUseItem,
  bombCooldownEndTime,
  cloakCooldownEndTime,
  collectedFlowers,
  currentLevel,
  onSettingsClick,
  onPauseClick,
  gameOver = false,
  playerEnteredHouse = false,
  isStuck = false,
  paused = false,
  countdownComplete = false,
  isSettingsOpen = false,
}) => {
  const levelConfig = getLevelConfig(currentLevel);
  const numFlowers = levelConfig.numFlowers;
  const progress = Math.min(100, Math.max(0, (collectedFlowers / numFlowers) * 100));
  const allFlowersCollected = collectedFlowers === numFlowers;
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty('--quest-progress', `${progress}%`);
    }
  }, [collectedFlowers, numFlowers, progress]);

  return (
    <header className="game-header">
      <div className="game-header-left">
        <HeaderInventory
          inventory={inventory}
          onUseItem={onUseItem}
          bombCooldownEndTime={bombCooldownEndTime}
          cloakCooldownEndTime={cloakCooldownEndTime}
          gameOver={gameOver}
          playerEnteredHouse={playerEnteredHouse}
          isStuck={isStuck}
        />
      </div>
      <div className="game-header-center">
        <div className="header-quest-progress">
          <div className="header-quest-progress-text">
            <span className="header-quest-label">💐 Collect Flowers</span>
            <span className="header-quest-count">{collectedFlowers}/{numFlowers}</span>
          </div>
          <div className="header-quest-progress-bar-container">
            <div
              ref={progressBarRef}
              className={`header-quest-progress-bar ${allFlowersCollected ? "complete" : ""}`}
            />
          </div>
        </div>
      </div>
      <div className="game-header-right">
        <button
          className="header-pause-button"
          onClick={onPauseClick}
          disabled={!countdownComplete || gameOver || playerEnteredHouse || isStuck}
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button
          className="header-settings-button"
          onClick={onSettingsClick}
          aria-label={isSettingsOpen ? "Close settings" : "Open settings"}
          {...(isSettingsOpen && { "aria-expanded": true })}
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;

