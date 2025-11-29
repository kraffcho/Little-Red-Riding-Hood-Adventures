import React, { useState, useEffect, useRef } from "react";
import { ItemType } from "../../types/game";
import { BOMB_COOLDOWN_DURATION } from "../../constants/gameConfig";

interface InventoryProps {
  inventory: ItemType[];
  onUseItem: (itemType: ItemType) => void;
  bombCooldownEndTime: number | null;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onUseItem, bombCooldownEndTime }) => {
  const [cooldownProgress, setCooldownProgress] = useState<number>(0);
  const cooldownBarRef = useRef<HTMLDivElement>(null);

  // count items by type
  const itemCounts: Record<ItemType, number> = {
    bomb: inventory.filter((item) => item === "bomb").length,
    cloak: inventory.filter((item) => item === "cloak").length,
    health: inventory.filter((item) => item === "health").length,
    speed: inventory.filter((item) => item === "speed").length,
  };

  // update cooldown progress
  useEffect(() => {
    if (bombCooldownEndTime) {
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, bombCooldownEndTime - now);
        const progress = 1 - (remaining / BOMB_COOLDOWN_DURATION);
        setCooldownProgress(Math.min(1, Math.max(0, progress)));
      };

      updateProgress();
      const interval = setInterval(updateProgress, 50); // update every 50ms for smooth animation
      return () => clearInterval(interval);
    } else {
      setCooldownProgress(0);
    }
  }, [bombCooldownEndTime]);

  // update CSS custom property for cooldown progress width
  useEffect(() => {
    if (cooldownBarRef.current) {
      cooldownBarRef.current.style.setProperty('--cooldown-progress', `${cooldownProgress * 100}%`);
    }
  }, [cooldownProgress]);

  const handleItemClick = (itemType: ItemType) => {
    if (itemCounts[itemType] > 0) {
      onUseItem(itemType);
    }
  };

  const isBombOnCooldown = bombCooldownEndTime !== null && Date.now() < bombCooldownEndTime;

  return (
    <div className="inventory">
      <h3 className="inventory-title">Inventory</h3>
      <div className="inventory-items">
        {itemCounts.bomb > 0 && (
          <button
            className={`inventory-item bomb-item ${isBombOnCooldown ? 'on-cooldown' : ''}`}
            onClick={() => handleItemClick("bomb")}
            disabled={isBombOnCooldown}
            title={isBombOnCooldown ? `Bomb on cooldown (${itemCounts.bomb})` : `Use Bomb (${itemCounts.bomb})`}
          >
            <span className="inventory-item-icon">💣</span>
            <span className="inventory-item-count">{itemCounts.bomb}</span>
            {isBombOnCooldown && (
              <div
                ref={cooldownBarRef}
                className="inventory-item-cooldown-bar"
              >
                <div className="inventory-item-cooldown-bar-fill" />
              </div>
            )}
          </button>
        )}
        {itemCounts.health > 0 && (
          <button
            className="inventory-item health-item"
            onClick={() => handleItemClick("health")}
            title={`Use Health (${itemCounts.health})`}
          >
            <span className="inventory-item-icon">❤️</span>
            <span className="inventory-item-count">{itemCounts.health}</span>
          </button>
        )}
        {itemCounts.speed > 0 && (
          <button
            className="inventory-item speed-item"
            onClick={() => handleItemClick("speed")}
            title={`Use Speed (${itemCounts.speed})`}
          >
            <span className="inventory-item-icon">⚡</span>
            <span className="inventory-item-count">{itemCounts.speed}</span>
          </button>
        )}
        {inventory.length === 0 && (
          <div className="inventory-empty">No items</div>
        )}
      </div>
    </div>
  );
};

export default Inventory;

