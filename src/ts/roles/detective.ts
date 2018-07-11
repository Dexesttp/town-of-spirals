import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { TimerPromise } from "../utils/timer";
import { TargettingPromiseGetter } from "../game/targetCommand/types";
import { CommandPromiseGetter } from "../game/command/types";
import { PlayerInterface } from "../game/data/player";
import { GameTools } from "../game/data/tools";

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
) {
    const detectives = GetAlivePlayers(context).filter(p => p.roles.some(r => r === DETECTIVE_ROLE));
    for (const detective of detectives) {
        const promises: Array<Promise<DetectiveCommandResult>> = [];
        const detectiveInterface = context.playerInterface[detective.id];

        const timeoutPromise = TimerPromise(120000).then<DetectiveCommandResult>(r => ({ command: "timeout" }));
        promises.push(timeoutPromise);

        const targets = GetAlivePlayers(context);
        const savePromise = tools.getTargettingCommandPromise("save", [detective], targets, true)
            .then<DetectiveCommandResult>(r => ({ command: "spy", ...r }));
        promises.push(savePromise);
        // TODO add flavour
        detectiveInterface.sendMessage(`
You can spy on somebody with \`!s spy\` if you want :
${targets.map((t, i) => `[${i}] ${t.nickname} (${t.username})}`)}
        `);

        const skipPromise = tools.getCommandPromise("skip", [detective], true)
            .then<DetectiveCommandResult>(r => ({ command: "skip", playerID: r.playerID }));
        promises.push(skipPromise);
        // TODO add flavour
        detectiveInterface.sendMessage(`You can skip tonight's action with \`!s skip\`.`);

        const result = await Promise.race(promises);
        tools.cleanSubscribedCommands();
        if (result.command === "spy") {
            const target = context.players.filter(p => p.id === result.targetID)[0];
            target.attributes.push("spied");
            // TODO add flavour
            detectiveInterface.sendMessage(`You spy on ${target.nickname}. They're a ${target.roles.join(", ")}`);
            continue;
        }
        detectiveInterface.sendMessage(`You didn't do anything.`);
    }
}
