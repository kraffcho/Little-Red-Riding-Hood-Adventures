import { NUM_FLOWERS } from "../constants/gameConfig";

export interface QuestMessage {
  message: string;
  showTooltip: boolean;
}

export type QuestMilestone = "start" | "halfway" | "all_collected" | "entered_house";

/**
 * generate funny quest messages from granny based on the current quest state
 * only shows tooltip at specific milestones: start, halfway, all collected
 */
export function getGrannyQuestMessage(
  collectedFlowers: number,
  isHouseOpen: boolean,
  playerEnteredHouse: boolean,
  currentMilestone: QuestMilestone | null
): QuestMessage {
  const allFlowersCollected = collectedFlowers === NUM_FLOWERS;
  const halfwayPoint = Math.ceil(NUM_FLOWERS / 2);

  // when player enters the house, always show welcome message
  // this takes priority over other milestones
  if (playerEnteredHouse && currentMilestone === "entered_house") {
    return {
      message: "Oh my dear! 🧓 You made it safely!",
      showTooltip: true,
    };
  }

  // when all flowers collected but house not entered yet
  // Note: we check allFlowersCollected rather than isHouseOpen since house opens when all flowers are collected
  if (allFlowersCollected && !playerEnteredHouse && currentMilestone === "all_collected") {
    return {
      message: "Perfect! 🌸 Hurry here!",
      showTooltip: true,
    };
  }

  // halfway milestone
  if (collectedFlowers >= halfwayPoint && collectedFlowers < NUM_FLOWERS && currentMilestone === "halfway") {
    return {
      message: `Halfway there! 🌺`,
      showTooltip: true,
    };
  }

  // start of game - instruction message
  if (collectedFlowers === 0 && currentMilestone === "start") {
    return {
      message: `My sweet RedHood! 💐 Gather ${NUM_FLOWERS} flowers for me.`,
      showTooltip: true,
    };
  }

  // default - no tooltip shown (empty message)
  return {
    message: "",
    showTooltip: false,
  };
}

