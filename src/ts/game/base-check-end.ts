import { GameContext } from "./data/context";
import { GetAlivePlayers } from "./utils/alive-players";

export async function baseCheckEnd(context: GameContext) {
    const alivePlayers = GetAlivePlayers(context);
    const tistCount = alivePlayers.filter(p => p.roles.some(r => r === "hypnotist")).length;
    if (tistCount === 0) {
        // TODO add flavour
        context.sendMessage("Townspeople won !");
        return true;
    }
    if (tistCount === alivePlayers.length) {
        // TODO add flavour
        context.sendMessage("Hypnotists won !");
        return true;
    }
    return false;
}
