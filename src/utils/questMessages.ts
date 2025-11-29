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

  // when player enters the house, show welcome message
  if (playerEnteredHouse) {
    return {
      message: "Oh my dear! 🧓 You made it safely!",
      showTooltip: currentMilestone === "entered_house",
    };
  }

  // when all flowers collected but house not entered yet
  if (allFlowersCollected && isHouseOpen) {
    return {
      message: "Perfect! 🌸 Hurry here!",
      showTooltip: currentMilestone === "all_collected",
    };
  }

  // halfway milestone
  if (collectedFlowers >= halfwayPoint && collectedFlowers < NUM_FLOWERS) {
    return {
      message: `Halfway there! 🌺`,
      showTooltip: currentMilestone === "halfway",
    };
  }

  // start of game - instruction message
  if (collectedFlowers === 0) {
    return {
      message: `My sweet RedHood! 💐 Gather ${NUM_FLOWERS} flowers for me.`,
      showTooltip: currentMilestone === "start",
    };
  }

  // default - no tooltip shown
  return {
    message: "",
    showTooltip: false,
  };
}

