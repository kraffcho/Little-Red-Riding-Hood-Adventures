import { Position, AStarNode } from "../types";
import { isValidPosition, getAdjacentPositions, manhattanDistance } from "./gridUtils";
import { GRID_SIZE } from "../constants/gameConfig";

// A* pathfinding algorithm - finds the shortest path avoiding obstacles
export const findPath = (
  start: Position,
  goal: Position,
  treePositions: Position[],
  gridSize: number = GRID_SIZE
): Position | null => {
  const openList: AStarNode[] = [];
  const closedList: AStarNode[] = [];

  const isInClosedList = (position: Position): boolean => {
    return closedList.some(
      (node) => node.position.x === position.x && node.position.y === position.y
    );
  };

  const findLowestFNode = (): number => {
    let lowestIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      const currentF = openList[i].g + openList[i].h;
      const lowestF = openList[lowestIndex].g + openList[lowestIndex].h;
      if (currentF < lowestF) {
        lowestIndex = i;
      }
    }
    return lowestIndex;
  };

  openList.push({
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    parent: null,
  });

  while (openList.length > 0) {
    const currentIndex = findLowestFNode();
    const currentNode = openList[currentIndex];

    openList.splice(currentIndex, 1);
    closedList.push(currentNode);

    if (currentNode.position.x === goal.x && currentNode.position.y === goal.y) {
      const path: Position[] = [];
      let current: AStarNode | null = currentNode;

      while (current && current.parent) {
        path.unshift(current.position);
        current = current.parent;
      }

      return path.length > 0 ? path[0] : null;
    }

    const adjacentPositions = getAdjacentPositions(currentNode.position);

    for (const adjacentPos of adjacentPositions) {
      if (
        !isValidPosition(adjacentPos, treePositions, gridSize) ||
        isInClosedList(adjacentPos)
      ) {
        continue;
      }

      const tentativeG = currentNode.g + 1;

      const existingNodeIndex = openList.findIndex(
        (node) =>
          node.position.x === adjacentPos.x &&
          node.position.y === adjacentPos.y
      );

      if (existingNodeIndex !== -1) {
        const existingNode = openList[existingNodeIndex];
        if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.parent = currentNode;
        }
      } else {
        openList.push({
          position: adjacentPos,
          g: tentativeG,
          h: manhattanDistance(adjacentPos, goal),
          parent: currentNode,
        });
      }
    }
  }

  return null;
};

// faster path existence check - returns true/false without finding actual path
export const pathExists = (
  start: Position,
  goal: Position,
  treePositions: Position[],
  gridSize: number = GRID_SIZE
): boolean => {
  if (start.x === goal.x && start.y === goal.y) {
    return true;
  }

  const openList: AStarNode[] = [];
  const closedSet = new Set<string>();

  const posKey = (pos: Position) => `${pos.x},${pos.y}`;

  openList.push({
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    parent: null,
  });

  while (openList.length > 0) {
    let lowestIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      const currentF = openList[i].g + openList[i].h;
      const lowestF = openList[lowestIndex].g + openList[lowestIndex].h;
      if (currentF < lowestF) {
        lowestIndex = i;
      }
    }

    const currentNode = openList[lowestIndex];
    openList.splice(lowestIndex, 1);
    closedSet.add(posKey(currentNode.position));

    if (currentNode.position.x === goal.x && currentNode.position.y === goal.y) {
      return true;
    }

    const adjacentPositions = getAdjacentPositions(currentNode.position);

    for (const adjacentPos of adjacentPositions) {
      const adjKey = posKey(adjacentPos);

      if (
        !isValidPosition(adjacentPos, treePositions, gridSize) ||
        closedSet.has(adjKey) ||
        openList.some(node => posKey(node.position) === adjKey)
      ) {
        continue;
      }

      openList.push({
        position: adjacentPos,
        g: currentNode.g + 1,
        h: manhattanDistance(adjacentPos, goal),
        parent: currentNode,
      });
    }
  }

  return false;
};

// flood fill algorithm to find all reachable positions from start
export const findAllReachablePositions = (
  start: Position,
  treePositions: Position[],
  gridSize: number = GRID_SIZE
): Set<string> => {
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const queue: Position[] = [start];

  const posKey = (pos: Position) => `${pos.x},${pos.y}`;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = posKey(current);

    if (visited.has(key)) continue;
    visited.add(key);
    reachable.add(key);

    const adjacentPositions = getAdjacentPositions(current);
    for (const adjacentPos of adjacentPositions) {
      const adjKey = posKey(adjacentPos);
      if (
        isValidPosition(adjacentPos, treePositions, gridSize) &&
        !visited.has(adjKey) &&
        !queue.some(pos => posKey(pos) === adjKey)
      ) {
        queue.push(adjacentPos);
      }
    }
  }

  return reachable;
};
