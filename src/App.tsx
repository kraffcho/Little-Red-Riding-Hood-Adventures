import React, { useState, useEffect } from "react";
import { useRef } from "react";
import "./styles.css";
import ForestGrid from "./ForestGrid";

const GRID_SIZE = 20; // Assuming a 20x20 grid
const NUM_TREES = 60; // Number of trees to spawn
const NUM_FLOWERS = 30; // Number of flowers to spawn
const PLAYER_DELAY = 100; // Delay in milliseconds between consecutive player movements
const ENEMY_DELAY = 500; // Delay in milliseconds before enemy AI makes its next move
const BACKGROUND_MUSIC = "../assets/audio/background.mp3"; // Background music file path
const SOUND_COLLECT_ITEM = "../assets/audio/collect-item.mp3"; // Sound effect for collecting an item

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
  const [flowers, setFlowers] = useState<Array<{ x: number; y: number }>>([]);
  const [collectedFlowers, setCollectedFlowers] = useState<number>(0); // Track collected flowers
  const [isPlayingMusic, setIsPlayingMusic] = useState(false); // State for background music playing status
  const [volume, setVolume] = useState(.3); // Default volume level (between 0 and 1)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null); // Ref for background music audio element
  const [flowerCollectSoundBuffer, setFlowerCollectSoundBuffer] = useState<AudioBuffer | null>(null); // State to store the flower collect sound buffer

  useEffect(() => {
    // Initialize background music audio element
    backgroundMusicRef.current = new Audio(BACKGROUND_MUSIC);
    backgroundMusicRef.current.volume = volume;
    backgroundMusicRef.current.loop = true;
  }, []);

  const playBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch((error) => {
        console.error("Failed to play background music:", error);
      });
      setIsPlayingMusic(true);
    }
  };

  useEffect(() => {
    // Load the flower collect sound effect
    const loadFlowerCollectSound = async () => {
      try {
        const response = await fetch(SOUND_COLLECT_ITEM);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.AudioContext)();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          setFlowerCollectSoundBuffer(buffer);
        });
      } catch (error) {
        console.error("Failed to load flower collect sound:", error);
      }
    };

    loadFlowerCollectSound();
  }, []);

  const playFlowerCollectSound = () => {
    if (flowerCollectSoundBuffer) {
      const audioContext = new (window.AudioContext || window.AudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = flowerCollectSoundBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  const handleToggleSound = () => {
    if (isPlayingMusic) {
      stopBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = newVolume;
    }
  };

  // Function to generate random tree positions
  const generateRandomTrees = (): void => {
    const newTreePositions: Array<{ x: number; y: number }> = [];
    const grannyHouseX = GRID_SIZE - 1; // x-coordinate of the granny's house
    const grannyHouseY = GRID_SIZE - 1; // y-coordinate of the granny's house
    const middlePosition = Math.floor(GRID_SIZE / 2);
    let newEnemyPosition = { x: middlePosition, y: middlePosition };
    // Generate trees excluding the enemy's initial position
    for (let i = 0; i < NUM_TREES; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);

      } while (
        (x === newEnemyPosition.x && y === newEnemyPosition.y) || // Exclude the enemy's initial position
        (x === 0 && y === 0) || // Exclude the player's starting position
        (Math.abs(x - grannyHouseX) <= 1 && Math.abs(y - grannyHouseY) <= 1) // Exclude cells closest to the granny's house
      );
      newTreePositions.push({ x, y });
    }
    setTreePositions(newTreePositions);
  };

  // Function to generate random flower positions
  const generateRandomFlowers = (): void => {
    const availablePositions: Array<{ x: number; y: number }> = [];

    // Generate all possible positions for flowers except (0, 0) and the bottom right corner
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const isAdjacent = isAdjacentToTree(i, j);
        const isGrannyHouse = i === GRID_SIZE - 1 && j === GRID_SIZE - 1;
        if (!isAdjacent && !(i === 0 && j === 0) && !isGrannyHouse) {
          availablePositions.push({ x: i, y: j });
        }
      }
    }

    const newFlowerPositions: Array<{ x: number; y: number }> = [];
    const numFlowers = Math.min(NUM_FLOWERS, availablePositions.length);

    // Randomly select positions from available positions
    for (let i = 0; i < numFlowers; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      newFlowerPositions.push(availablePositions[randomIndex]);
      availablePositions.splice(randomIndex, 1);
    }

    setFlowers(newFlowerPositions);
  };

  // Function to check if a position is adjacent to a tree
  const isAdjacentToTree = (x: number, y: number): boolean => {
    return treePositions.some(
      (treePosition) =>
        Math.abs(treePosition.x - x) <= 1 && Math.abs(treePosition.y - y) <= 1
    );
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
      // Check if the new position has a flower
      const isFlower = flowers.find(
        (flower) => flower.x === newPosition.x && flower.y === newPosition.y
      );
      if (isFlower) {
        // Remove the flower from the flowers array
        setFlowers((prevFlowers) =>
          prevFlowers.filter(
            (flower) => !(flower.x === newPosition.x && flower.y === newPosition.y)
          )
        );
        // Increment the collected flowers count
        setCollectedFlowers((prevCount) => prevCount + 1);
        // Play the flower collect sound effect
        playFlowerCollectSound();
      }
      setPlayerPosition(newPosition);
      checkCollision(newPosition);
    }
  };

  // Previous touch position for swipe detection
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Function to handle touch start event
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      touchStartPos.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
  };

  // Function to handle touch end event and detect swipe direction
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartPos.current && event.changedTouches.length === 1) {
      const touchEndPos = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
      };

      const deltaX = touchEndPos.x - touchStartPos.current.x;
      const deltaY = touchEndPos.y - touchStartPos.current.y;

      // Check if swipe is horizontal or vertical and determine the direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          movePlayer("right");
        } else {
          movePlayer("left");
        }
      } else {
        if (deltaY > 0) {
          movePlayer("down");
        } else {
          movePlayer("up");
        }
      }

      touchStartPos.current = null;
    }
  };

  // Debounce function
  const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Specify the correct type

    const debounce = (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    };

    return debounce;
  };

  // Debounced player movement function
  const debouncedMovePlayer = useDebounce(movePlayer, PLAYER_DELAY);

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
        debouncedMovePlayer("up");
        break;
      case "ArrowDown":
        debouncedMovePlayer("down");
        break;
      case "ArrowLeft":
        debouncedMovePlayer("left");
        break;
      case "ArrowRight":
        debouncedMovePlayer("right");
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
          const nextPosition = path[0];
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

  // useEffect to generate flowers whenever tree positions change
  useEffect(() => {
    generateRandomFlowers();
  }, [treePositions]);

  // useEffect for moving the enemy every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      moveEnemyTowardsPlayer(); // Move enemy towards player
    }, ENEMY_DELAY);
    return () => clearInterval(intervalId);
  }, [enemyPosition, enemyMoving]); // Re-run effect when enemy position or movement changes

  return (
    <div className="App" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
        flowers={flowers}
        collectedFlowers={collectedFlowers}
      />
      <div className="collected-flowers">
        <p>Collected Flowers: {collectedFlowers}/{NUM_FLOWERS}</p>
      </div>
      <div className="sound-controls">
        <label htmlFor="volumeSlider">Volume:</label>
        <input
          type="range"
          id="volumeSlider"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
        <button onClick={handleToggleSound}>
          {isPlayingMusic ? "Pause Sound" : "Play Sound"}
        </button>
      </div>
    </div>
  );
};

export default App;
