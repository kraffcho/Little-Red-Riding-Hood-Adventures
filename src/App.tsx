import React, { useState, useEffect } from "react";
import "./styles.css";
import ForestGrid from "./ForestGrid";

const GRID_SIZE = 20; // Assuming a 20x20 grid

const App: React.FC = () => {
  const [playerPosition, setPlayerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: -1, y: -1 });
  const [enemyPosition, setEnemyPosition] = useState<{ x: number; y: number }>({
    x: -1,
    y: -1,
  });
  const [treePositions, setTreePositions] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [grannyHousePosition, setGrannyHousePosition] = useState<{
    x: number;
    y: number;
  }>({ x: -1, y: -1 });
  const [playerDirection, setPlayerDirection] = useState(""); // Track player's direction
  const [playerCanMove, setPlayerCanMove] = useState(true);
  const [enemyDirection, setEnemyDirection] = useState(""); // Track enemy's direction
  const [enemyMoving, setEnemyMoving] = useState(true); // Track if enemy is moving

  // Function to generate random tree positions
  const generateRandomTrees = (): void => {
    const newTreePositions: Array<{ x: number; y: number }> = [];
    const grannyHouseX = GRID_SIZE - 1; // x-coordinate of the granny's house
    const grannyHouseY = GRID_SIZE - 1; // y-coordinate of the granny's house
    for (let i = 0; i < GRID_SIZE * 2; i++) {
      let x = Math.floor(Math.random() * GRID_SIZE);
      let y = Math.floor(Math.random() * GRID_SIZE);
      // Exclude the first cell (0, 0) from the list of tree positions
      // because it is the player's starting position
      // Exclude cells closest to the granny's house
      while (
        (x === 0 && y === 0) || // Exclude the player's starting position
        (Math.abs(x - grannyHouseX) <= 1 && Math.abs(y - grannyHouseY) <= 1)
      ) {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      }
      newTreePositions.push({ x, y });
    }
    setTreePositions(newTreePositions);
  };

  // Function to handle player movement
  const movePlayer = (direction: string) => {
    if (!playerCanMove) return; // Check if the player can move
    const newPosition = { ...playerPosition };
    switch (direction) {
      case "up":
        newPosition.x -= 1;
        setPlayerDirection("up");
        break;
      case "down":
        newPosition.x += 1;
        setPlayerDirection("down");
        break;
      case "left":
        newPosition.y -= 1;
        setPlayerDirection("left");
        break;
      case "right":
        newPosition.y += 1;
        setPlayerDirection("right");
        break;
      default:
        break;
    }
    // Check if new position is valid...
    if (isValidPosition(newPosition.x, newPosition.y)) {
      setPlayerPosition(newPosition);
      checkCollision(newPosition);
    }
  };

  // Function to check if a position is valid in the forest grid
  const isValidPosition = (x: number, y: number): boolean => {
    return (
      x >= 0 &&
      x < GRID_SIZE &&
      y >= 0 &&
      y < GRID_SIZE &&
      !treePositions.some((position) => position.x === x && position.y === y)
    );
  };

  // Function to check for collision between player and enemy
  const checkCollision = (playerPos: { x: number; y: number }) => {
    if (playerPos.x === enemyPosition.x && playerPos.y === enemyPosition.y) {
      setPlayerPosition({ x: -1, y: -1 }); // Remove player from grid
      setEnemyMoving(false); // Stop enemy movement
      setPlayerCanMove(false); // Prevent player from moving
    }
  };

  // Function to handle keyboard events for player movement
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
        movePlayer("up");
        break;
      case "ArrowDown":
        movePlayer("down");
        break;
      case "ArrowLeft":
        movePlayer("left");
        break;
      case "ArrowRight":
        movePlayer("right");
        break;
      default:
        break;
    }
  };

  // Function to move the enemy towards the player's position using A* algorithm
  const moveEnemyTowardsPlayer = () => {
    // Define a heuristic function to estimate the cost from a given position to the player's position
    const heuristic = (pos: { x: number; y: number }) => {
      return (
        Math.abs(pos.x - playerPosition.x) + Math.abs(pos.y - playerPosition.y)
      );
    };

    // Initialize lists for open and closed nodes
    const openList: {
      position: { x: number; y: number };
      g: number;
      h: number;
      parent: any;
    }[] = [];
    const closedList: {
      position: { x: number; y: number };
      g: number;
      h: number;
      parent: any;
    }[] = [];

    // Add the enemy's position as the starting node to the open list
    openList.push({
      position: enemyPosition,
      g: 0,
      h: heuristic(enemyPosition),
      parent: null,
    });

    // Define a helper function to check if a position is valid and not in the closed list
    const isValidPosition = (pos: { x: number; y: number }) => {
      return (
        pos.x >= 0 &&
        pos.x < GRID_SIZE &&
        pos.y >= 0 &&
        pos.y < GRID_SIZE &&
        !treePositions.some(
          (position) => position.x === pos.x && position.y === pos.y
        ) &&
        !closedList.some(
          (node) => node.position.x === pos.x && node.position.y === pos.y
        )
      );
    };

    // Define a helper function to find a node with the lowest f value in the open list
    const findLowestFNode = () => {
      let lowestIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (
          openList[i].g + openList[i].h <
          openList[lowestIndex].g + openList[lowestIndex].h
        ) {
          lowestIndex = i;
        }
      }
      return lowestIndex;
    };

    // Start A* algorithm
    while (openList.length > 0) {
      // Find the node with the lowest f value in the open list
      const currentIndex = findLowestFNode();
      const currentNode = openList[currentIndex];

      // Move the current node from the open list to the closed list
      openList.splice(currentIndex, 1);
      closedList.push(currentNode);

      // Check if the current node is the player's position
      if (
        currentNode.position.x === playerPosition.x &&
        currentNode.position.y === playerPosition.y
      ) {
        // Reconstruct the path from the player to the enemy
        const path: { x: number; y: number }[] = [];
        let current = currentNode;
        while (current.parent) {
          path.unshift(current.position);
          current = current.parent;
        }
        // Move the enemy along the path
        if (path.length > 1) {
          const nextPosition = path[1];
          setEnemyPosition(nextPosition);
          return;
        }
        // If the enemy is already at the player's position, no need to move
        setPlayerCanMove(false);
        return;
      }

      // Generate adjacent positions to the current node
      const adjacentPositions = [
        { x: currentNode.position.x + 1, y: currentNode.position.y },
        { x: currentNode.position.x - 1, y: currentNode.position.y },
        { x: currentNode.position.x, y: currentNode.position.y + 1 },
        { x: currentNode.position.x, y: currentNode.position.y - 1 },
      ];

      // Check each adjacent position
      adjacentPositions.forEach((adjacentPos) => {
        // Check if the position is valid
        if (isValidPosition(adjacentPos)) {
          // Calculate the tentative g value for the adjacent position
          const tentativeG = currentNode.g + 1;

          // Check if the adjacent position is already in the open list
          const existingOpenNode = openList.find(
            (node) =>
              node.position.x === adjacentPos.x &&
              node.position.y === adjacentPos.y
          );

          if (existingOpenNode) {
            // If the adjacent position is already in the open list and the tentative g value is lower, update its g value and parent
            if (tentativeG < existingOpenNode.g) {
              existingOpenNode.g = tentativeG;
              existingOpenNode.parent = currentNode;
            }
          } else {
            // If the adjacent position is not in the open list, add it with the tentative g and h values and set the current node as its parent
            openList.push({
              position: adjacentPos,
              g: tentativeG,
              h: heuristic(adjacentPos),
              parent: currentNode,
            });
          }
        }
      });
    }
  };

  // useEffect for handling player movement and adding event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playerPosition]);

  // useEffect for generating random trees, player, and enemy
  useEffect(() => {
    generateRandomTrees();
    setTimeout(() => {
      // Spawn player on the first cell (0, 0)
      let newPlayerPosition = { x: 0, y: 0 };
      setPlayerPosition(newPlayerPosition);
      // Spawn enemy in the middle of the board
      const middlePosition = Math.floor(GRID_SIZE / 2);
      let newEnemyPosition = { x: middlePosition, y: middlePosition };
      setEnemyPosition(newEnemyPosition);
      // Spawn granny's house at the bottom right corner
      let newGrannyHousePosition = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };
      setGrannyHousePosition(newGrannyHousePosition);
    }, 10);
  }, []); // Empty dependency array to run once on component mount

  // useEffect for moving the enemy every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      moveEnemyTowardsPlayer(); // Move enemy towards player
    }, 1000);
    return () => clearInterval(intervalId);
  }, [enemyPosition, enemyMoving]); // Re-run effect when enemy position or movement changes

  return (
    <div className="App">
      <ForestGrid
        gridSize={GRID_SIZE}
        playerPosition={playerPosition}
        enemyPosition={enemyPosition}
        grannyHousePosition={grannyHousePosition}
        treePositions={treePositions}
        playerDirection={playerDirection}
        enemyDirection={enemyDirection}
        isPlayerEnemyOverlap={
          playerPosition.x === enemyPosition.x &&
          playerPosition.y === enemyPosition.y
        }
      />
    </div>
  );
};

export default App;
