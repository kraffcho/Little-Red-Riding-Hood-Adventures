import React from "react";
import { NUM_FLOWERS } from "../../constants/gameConfig";

interface QuestInfoProps {
  collectedFlowers: number;
  isHouseOpen: boolean;
}

const QuestInfo: React.FC<QuestInfoProps> = ({ collectedFlowers, isHouseOpen }) => {
  const allFlowersCollected = collectedFlowers === NUM_FLOWERS;

  const questMessage = allFlowersCollected
    ? "🎉 <b>Well done, RedHood!</b><br />The Flower Quest is complete! Granny's house doors swing open for you.<br /><br /><b>🏡 Quest updated:</b><br />Make your way to Granny's house to complete the level."
    : `👋 <b>RedHood</b>, you have a new mission! Collect all the flowers scattered throughout the forest to complete your quest.`;

  return (
    <div className="quest-info">
      <div className="quest-info-content">
        <p
          className="quest-info-message"
          dangerouslySetInnerHTML={{ __html: questMessage }}
        />
      </div>
    </div>
  );
};

export default QuestInfo;

