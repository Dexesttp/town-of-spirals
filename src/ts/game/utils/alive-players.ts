import { GameContext } from "../data/context";
import { PlayerData } from "../data/player";
import { BROKEN } from "../data/player-states";

export function GetAlivePlayers(context: GameContext): PlayerData[] {
  return context.players.filter((p) => !p.attributes.some((a) => a === BROKEN));
}
