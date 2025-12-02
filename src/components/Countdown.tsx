import React, { useEffect, useState, useRef } from 'react';

interface CountdownProps {
  onComplete: () => void;
  isGameInitialized: boolean;
  currentLevel: number;
}

const Countdown: React.FC<CountdownProps> = ({ onComplete, isGameInitialized, currentLevel }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // reset when game is not initialized (game restart or level change)
    if (!isGameInitialized) {
      hasStartedRef.current = false;
      setCountdown(null);
      return;
    }

    // start countdown when game is initialized
    if (isGameInitialized && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setCountdown(3);
    }
  }, [isGameInitialized]);

  useEffect(() => {
    if (countdown === null || countdown < 0) {
      return;
    }

    if (countdown === 0) {
      // show "GO!" for a moment, then complete
      const goTimer = setTimeout(() => {
        setCountdown(-1); // mark as complete
        onComplete();
      }, 800);
      return () => clearTimeout(goTimer);
    }

    // decrement countdown every second
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  // don't render if countdown hasn't started or is finished
  if (countdown === null || countdown < 0) {
    return null;
  }

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        <div className="countdown-level-badge">LEVEL {currentLevel}</div>
        <div className="countdown-message">GET READY!</div>
        <div className={`countdown-number ${countdown === 0 ? 'countdown-go' : ''}`}>
          {countdown > 0 ? countdown : "GO!"}
        </div>
      </div>
    </div>
  );
};

export default Countdown;

