import { PlayerData } from "./data/player";
import { GameTools } from "./data/tools";
import { GameContext } from "./data/context";

export type NotifyFlavour = {
    roles?: { [role: string]: (player: PlayerData, roleList: string[]) => string},
    none?: (player: PlayerData) => string,
    unknown?: (player: PlayerData, roleList: string[]) => string,
    start?: (playerList: PlayerData[], hypnotistCount: number) => string,
};

export function baseNotifyRoles(
    flavour: NotifyFlavour,
) {
    return (context: GameContext, tools: GameTools) => Promise.all(context.players.map(p => {
        if (p.roles.length === 0) {
            const getNoneMessage = flavour.none
                || ((playerInt: PlayerData) =>
                    `A new game has started ! You are a normal bystander.`
                );
            return context.playerInterface[p.id].sendMessage(getNoneMessage(p));
        }
        const getMessage = (flavour.roles ? flavour.roles[p.roles.join("_")] : undefined)
            || (flavour.unknown)
            || ((playerInt: PlayerData, roleListInt: string[]) =>
                `A new game has started ! You are a ${p.roles.join(", ")}.`
            );
        return context.playerInterface[p.id].sendMessage(getMessage(p, p.roles));
    })).then(_ => {
        const getStartMessage = flavour.start || (
            (playerList: PlayerData[], hypnotistCount: number) => `Game started ! There is ${hypnotistCount} hypnotists`
        );
        return context.sendMessage(getStartMessage(
            context.players,
            context.players.filter(p => p.roles.some(r => r === "hypnotist")).length,
        ));
    }).then(_ => { /* NO OP */ });
}
