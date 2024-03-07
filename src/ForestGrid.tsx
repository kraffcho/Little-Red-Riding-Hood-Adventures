import React from "react";
import Tile from "./Tile";

interface Props {
  playerPosition: { x: number; y: number };
  enemyPosition: { x: number; y: number };
  gridSize: number;
  treePositions: Array<{ x: number; y: number }>;
  playerDirection: string;
  enemyDirection: string;
  isPlayerEnemyOverlap: boolean;
  grannyHousePosition: { x: number; y: number }; // Add grannyHousePosition to Props
  flowers: Array<{ x: number; y: number }>;
  collectedFlowers: number;
  isHouseOpen: boolean;
  playerEnteredHouse: boolean;
}

// Check if viewport width is smaller than viewport height
const isViewportWidthSmaller = window.innerWidth < window.innerHeight;

// Conditionally apply custom class based on viewport width
const gridClassName = isViewportWidthSmaller ? "ForestGrid Mobile" : "ForestGrid";

const ForestGrid: React.FC<Props> = ({
  playerPosition,
  enemyPosition,
  gridSize,
  treePositions,
  isPlayerEnemyOverlap,
  flowers,
  playerEnteredHouse,
}) => {
  // Generate the forest grid with tiles
  const forestGrid = [...Array(gridSize)].map((_, rowIndex) => (
    <div className="row" key={rowIndex}>
      {[...Array(gridSize)].map((_, columnIndex) => {
        const isWall = treePositions.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const isFlower = flowers.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const isGrannyHouse =

          rowIndex === gridSize - 1 && columnIndex === gridSize - 1; // Check if current tile is granny's house
        return (
          <Tile
            key={`${rowIndex}-${columnIndex}`}
            isPlayer={
              playerPosition.x === rowIndex && playerPosition.y === columnIndex
            }
            isEnemy={
              enemyPosition.x === rowIndex && enemyPosition.y === columnIndex
            }
            isTree={isWall}
            isFlower={isFlower}
            isOverlap={isPlayerEnemyOverlap}
            isGrannyHouse={isGrannyHouse}
            playerEnteredHouse={playerEnteredHouse}
          />
        );
      })}
    </div>
  ));

  return <div className={gridClassName}>{forestGrid}</div>;
};

export default ForestGrid;
