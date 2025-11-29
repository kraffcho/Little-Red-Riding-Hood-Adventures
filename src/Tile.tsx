import React, { useEffect, useState } from "react";
import { SpecialItem, ExplosionMark } from "./types/game";
import { EXPLOSION_MARK_DURATION } from "./constants/gameConfig";

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

  let className = "tile";
  // hide player sprite when wolf wins the game
  if (isPlayer && !(gameOver && wolfWon)) {
    className += " player";
    if (playerDirection === "left") className += " player-left";
    if (playerDirection === "right") className += " player-right";
    if (playerDirection === "up") className += " player-up";
    if (playerDirection === "down") className += " player-down";
  }
  if (isWolf) {
    className += " wolf";
    if (wolfDirection === "left") className += " wolf-left";
    if (wolfDirection === "right") className += " wolf-right";
    if (wolfDirection === "up") className += " wolf-up";
    if (wolfDirection === "down") className += " wolf-down";
  }
  if (isTree) className += ` tree ${scaleClass}`;
  if (isFlower) className += " flower";
  if (isOverlap && isWolf) className += " wolf-overlap";
  if (isGrannyHouse) className += " granny-house";
  if (isGrannyHouse && playerEnteredHouse) className += " tooltip";
  if (playerEnteredHouse && isPlayer && isGrannyHouse) className += " player-in-house";
  if (specialItem) className += " special-item";
  if (isInExplosion) className += " explosion";
  if (explosionMark) className += " explosion-mark";
  if (showStunTimer) className += " wolf-stunned";

  return (
    <div className={className}>
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
          <div className="stun-timer-text">{stunTimeRemaining}s</div>
        </div>
      )}
    </div>
  );
};

export default Tile;
