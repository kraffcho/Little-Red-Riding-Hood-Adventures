import React, { useState, useEffect } from "react";
import Tile from "./Tile";

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
        const isWall = treePositions.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const isFlower = flowers.some(
          (position) => position.x === rowIndex && position.y === columnIndex
        );
        const isGrannyHouse =

          rowIndex === gridSize - 1 && columnIndex === gridSize - 1; // granny's house is always at the bottom right
        return (
          <Tile
            key={`${rowIndex}-${columnIndex}`}
            isPlayer={
              playerPosition.x === rowIndex && playerPosition.y === columnIndex &&
              !(gameOver && wolfWon) // hide player when wolf wins
            }
            isWolf={
              wolfPosition.x === rowIndex && wolfPosition.y === columnIndex
            }
            isTree={isWall}
            isFlower={isFlower}
            isOverlap={isPlayerWolfOverlap}
            isGrannyHouse={isGrannyHouse}
            playerEnteredHouse={playerEnteredHouse}
            playerDirection={playerDirection}
            wolfDirection={wolfDirection}
            gameOver={gameOver}
            wolfWon={wolfWon}
          />
        );
      })}
    </div>
  ));

  return <div className={gridClassName}>{forestGrid}</div>;
};

export default ForestGrid;
