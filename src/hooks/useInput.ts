import { useEffect, useRef, useCallback } from "react";
import { Direction } from "../types";
import { useDebounce } from "./useDebounce";
import { PLAYER_DELAY } from "../constants/gameConfig";

// handles keyboard input (arrow keys + WASD) for player movement
export const useKeyboardInput = (
  onMove: (direction: Direction) => void,
  enabled: boolean = true
) => {
  const debouncedMove = useDebounce(onMove, PLAYER_DELAY);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      let direction: Direction | null = null;

      const key = event.key.toLowerCase();
      const code = event.code;

      if (event.key === "ArrowUp" || code === "ArrowUp") {
        direction = "up";
      } else if (event.key === "ArrowDown" || code === "ArrowDown") {
        direction = "down";
      } else if (event.key === "ArrowLeft" || code === "ArrowLeft") {
        direction = "left";
      } else if (event.key === "ArrowRight" || code === "ArrowRight") {
        direction = "right";
      }
      // handle WASD keys (case-insensitive)
      else if (key === "w" || code === "KeyW") {
        direction = "up";
      } else if (key === "s" || code === "KeyS") {
        direction = "down";
      } else if (key === "a" || code === "KeyA") {
        direction = "left";
      } else if (key === "d" || code === "KeyD") {
        direction = "right";
      } else {
        return;
      }

      if (direction) {
        event.preventDefault();
        debouncedMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [debouncedMove, enabled]);
};

// handles touch/swipe gestures for mobile devices
export const useSwipeInput = (
  onMove: (direction: Direction) => void,
  enabled: boolean = true
) => {
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (event.touches.length === 1) {
        event.preventDefault(); // prevents pull-to-refresh and browser navigation
        touchStartPos.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled || !touchStartPos.current) return;
      event.preventDefault(); // prevents page scrolling during swipes
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled || !touchStartPos.current || event.changedTouches.length !== 1) {
        return;
      }

      event.preventDefault();

      const touchEndPos = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
      };

      const deltaX = touchEndPos.x - touchStartPos.current.x;
      const deltaY = touchEndPos.y - touchStartPos.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      const minSwipeDistance = 10;

      if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
        touchStartPos.current = null;
        return;
      }

      let direction: Direction;

      // determine swipe direction based on which axis had more movement
      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      onMove(direction);
      touchStartPos.current = null;
    },
    [enabled, onMove]
  );

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

