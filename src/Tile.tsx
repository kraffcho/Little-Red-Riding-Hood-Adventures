import React from "react";

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
}) => {
  let className = "tile";
  if (isPlayer) {
    className += " player";
    if (playerDirection === "left") className += " player-left";
    if (playerDirection === "right") className += " player-right";
  }
  if (isWolf) {
    className += " wolf";
    if (wolfDirection === "left") className += " wolf-left";
    if (wolfDirection === "right") className += " wolf-right";
  }
  if (isTree) className += " tree";
  if (isFlower) className += " flower";
  if (isOverlap && isWolf) className += " wolf-overlap";
  if (isGrannyHouse) className += " granny-house";
  if (isGrannyHouse && playerEnteredHouse) className += " tooltip";

  return <div className={className}></div>;
};

export default Tile;
