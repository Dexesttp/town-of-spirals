import { GameContext } from "./data/context";
import { BROKEN_NIGHT, BROKEN } from "./data/player-states";
import { GameTools } from "./data/tools";
import { PlayerData } from "./data/player";
import { GetAlivePlayers } from "./utils/alive-players";
import getRandom from "../utils/rand-from-array";

export type ResolveBrokenFlavour = {
    intro?: () => string,
    roles?: { [role: string]: (target: PlayerData, roleList: string[]) => string },
    none?: (target: PlayerData) => string,
    unknown?: (target: PlayerData, roleList: string[]) => string,
    broken?: (target: PlayerData, owner: PlayerData) => string,
    noBroken?: () => string,
};

export function baseResolveAllBroken(
    flavour: ResolveBrokenFlavour,
) {
    return async (
        context: GameContext,
        internalsTools: GameTools,
    ) => {
        const getIntro = flavour.intro || (() => `A new day rises on the town of spirals.`);
        await context.sendMessage(getIntro());

        const brokenPlayers = context.players.filter(p => p.attributes.some(a => a === BROKEN_NIGHT));
        if (brokenPlayers.length === 0) {
            const getNoBroken = flavour.noBroken || (() => `Nobody got broken tonight.`);
            await context.sendMessage(getNoBroken());
            return;
        }
        const potentialOwners = GetAlivePlayers(context).filter(p => !p.attributes.some(a => a === BROKEN_NIGHT));
        // Night result
        for (const player of brokenPlayers) {
            player.attributes = player.attributes.filter(a => a !== BROKEN_NIGHT);
            player.attributes.push(BROKEN);
            const getBroken = flavour.broken
                || ((target: PlayerData, ownerInt: PlayerData) => `${player.nickname} has been broken tonight.`);
            const owner = getRandom(potentialOwners, 1)[0];
            await context.sendMessage(getBroken(player, owner));

            // Reveals
            if (player.roles.length === 0) {
                const getNoneRole = flavour.none
                    || ((target: PlayerData) => `<@${target.id}> was a normal citizen`);
                await context.sendMessage(getNoneRole(player));
                continue;
            }
            const getRole = (flavour.roles ? flavour.roles[player.roles.join("_")] : undefined)
                || flavour.unknown
                || ((target: PlayerData, roleList: string[]) => `<@${target.id}> was a ${roleList.join(", ")}`);
            await context.sendMessage(getRole(player, player.roles));
        }
    };
}
