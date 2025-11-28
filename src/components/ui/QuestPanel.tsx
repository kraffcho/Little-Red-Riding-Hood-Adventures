import React from "react";
import { NUM_FLOWERS } from "../../constants/gameConfig";

interface QuestPanelProps {
  isVisible: boolean;
  collectedFlowers: number;
  onToggle: () => void;
}

const QuestPanel: React.FC<QuestPanelProps> = ({
  isVisible,
  collectedFlowers,
  onToggle,
}) => {
  const allFlowersCollected = collectedFlowers === NUM_FLOWERS;

  const questMessage = allFlowersCollected
    ? "🎉 <b>Well done, RedHood!</b><br />The Flower Quest is complete! Granny's house doors swing open for you.<br /><br /><b>🏡 Quest updated:</b><br />Make your way to Granny's house to complete the level."
    : `👋 <b>RedHood</b>, you have a new mission! Collect all the flowers scattered throughout the forest to complete your quest.<br /><br />💐 <b>Collected Flowers:</b> ${collectedFlowers}/${NUM_FLOWERS}`;

  return (
    <div className={`quest-panel ${isVisible ? "visible" : "hidden"}`}>
      <button onClick={onToggle}>{isVisible ? "🙉" : "🙈"}</button>
      <p
        className="quest-wrapper"
        dangerouslySetInnerHTML={{ __html: questMessage }}
      />
    </div>
  );
};

export default QuestPanel;

