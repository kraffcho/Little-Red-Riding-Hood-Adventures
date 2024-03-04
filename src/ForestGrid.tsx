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
  grannyHousePosition: { x: number; y: number };
  flowers: Array<{ x: number; y: number }>; // Add this line
  collectedFlowers: number; // Add this line
}

const ForestGrid: React.FC<Props> = ({
  playerPosition,
  enemyPosition,
  gridSize,
  treePositions,
  isPlayerEnemyOverlap,
  flowers,
}) => {
  // Generate the forest grid with tiles
  const forestGrid = [...Array(gridSize)].map((_, rowIndex) => (
    <div key={rowIndex} className="row">
      {[...Array(gridSize)].map((_, columnIndex) => {
        const isWall = treePositions.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const isGrannyHouse =
          rowIndex === gridSize - 1 && columnIndex === gridSize - 1; // Check if current tile is granny's house
        const isFlower = flowers.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
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
          />
        );
      })}
    </div>
  ));

  return <div className="ForestGrid">{forestGrid}</div>;
};

export default ForestGrid;
