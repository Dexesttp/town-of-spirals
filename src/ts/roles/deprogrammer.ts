import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { TimerPromise } from "../utils/timer";
import { TargettingPromiseGetter } from "../game/targetCommand/types";
import { CommandPromiseGetter } from "../game/command/types";
import { PlayerInterface } from "../game/data/player";
import { GameTools } from "../game/data/tools";
import { BROKEN_NIGHT } from "../game/data/player-states";

export const DEPROGRAMMER_ROLE = "deprogrammer";

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
) {
    const deprogrammers = GetAlivePlayers(context).filter(p => p.roles.some(r => r === DEPROGRAMMER_ROLE));
    for (const deprogrammer of deprogrammers) {
        const promises: Array<Promise<DeprogrammingCommandResult>> = [];
        const deprogrammerInterface = context.playerInterface[deprogrammer.id];

        const timeoutPromise = TimerPromise(120000).then<DeprogrammingCommandResult>(r => ({ command: "timeout" }));
        promises.push(timeoutPromise);

        const canBreak = !deprogrammer.attributes.some(a => a === "has_broken");
        if (canBreak) {
            const targets = GetAlivePlayers(context).filter(p => !p.attributes.some(a => a === ""));
            const breakPromise = tools.getTargettingCommandPromise("break", [deprogrammer], targets, true)
                .then<DeprogrammingCommandResult>(r => ({ command: "break", ...r}));
            promises.push(breakPromise);
            // TODO add flavour
            deprogrammerInterface.sendMessage(`
You can break somebody with \`!s break\` if you want :
${targets.map((t, i) => `[${i}] ${t.nickname} (${t.username})}`)}
            `);
        }

        const canSave = !deprogrammer.attributes.some(a => a === "has_saved");
        const recentlyBrokenPlayers = GetAlivePlayers(context).filter(p => p.attributes.some(a => a === BROKEN_NIGHT));
        if (canSave && recentlyBrokenPlayers.length) {
            const savePromise = tools.getTargettingCommandPromise("save", [deprogrammer], recentlyBrokenPlayers, true)
                .then<DeprogrammingCommandResult>(r => ({ command: "save", ...r }));
            promises.push(savePromise);
            // TODO add flavour
            deprogrammerInterface.sendMessage(`
You can save people somebody with \`!s save\` if you want :
${recentlyBrokenPlayers.map((t, i) => `[${i}] ${t.nickname} (${t.username})}`)}
            `);
        }


        const skipPromise = tools.getCommandPromise("skip", [deprogrammer], true)
            .then<DeprogrammingCommandResult>(r => ({ command: "skip", playerID: r.playerID }));
        promises.push(skipPromise);
        // TODO add flavour
        deprogrammerInterface.sendMessage(`You can skip tonight's vote with \`!s skip\`.`);

        const result = await Promise.race(promises);
        tools.cleanSubscribedCommands();
        tools.cleanSubscribedTargettingCommands();
        if (result.command === "break") {
            const target = context.players.filter(p => p.id === result.targetID)[0];
            target.attributes.push(BROKEN_NIGHT);
            deprogrammer.attributes.push("has_broken");
            // TODO add flavour
            deprogrammerInterface.sendMessage(`You broke ${target.nickname}.`);
            continue;
        }
        if (result.command === "save") {
            const target = context.players.filter(p => p.id === result.targetID)[0];
            target.attributes = target.attributes.filter(a => a !== BROKEN_NIGHT);
            deprogrammer.attributes.push("has_saved");
            // TODO add flavour
            deprogrammerInterface.sendMessage(`You saved somebody.`);
            continue;
        }
        deprogrammerInterface.sendMessage(`You didn't do anything.`);
    }
}
