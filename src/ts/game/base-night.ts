import { GameContext } from "./data/context";
import { GameTools } from "./data/tools";

export type NightFlavour = {
  night?: () => string;
};

export function baseNight(flavour: NightFlavour) {
  return async (context: GameContext, tools: GameTools) => {
    const getNightMessage = flavour.night || (() => `The night falls...`);
    await context.sendMessage(getNightMessage());
  };
}
