import React from "react";

interface Props {
  isPlayer: boolean;
  isEnemy: boolean;
  isTree: boolean;
  isOverlap: boolean;
  isGrannyHouse: boolean;
}

const Tile: React.FC<Props> = ({
  isPlayer,
  isEnemy,
  isTree,
  isOverlap,
  isGrannyHouse,
}) => {
  let className = "tile";
  if (isPlayer) className += " player";
  if (isEnemy) className += " enemy";
  if (isTree) className += " tree";
  if (isOverlap && isEnemy) className += " enemy-overlap";
  if (isGrannyHouse) className += " granny-house";

  return <div className={className}></div>;
};

export default Tile;
