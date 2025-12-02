import { getLevelConfig } from "../constants/levelConfig";

export interface QuestMessage {
  message: string;
  showTooltip: boolean;
}

export type QuestMilestone = "start" | "halfway" | "all_collected" | "entered_house";

// generates granny's quest messages based on player progress
export function getGrannyQuestMessage(
  collectedFlowers: number,
  isHouseOpen: boolean,
  playerEnteredHouse: boolean,
  currentMilestone: QuestMilestone | null,
  currentLevel: number = 1
): QuestMessage {
  const levelConfig = getLevelConfig(currentLevel);
  const numFlowers = levelConfig.numFlowers;
  const allFlowersCollected = collectedFlowers === numFlowers;
  const halfwayPoint = Math.ceil(numFlowers / 2);

  if (playerEnteredHouse && currentMilestone === "entered_house") {
    return {
      message: "Oh my dear! 🧓 You made it safely!",
      showTooltip: true,
    };
  }

  if (allFlowersCollected && !playerEnteredHouse && currentMilestone === "all_collected") {
    return {
      message: "Perfect! 🌸 Hurry here!",
      showTooltip: true,
    };
  }

  if (collectedFlowers >= halfwayPoint && collectedFlowers < numFlowers && currentMilestone === "halfway") {
    return {
      message: `Halfway there! 🌺`,
      showTooltip: true,
    };
  }

  if (collectedFlowers === 0 && currentMilestone === "start") {
    return {
      message: `My sweet RedHood! 💐 Gather ${numFlowers} flowers for me.`,
      showTooltip: true,
    };
  }

  return {
    message: "",
    showTooltip: false,
  };
}

