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
}

const ForestGrid: React.FC<Props> = ({
  playerPosition,
  enemyPosition,
  gridSize,
  treePositions,
  isPlayerEnemyOverlap,
}) => {
  // Generate the forest grid with tiles
  const ForestGrid = [...Array(gridSize)].map((_, rowIndex) => (
    <div key={rowIndex} className="row">
      {[...Array(gridSize)].map((_, columnIndex) => {
        const isWall = treePositions.some(
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
            isOverlap={isPlayerEnemyOverlap}
            isGrannyHouse={isGrannyHouse}
          />
        );
      })}
    </div>
  ));

  return <div className="ForestGrid">{ForestGrid}</div>;
};

export default ForestGrid;
