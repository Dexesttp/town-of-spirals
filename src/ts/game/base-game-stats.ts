import { GameContext, GameResult } from "./data/context";
import { BROKEN, BROKEN_NIGHT } from "./data/player-states";

export function baseGetStats() {
    return (context: GameContext): GameResult => {
        return context.players.map(p => ({
            id: p.id,
            alive: p.attributes.some(a => a === BROKEN || a === BROKEN_NIGHT),
            role: p.roles.join(", "),
        }));
    };
}
