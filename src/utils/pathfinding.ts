import { Position, AStarNode } from "../types/game";
import { isValidPosition, getAdjacentPositions, manhattanDistance } from "./gridUtils";
import { GRID_SIZE } from "../constants/gameConfig";

/**
 * A* pathfinding algorithm to find the shortest path from start to goal
 * returns the next position to move to, or null if no path exists
 */
export const findPath = (
  start: Position,
  goal: Position,
  treePositions: Position[],
  gridSize: number = GRID_SIZE
): Position | null => {
  const openList: AStarNode[] = [];
  const closedList: AStarNode[] = [];

  // helper function to check if a position is in the closed list
  const isInClosedList = (position: Position): boolean => {
    return closedList.some(
      (node) => node.position.x === position.x && node.position.y === position.y
    );
  };

  // helper function to find the node with the lowest f value (g + h)
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

  // start with the initial position
  openList.push({
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    parent: null,
  });

  while (openList.length > 0) {
    // get the node with the lowest f value
    const currentIndex = findLowestFNode();
    const currentNode = openList[currentIndex];

    // move this node to the closed list
    openList.splice(currentIndex, 1);
    closedList.push(currentNode);

    // check if we reached the goal
    if (currentNode.position.x === goal.x && currentNode.position.y === goal.y) {
      // reconstruct the path to get the first step
      const path: Position[] = [];
      let current: AStarNode | null = currentNode;

      while (current && current.parent) {
        path.unshift(current.position);
        current = current.parent;
      }

      // return the first position to move to (or null if already at goal)
      return path.length > 0 ? path[0] : null;
    }

    // check all positions next to this one
    const adjacentPositions = getAdjacentPositions(currentNode.position);

    for (const adjacentPos of adjacentPositions) {
      // skip if invalid or already checked
      if (
        !isValidPosition(adjacentPos, treePositions, gridSize) ||
        isInClosedList(adjacentPos)
      ) {
        continue;
      }

      const tentativeG = currentNode.g + 1;

      // check if we've already seen this position
      const existingNodeIndex = openList.findIndex(
        (node) =>
          node.position.x === adjacentPos.x &&
          node.position.y === adjacentPos.y
      );

      if (existingNodeIndex !== -1) {
        // if we found a better path, update it
        const existingNode = openList[existingNodeIndex];
        if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.parent = currentNode;
        }
      } else {
        // add this new position to explore
        openList.push({
          position: adjacentPos,
          g: tentativeG,
          h: manhattanDistance(adjacentPos, goal),
          parent: currentNode,
        });
      }
    }
  }

  // couldn't find a path
  return null;
};

/**
 * checks if a path exists from start to goal (just returns true/false, doesn't find the actual path)
 * faster than findPath when you only need to know if a path exists
 */
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

  // helper to turn a position into a string key
  const posKey = (pos: Position) => `${pos.x},${pos.y}`;

  openList.push({
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    parent: null,
  });

  while (openList.length > 0) {
    // find the node with the lowest f value
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

    // check if we reached the goal
    if (currentNode.position.x === goal.x && currentNode.position.y === goal.y) {
      return true;
    }

    // check all positions next to this one
    const adjacentPositions = getAdjacentPositions(currentNode.position);

    for (const adjacentPos of adjacentPositions) {
      const adjKey = posKey(adjacentPos);

      // skip if invalid, already visited, or already queued
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

/**
 * finds all positions we can reach from the starting position
 * uses a flood fill to explore everything we can get to
 */
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
