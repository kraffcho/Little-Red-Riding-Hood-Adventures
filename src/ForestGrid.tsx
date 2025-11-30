import React, { useState, useEffect } from "react";
import Tile from "./Tile";
import { SpecialItem, ExplosionEffect, Position, ExplosionMark } from "./types/game";
import { getPositionsInRadius } from "./utils/itemUtils";

interface Props {
  playerPosition: { x: number; y: number };
  wolfPosition: { x: number; y: number };
  playerDirection: string;
  wolfDirection: string;
  gridSize: number;
  treePositions: Array<{ x: number; y: number }>;
  isPlayerWolfOverlap: boolean;
  grannyHousePosition: { x: number; y: number };
  flowers: Array<{ x: number; y: number }>;
  collectedFlowers: number;
  isHouseOpen: boolean;
  playerEnteredHouse: boolean;
  gameOver: boolean;
  wolfWon: boolean;
  specialItems?: SpecialItem[];
  explosionEffect?: ExplosionEffect | null;
  explosionMarks?: ExplosionMark[];
  wolfStunned?: boolean;
  wolfStunEndTime?: number | null;
  tooltipMessage?: string;
  showTooltip?: boolean;
  playerInvisible?: boolean;
}

const ForestGrid: React.FC<Props> = ({
  playerPosition,
  wolfPosition,
  playerDirection,
  wolfDirection,
  gridSize,
  treePositions,
  isPlayerWolfOverlap,
  flowers,
  playerEnteredHouse,
  gameOver,
  wolfWon,
  specialItems = [],
  explosionEffect = null,
  explosionMarks = [],
  wolfStunned = false,
  wolfStunEndTime = null,
  tooltipMessage,
  showTooltip = false,
  playerInvisible = false,
}) => {
  // check if we're in portrait mode (mobile)
  const [isViewportWidthSmaller, setIsViewportWidthSmaller] = useState(
    typeof window !== "undefined" && window.innerWidth < window.innerHeight
  );

  useEffect(() => {
    const handleResize = () => {
      setIsViewportWidthSmaller(window.innerWidth < window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // use mobile styles if we're in portrait mode
  const gridClassName = isViewportWidthSmaller ? "ForestGrid Mobile" : "ForestGrid";
  // create all the tiles for the grid
  const forestGrid = [...Array(gridSize)].map((_, rowIndex) => (
    <div className="row" key={rowIndex}>
      {[...Array(gridSize)].map((_, columnIndex) => {
        const tilePosition: Position = { x: rowIndex, y: columnIndex };
        const isWall = treePositions.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const isFlower = flowers.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const specialItem = specialItems.find(
          (item) => item.position.x === rowIndex && item.position.y === columnIndex
        );
        const isGrannyHouse =
          rowIndex === gridSize - 1 && columnIndex === gridSize - 1; // granny's house is always at the bottom right

        // check if this tile is in the explosion radius
        const isInExplosion = explosionEffect
          ? getPositionsInRadius(explosionEffect.position, explosionEffect.radius, gridSize).some(
            (pos: Position) => pos.x === rowIndex && pos.y === columnIndex
          )
          : false;

        // check if this tile is the wolf and should show stun timer
        const isWolfTile = wolfPosition.x === rowIndex && wolfPosition.y === columnIndex;
        const showStunTimer = isWolfTile && wolfStunned && wolfStunEndTime !== null;

        // find explosion mark for this tile (if any)
        const explosionMark = explosionMarks.find(
          (mark) => mark.position.x === rowIndex && mark.position.y === columnIndex
        );

        return (
          <Tile
            key={`${rowIndex}-${columnIndex}`}
            isPlayer={
              playerPosition.x === rowIndex && playerPosition.y === columnIndex &&
              !(gameOver && wolfWon) // hide player when wolf wins
            }
            isWolf={isWolfTile}
            isTree={isWall}
            isFlower={isFlower}
            isOverlap={isPlayerWolfOverlap}
            isGrannyHouse={isGrannyHouse}
            playerEnteredHouse={playerEnteredHouse}
            playerDirection={playerDirection}
            wolfDirection={wolfDirection}
            gameOver={gameOver}
            wolfWon={wolfWon}
            specialItem={specialItem}
            isInExplosion={isInExplosion}
            explosionMark={explosionMark}
            showStunTimer={showStunTimer}
            stunEndTime={wolfStunEndTime}
            tooltipMessage={isGrannyHouse ? tooltipMessage : undefined}
            showTooltip={isGrannyHouse ? showTooltip : false}
            playerInvisible={
              playerPosition.x === rowIndex && playerPosition.y === columnIndex
                ? playerInvisible
                : false
            }
            wolfConfused={isWolfTile && playerInvisible}
          />
        );
      })}
    </div>
  ));

  return <div className={gridClassName}>{forestGrid}</div>;
};

export default ForestGrid;
