import React, { useEffect, useState } from "react";
import { SpecialItem } from "./types/game";

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
  showStunTimer,
  stunEndTime,
}) => {
  const [scaleClass, setScaleClass] = useState("");
  const [stunTimeRemaining, setStunTimeRemaining] = useState<number>(0);

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
  if (showStunTimer) className += " wolf-stunned";

  return (
    <div className={className}>
      {specialItem && (
        <div className={`special-item-icon ${specialItem.type}`}>
          {specialItem.type === "bomb" && "💣"}
        </div>
      )}
      {isInExplosion && <div className="explosion-effect" />}
      {showStunTimer && stunTimeRemaining > 0 && (
        <div className="stun-timer">
          <div className="stun-timer-text">{stunTimeRemaining}s</div>
        </div>
      )}
    </div>
  );
};

export default Tile;
