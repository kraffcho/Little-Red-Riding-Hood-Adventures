import React, { useEffect, useState } from "react";

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
}) => {
  const [scaleClass, setScaleClass] = useState("");

  useEffect(() => {
    if (isTree) {
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      setScaleClass(`scale${randomNumber}`);
    }
  }, [isTree]);

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

  return <div className={className}></div>;
};

export default Tile;
