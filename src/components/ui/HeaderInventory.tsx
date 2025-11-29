import React, { useState, useEffect, useRef } from "react";
import { ItemType } from "../../types/game";
import { BOMB_COOLDOWN_DURATION } from "../../constants/gameConfig";

interface HeaderInventoryProps {
  inventory: ItemType[];
  onUseItem: (itemType: ItemType) => void;
  bombCooldownEndTime: number | null;
}

const INVENTORY_SLOTS = 3;
const ITEM_ORDER: ItemType[] = ["bomb", "health", "speed"];

const HeaderInventory: React.FC<HeaderInventoryProps> = ({
  inventory,
  onUseItem,
  bombCooldownEndTime,
}) => {
  const [cooldownProgress, setCooldownProgress] = useState<number>(0);
  const cooldownRef = useRef<HTMLDivElement>(null);

  // count items by type
  const itemCounts: Record<ItemType, number> = {
    bomb: inventory.filter((item) => item === "bomb").length,
    health: inventory.filter((item) => item === "health").length,
    speed: inventory.filter((item) => item === "speed").length,
  };

  // update cooldown progress
  useEffect(() => {
    if (bombCooldownEndTime) {
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, bombCooldownEndTime - now);
        const progress = 1 - remaining / BOMB_COOLDOWN_DURATION;
        setCooldownProgress(Math.min(1, Math.max(0, progress)));
      };

      updateProgress();
      const interval = setInterval(updateProgress, 50);
      return () => clearInterval(interval);
    } else {
      setCooldownProgress(0);
    }
  }, [bombCooldownEndTime]);

  // update CSS custom property for cooldown progress width
  useEffect(() => {
    if (cooldownRef.current) {
      cooldownRef.current.style.setProperty('--cooldown-progress', `${cooldownProgress * 100}%`);
    }
  }, [cooldownProgress]);

  const handleItemClick = (itemType: ItemType) => {
    if (itemCounts[itemType] > 0) {
      onUseItem(itemType);
    }
  };

  const isBombOnCooldown = bombCooldownEndTime !== null && Date.now() < bombCooldownEndTime;

  // get item icon
  const getItemIcon = (itemType: ItemType): string => {
    switch (itemType) {
      case "bomb":
        return "💣";
      case "health":
        return "❤️";
      case "speed":
        return "⚡";
      default:
        return "";
    }
  };

  return (
    <div className="header-inventory">
      {ITEM_ORDER.slice(0, INVENTORY_SLOTS).map((itemType) => {
        const count = itemCounts[itemType];
        const hasItem = count > 0;
        const isCooldown = itemType === "bomb" && isBombOnCooldown;

        return (
          <button
            key={itemType}
            className={`header-inventory-slot ${hasItem ? `has-item ${itemType}-item` : "empty"} ${isCooldown ? "on-cooldown" : ""}`}
            onClick={() => hasItem && handleItemClick(itemType)}
            disabled={isCooldown}
            title={hasItem ? `${itemType} (${count})${isCooldown ? " - On cooldown" : ""}` : "Empty slot"}
          >
            {hasItem && (
              <>
                <span className="header-inventory-icon">{getItemIcon(itemType)}</span>
                <span className="header-inventory-count">{count}</span>
                {isCooldown && (
                  <div
                    ref={cooldownRef}
                    className="header-inventory-cooldown"
                  />
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HeaderInventory;

