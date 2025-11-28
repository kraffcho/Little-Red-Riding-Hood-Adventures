import React from "react";
import { NUM_FLOWERS } from "../../constants/gameConfig";

interface QuestProgressProps {
  collectedFlowers: number;
}

const QuestProgress: React.FC<QuestProgressProps> = ({ collectedFlowers }) => {
  const progress = (collectedFlowers / NUM_FLOWERS) * 100;
  const allFlowersCollected = collectedFlowers === NUM_FLOWERS;

  return (
    <div className="quest-progress">
      <div className="quest-progress-content">
        <div className="quest-progress-text">
          <span className="quest-progress-label">💐 Collected Flowers:</span>
          <span className="quest-progress-count">
            {collectedFlowers}/{NUM_FLOWERS}
          </span>
        </div>
        <div className="quest-progress-bar-container">
          <div
            className={`quest-progress-bar ${allFlowersCollected ? "complete" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestProgress;

