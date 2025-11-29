import React, { useEffect, useState, useMemo } from "react";
import { SpecialItem, ExplosionMark } from "./types/game";
import { EXPLOSION_MARK_DURATION } from "./constants/gameConfig";
import { classNames, getDirectionClass } from "./utils/classNames";

interface Props {
  isPlayer: boolean;
  isWolf: boolean;
  isTree: boolean;
  isFlower: boolean;
  isOverlap: boolean;
  isGrannyHouse: boolean;
  playerEnteredHouse: boolean;
  playerDirection?: string;
  wolfDirection?: string;
  gameOver?: boolean;
  wolfWon?: boolean;
  specialItem?: SpecialItem;
  isInExplosion?: boolean;
  explosionMark?: ExplosionMark;
  showStunTimer?: boolean;
  stunEndTime?: number | null;
  tooltipMessage?: string;
  showTooltip?: boolean;
}

const Tile: React.FC<Props> = ({
  isPlayer,
  isWolf,
  isTree,
  isFlower,
  isOverlap,
  isGrannyHouse,
  playerEnteredHouse,
  playerDirection,
  wolfDirection,
  gameOver,
  wolfWon,
  specialItem,
  isInExplosion,
  explosionMark,
  showStunTimer,
  stunEndTime,
  tooltipMessage,
  showTooltip = false,
}) => {
  const [scaleClass, setScaleClass] = useState("");
  const [stunTimeRemaining, setStunTimeRemaining] = useState<number>(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (isTree) {
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      setScaleClass(`scale${randomNumber}`);
    }
  }, [isTree]);

  // update stun timer
  useEffect(() => {
    if (showStunTimer && stunEndTime) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((stunEndTime - Date.now()) / 1000));
        setStunTimeRemaining(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 100);
      return () => clearInterval(interval);
    } else {
      setStunTimeRemaining(0);
    }
  }, [showStunTimer, stunEndTime]);

  // check if explosion mark should be fading (last 0.5 seconds before removal)
  useEffect(() => {
    if (!explosionMark) {
      setIsFading(false);
      return;
    }

    const checkFade = () => {
      const now = Date.now();
      const age = now - explosionMark.createdAt;
      const fadeStartTime = EXPLOSION_MARK_DURATION - 500; // start fading 0.5 seconds before removal

      if (age >= fadeStartTime) {
        setIsFading(true);
      } else {
        setIsFading(false);
      }
    };

    checkFade();
    const interval = setInterval(checkFade, 50); // check every 50ms for smooth fade
    return () => clearInterval(interval);
  }, [explosionMark]);

  // build className string declaratively using utility function
  const shouldShowPlayer = isPlayer && !(gameOver && wolfWon);

  const className = useMemo(
    () =>
      classNames(
        "tile",
        shouldShowPlayer && "player",
        shouldShowPlayer && getDirectionClass("player", playerDirection),
        isWolf && "wolf",
        isWolf && getDirectionClass("wolf", wolfDirection),
        isTree && "tree",
        isTree && scaleClass,
        isFlower && "flower",
        isOverlap && isWolf && "wolf-overlap",
        isGrannyHouse && "granny-house",
        isGrannyHouse && showTooltip && "tooltip",
        playerEnteredHouse && isPlayer && isGrannyHouse && "player-in-house",
        specialItem && "special-item",
        isInExplosion && "explosion",
        explosionMark && "explosion-mark",
        showStunTimer && "wolf-stunned"
      ),
    [
      shouldShowPlayer,
      playerDirection,
      isWolf,
      wolfDirection,
      isTree,
      scaleClass,
      isFlower,
      isOverlap,
      isGrannyHouse,
      showTooltip,
      playerEnteredHouse,
      isPlayer,
      specialItem,
      isInExplosion,
      explosionMark,
      showStunTimer,
    ]
  );

  return (
    <div className={className} data-tooltip={showTooltip && tooltipMessage ? tooltipMessage : undefined}>
      {specialItem && (
        <div className={`special-item-icon ${specialItem.type}`}>
          {specialItem.type === "bomb" && "💣"}
        </div>
      )}
      {isInExplosion && <div className="explosion-effect" />}
      {explosionMark && (
        <div className={`explosion-mark-effect ${isFading ? "fading" : ""}`} />
      )}
      {showStunTimer && stunTimeRemaining > 0 && (
        <div className="stun-timer">
          <div className="stun-timer-text">{stunTimeRemaining}</div>
        </div>
      )}
    </div>
  );
};

export default Tile;
