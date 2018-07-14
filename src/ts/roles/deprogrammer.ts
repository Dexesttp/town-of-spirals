import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { TimerPromise } from "../utils/timer";
import { GameTools } from "../game/data/tools";
import { BROKEN_NIGHT } from "../game/data/player-states";
import { callUntilResolved } from "../utils/promise-until-resolved";

export const DEPROGRAMMER_ROLE = "deprogrammer";
export const DEPROGRAMMER_HAS_SAVED_ATTRIBUTE = "has_saved";
export const DEPROGRAMMER_SAVED_ATTRIBUTE = "saved";
export const DEPROGRAMMER_HAS_BROKEN_ATTRIBUTE = "has_broken";

type DeprogrammingCommandResult = {
    command: "timeout",
} | {
    playerID: string,
    command: "skip",
} | {
    playerID: string,
    targetID: string | null | undefined,
    command: "break",
} | {
    playerID: string,
    targetID: string | null | undefined,
    command: "save",
};

export async function handleDeprogrammer(
    context: GameContext,
    tools: GameTools,
    timeout = 120000,
) {
    const deprogrammers = GetAlivePlayers(context).filter(p => p.roles.some(r => r === DEPROGRAMMER_ROLE));
    const results: { [id: string]: DeprogrammingCommandResult } = {};
    for (const deprogrammer of deprogrammers) {
        const promises: Array<Promise<DeprogrammingCommandResult>> = [];
        const deprogrammerInterface = context.playerInterface[deprogrammer.id];

        //#region Timeout
        const timeoutPromise = TimerPromise(timeout).then<DeprogrammingCommandResult>(r => ({ command: "timeout" }));
        promises.push(timeoutPromise);
        //#endregion

        //#region Break
        const canBreak = !deprogrammer.attributes.some(a => a === DEPROGRAMMER_HAS_BROKEN_ATTRIBUTE);
        if (canBreak) {
            const targets = GetAlivePlayers(context).filter(p => !p.attributes.some(a => a === ""));
            const breakPromise = callUntilResolved(() =>
                tools.getTargettingCommandPromise("break", [deprogrammer], targets, true)
                    .then<DeprogrammingCommandResult>(r => ({ command: "break", ...r})),
            );
            promises.push(breakPromise);
            // TODO add flavour
            deprogrammerInterface.sendMessage(`
            You can break somebody with \`!s break\` if you want :
            ${targets.map((t, i) => `[${i}] ${t.nickname} (${t.username})`)}
            `);
        }
        //#endregion

        //#region Save
        const canSave = !deprogrammer.attributes.some(a => a === DEPROGRAMMER_HAS_SAVED_ATTRIBUTE);
        const recentlyBrokenPlayers = GetAlivePlayers(context).filter(p => p.attributes.some(a => a === BROKEN_NIGHT));
        if (canSave && recentlyBrokenPlayers.length) {
            const savePromise = callUntilResolved(() =>
                tools.getTargettingCommandPromise("save", [deprogrammer], recentlyBrokenPlayers, true)
                .then<DeprogrammingCommandResult>(r => ({ command: "save", ...r })),
            );
            promises.push(savePromise);
            // TODO add flavour
            deprogrammerInterface.sendMessage(`
You can save people somebody with \`!s save\` if you want :
${recentlyBrokenPlayers.map((t, i) => `[${i}] ${t.nickname} (${t.username})`)}
            `);
        }
        //#endregion

        //#region Skip
        const skipPromise = callUntilResolved(() =>
            tools.getCommandPromise("skip", [deprogrammer], true)
                .then<DeprogrammingCommandResult>(r => ({ command: "skip", playerID: r.playerID })),
        );
        promises.push(skipPromise);
        // TODO add flavour
        deprogrammerInterface.sendMessage(`You can skip tonight's vote with \`!s skip\`.`);
        //#endregion

        const result = await Promise.race(promises);
        tools.cleanSubscribedCommands();
        tools.cleanSubscribedTargettingCommands();

        results[deprogrammer.id] = result;

        if (result.command === "break") {
            const target = context.players.filter(p => p.id === result.targetID)[0];
            target.attributes.push(BROKEN_NIGHT);
            deprogrammer.attributes.push(DEPROGRAMMER_HAS_BROKEN_ATTRIBUTE);
            // TODO add flavour
            deprogrammerInterface.sendMessage(`You broke ${target.nickname}.`);
            continue;
        }
        if (result.command === "save") {
            const target = context.players.filter(p => p.id === result.targetID)[0];
            target.attributes = target.attributes.filter(a => a !== BROKEN_NIGHT);
            target.attributes.push(DEPROGRAMMER_SAVED_ATTRIBUTE);
            deprogrammer.attributes.push(DEPROGRAMMER_HAS_SAVED_ATTRIBUTE);
            // TODO add flavour
            deprogrammerInterface.sendMessage(`You saved somebody.`);
            continue;
        }
        if (result.command === "skip") {
            // TODO add flavour
            deprogrammerInterface.sendMessage(`You didn't do anything.`);
            continue;
        }
        // TODO add flavour
        deprogrammerInterface.sendMessage(`Time ran out and you didn't have time to do anything.`);
        continue;
    }
    return results;
}
