import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { PlayerData } from "../game/data/player";
import { GameTools } from "../game/data/tools";
import { EndingFlavour, EndingFlavourVictory } from "../game/base-check-end";
import { BROKEN_DAY } from "../game/data/player-states";
import { HYPNOTIST_ROLE } from "./hypnotist";

export const JESTER_ROLE = "jester";

export type JesterEndingFlavour = {
    jester?: EndingFlavourVictory,
};

export function checkEndWithJester(
    flavour: EndingFlavour,
    jesterFlavour: JesterEndingFlavour,
) {
    return async (
        context: GameContext,
        tools: GameTools,
    ) => {
        const alivePlayers = GetAlivePlayers(context);
        const tistCount = alivePlayers.filter(p => p.roles.some(r => r === HYPNOTIST_ROLE)).length;
        const hypnotists = context.players.filter(p => p.roles.some(r => r === HYPNOTIST_ROLE));
        const brokenJesterDay = context.players
            .filter(p => p.roles.some(r => r === JESTER_ROLE) && p.attributes.some(a => a === BROKEN_DAY));
        if (brokenJesterDay.length > 0) {
            const getJesterVictory = jesterFlavour.jester
                || ((count: number) =>
                    ((playerList: PlayerData[], allPlayerList: PlayerData[], hypnotistList: PlayerData[]) =>
                        "Jester won !"
                    )
                );
            await context.sendMessage(getJesterVictory(brokenJesterDay.length)(brokenJesterDay, context.players, hypnotists));
            return true;
        }
        if (alivePlayers.length === 0) {
            const getNoVictory = flavour.nobody
                || ((allPlayerList: PlayerData[], hypnotistList: PlayerData[]) => "Nobody won !");
            await context.sendMessage(getNoVictory(context.players, hypnotists));
            return true;
        }
        if (tistCount === 0) {
            const getTownVictory = flavour.town
                || ((count: number) =>
                    ((playerList: PlayerData[], allPlayerList: PlayerData[], hypnotistList: PlayerData[]) =>
                        "Townspeople won !"
                    )
                );
            await context.sendMessage(getTownVictory(alivePlayers.length)(alivePlayers, context.players, hypnotists));
            return true;
        }
        if (tistCount === alivePlayers.length) {
            const getHypnotistsVictory = flavour.hypnotists
                || ((count: number) =>
                    ((playerList: PlayerData[], allPlayerList: PlayerData[], hypnotistList: PlayerData[]) =>
                        "Hypnotists won !"
                    )
                );
            await context.sendMessage(getHypnotistsVictory(alivePlayers.length)(alivePlayers, context.players, hypnotists));
            return true;
        }
        return false;
    };
}
