import { GameContext } from "./data/context";
import { PlayerData } from "./data/player";
import { GameTools } from "./data/tools";
import { GetAlivePlayers } from "./utils/alive-players";

export type EndingFlavourVictory = (count: number)
    => (playerList: PlayerData[], allPlayerList: PlayerData[], hypnotistList: PlayerData[])
        => string;
export type EndingFlavour = {
    hypnotists?: EndingFlavourVictory,
    town?: EndingFlavourVictory,
    nobody?: (allPlayerList: PlayerData[], hypnotistList: PlayerData[]) => string,
};

export function baseCheckEnd(
    flavour: EndingFlavour,
) {
    return async (
        context: GameContext,
        tools: GameTools,
    ) => {
        const alivePlayers = GetAlivePlayers(context);
        const tistCount = alivePlayers.filter(p => p.roles.some(r => r === "hypnotist")).length;
        const hypnotists = context.players.filter(p => p.roles.some(r => r === "hypnotist"));
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
