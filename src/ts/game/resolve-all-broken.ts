import { GameContext } from "./data/context";
import { BROKEN_NIGHT, BROKEN } from "./data/player-states";
import { GameTools } from "./data/tools";

export async function resolveAllBroken(
    context: GameContext,
    internalsTools: GameTools,
) {
    const brokenPlayers = context.players.filter(p => p.attributes.some(a => a === BROKEN_NIGHT));
    for (const player of brokenPlayers) {
        player.attributes = player.attributes.filter(a => a !== BROKEN_NIGHT);
        player.attributes.push(BROKEN);
        await context.sendMessage(`<@${player.id}> has been broken tonight. They were a ${player.roles.join(", ")}`);
    }
}
