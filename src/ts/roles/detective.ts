import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { TimerPromise } from "../utils/timer";
import { GameTools } from "../game/data/tools";
import { callUntilResolved } from "../utils/promise-until-resolved";

export const DETECTIVE_SPIED_ATTRIBUTE = "spied";

type DetectiveCommandResult = {
    command: "timeout",
} | {
    playerID: string,
    command: "skip",
} | {
    playerID: string,
    targetID: string | null | undefined,
    command: "spy",
};

export const DETECTIVE_ROLE = "detective";

export async function handleDetective(
    context: GameContext,
    tools: GameTools,
    timeout = 120000,
) {
    const detectives = GetAlivePlayers(context).filter(p => p.roles.some(r => r === DETECTIVE_ROLE));
    const results: { [id: string]: DetectiveCommandResult } = {};
    for (const detective of detectives) {
        const promises: Array<Promise<DetectiveCommandResult>> = [];
        const detectiveInterface = context.playerInterface[detective.id];

        //#region Timeout
        const timeoutPromise = TimerPromise(timeout).then<DetectiveCommandResult>(r => ({ command: "timeout" }));
        promises.push(timeoutPromise);
        //#endregion

        //#region Spy
        const targets = GetAlivePlayers(context);
        const spyPromise = callUntilResolved(() =>
            tools.getTargettingCommandPromise("spy", [detective], targets, true)
                .then<DetectiveCommandResult>(r => ({ command: "spy", ...r })),
        );
        promises.push(spyPromise);
        // TODO add flavour
        detectiveInterface.sendMessage(`
You can spy on somebody with \`!s spy\` if you want :
${targets.map((t, i) => `[${i}] ${t.nickname} (${t.username})}`)}
        `);
        //#endregion

        //#region Skip
        const skipPromise = callUntilResolved(() =>
            tools.getCommandPromise("skip", [detective], true)
                .then<DetectiveCommandResult>(r => ({ command: "skip", playerID: r.playerID })),
        );
        promises.push(skipPromise);
        // TODO add flavour
        detectiveInterface.sendMessage(`You can skip tonight's action with \`!s skip\`.`);
        //#endregion

        const result = await Promise.race(promises);
        tools.cleanSubscribedCommands();
        tools.cleanSubscribedTargettingCommands();

        results[detective.id] = result;

        if (result.command === "spy") {
            const target = context.players.filter(p => p.id === result.targetID)[0];
            target.attributes.push(DETECTIVE_SPIED_ATTRIBUTE);
            // TODO add flavour
            detectiveInterface.sendMessage(`You spy on ${target.nickname}. They're a ${target.roles.join(", ")}`);
            continue;
        }
        if (result.command === "skip") {
            // TODO add flavour
            detectiveInterface.sendMessage(`You didn't do anything.`);
            continue;
        }
        // TODO add flavour
        detectiveInterface.sendMessage(`Time ran out and you didn't have time to do anything.`);
        continue;
    }
    return results;
}
