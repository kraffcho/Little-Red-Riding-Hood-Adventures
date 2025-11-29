import React, { useEffect, useRef } from "react";
import HeaderInventory from "./HeaderInventory";
import SettingsIcon from "./SettingsIcon";
import { ItemType } from "../../types/game";
import { NUM_FLOWERS } from "../../constants/gameConfig";

interface HeaderProps {
  inventory: ItemType[];
  onUseItem: (itemType: ItemType) => void;
  bombCooldownEndTime: number | null;
  collectedFlowers: number;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  inventory,
  onUseItem,
  bombCooldownEndTime,
  collectedFlowers,
  onSettingsClick,
}) => {
  const progress = Math.min(100, Math.max(0, (collectedFlowers / NUM_FLOWERS) * 100));
  const allFlowersCollected = collectedFlowers === NUM_FLOWERS;
  const progressBarRef = useRef<HTMLDivElement>(null);

  // update CSS custom property for progress bar width
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty('--quest-progress', `${progress}%`);
    }
  }, [collectedFlowers]);

  return (
    <header className="game-header">
      <div className="game-header-left">
        <HeaderInventory
          inventory={inventory}
          onUseItem={onUseItem}
          bombCooldownEndTime={bombCooldownEndTime}
        />
      </div>
      <div className="game-header-center">
        <div className="header-quest-progress">
          <span className="header-quest-label">💐 {collectedFlowers}/{NUM_FLOWERS}</span>
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
          className="header-settings-button"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;

