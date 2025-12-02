import React, { useState, useEffect, useRef } from "react";
import { ItemType } from "../../types";
import { BOMB_COOLDOWN_DURATION, CLOAK_COOLDOWN_DURATION } from "../../constants/gameConfig";

interface HeaderInventoryProps {
  inventory: ItemType[];
  onUseItem: (itemType: ItemType) => void;
  bombCooldownEndTime: number | null;
  cloakCooldownEndTime: number | null;
  gameOver?: boolean;
  playerEnteredHouse?: boolean;
  isStuck?: boolean;
}

const INVENTORY_SLOTS = 3;
const ITEM_ORDER: ItemType[] = ["bomb", "cloak", "health"];

const HeaderInventory: React.FC<HeaderInventoryProps> = ({
  inventory,
  onUseItem,
  bombCooldownEndTime,
  cloakCooldownEndTime,
  gameOver = false,
  playerEnteredHouse = false,
  isStuck = false,
}) => {
  const [cooldownProgress, setCooldownProgress] = useState<number>(0);
  const cooldownRef = useRef<HTMLDivElement>(null);

  const itemCounts: Record<ItemType, number> = {
    bomb: inventory.filter((item) => item === "bomb").length,
    cloak: inventory.filter((item) => item === "cloak").length,
    health: inventory.filter((item) => item === "health").length,
    speed: inventory.filter((item) => item === "speed").length,
  };

  const [cloakCooldownProgress, setCloakCooldownProgress] = useState<number>(0);
  const cloakCooldownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (cloakCooldownEndTime) {
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, cloakCooldownEndTime - now);
        const progress = 1 - remaining / CLOAK_COOLDOWN_DURATION;
        setCloakCooldownProgress(Math.min(1, Math.max(0, progress)));
      };

      updateProgress();
      const interval = setInterval(updateProgress, 50);
      return () => clearInterval(interval);
    } else {
      setCloakCooldownProgress(0);
    }
  }, [cloakCooldownEndTime]);

  useEffect(() => {
    if (cooldownRef.current) {
      cooldownRef.current.style.setProperty('--cooldown-progress', `${cooldownProgress * 100}%`);
    }
  }, [cooldownProgress]);

  useEffect(() => {
    if (cloakCooldownRef.current) {
      cloakCooldownRef.current.style.setProperty('--cooldown-progress', `${cloakCooldownProgress * 100}%`);
    }
  }, [cloakCooldownProgress]);

  const handleItemClick = (itemType: ItemType) => {
    if (itemCounts[itemType] > 0) {
      onUseItem(itemType);
    }
  };

  const isBombOnCooldown = bombCooldownEndTime !== null && Date.now() < bombCooldownEndTime;
  const isCloakOnCooldown = cloakCooldownEndTime !== null && Date.now() < cloakCooldownEndTime;

  const getItemIcon = (itemType: ItemType): string => {
    switch (itemType) {
      case "bomb":
        return "💣";
      case "cloak":
        return "🧥";
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
        const isBombCooldown = itemType === "bomb" && isBombOnCooldown;
        const isCloakCooldown = itemType === "cloak" && isCloakOnCooldown;
        const isBombDisabled = itemType === "bomb" && (gameOver || playerEnteredHouse || isStuck);
        const isCloakDisabled = itemType === "cloak" && (gameOver || playerEnteredHouse || isStuck);
        const isCooldown = isBombCooldown || isCloakCooldown;
        const isDisabled = isBombDisabled || isCloakDisabled;
        const showCount = itemType !== "cloak";

        return (
          <button
            key={itemType}
            className={`header-inventory-slot ${hasItem ? `has-item ${itemType}-item` : "empty"} ${hasItem && (isCooldown || isDisabled) ? "on-cooldown" : ""}`}
            onClick={() => hasItem && !isCooldown && !isDisabled && handleItemClick(itemType)}
            disabled={isCooldown || isDisabled}
          >
            {hasItem && (
              <>
                <span className="header-inventory-icon">{getItemIcon(itemType)}</span>
                {showCount && <span className="header-inventory-count">{count}</span>}
                {itemType === "bomb" && isBombCooldown && (
                  <div ref={cooldownRef} className="header-inventory-cooldown" />
                )}
                {itemType === "cloak" && isCloakCooldown && (
                  <div ref={cloakCooldownRef} className="header-inventory-cooldown" />
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

