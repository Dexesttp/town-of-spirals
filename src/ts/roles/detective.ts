import { GameContext } from "../game/data/context";
import { GetAlivePlayers } from "../game/utils/alive-players";
import { TimerPromise } from "../utils/timer";
import { GameTools } from "../game/data/tools";
import { callUntilResolved } from "../utils/promise-until-resolved";
import { PlayerData } from "../game/data/player";

export const ATTRIBUTES = {
    SPIED: "spied",
};

export const COMMANDS = {
    SPY: "spy",
    SKIP: "skip",
};

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

export type DetectiveFlavourList = {
    intro?: (voteList: string[]) => string,
    spy?: { [role: string]: (target: PlayerData, roleList: string[]) => string },
    skip?: () => string,
    timeout?: () => string,
};

export function handleDetective(
    flavour: DetectiveFlavourList,
    timeout = 120000,
) {
    return async (
        context: GameContext,
        tools: GameTools,
    ) => {
        const detectives = GetAlivePlayers(context).filter(p => p.roles.some(r => r === DETECTIVE_ROLE));
        const results: { [id: string]: DetectiveCommandResult } = {};
        for (const detective of detectives) {
            const promises: Array<Promise<DetectiveCommandResult>> = [];
            const detectiveInterface = context.playerInterface[detective.id];
            const targets = GetAlivePlayers(context);
            const voteList = targets.map((t, i) => `[${i + 1}] ${t.nickname} (${t.username})}`);
            const getIntroFlavour = flavour.intro || ((voteListInt: string[]) =>
                `Spy on somebody with \`!s spy\` : ${voteListInt.join(", ")}. Skip the night with \`!s skip\`.`
            );
            detectiveInterface.sendMessage(getIntroFlavour(voteList));

            //#region Timeout
            const timeoutPromise = TimerPromise(timeout).then<DetectiveCommandResult>(r => ({ command: "timeout" }));
            promises.push(timeoutPromise);
            //#endregion

            //#region Spy
            const spyPromise = callUntilResolved(() =>
                tools.getTargettingCommandPromise(COMMANDS.SPY, [detective], targets, true),
            ).then<DetectiveCommandResult>(r => ({ command: "spy", ...r }));
            promises.push(spyPromise);
            //#endregion

            //#region Skip
            const skipPromise = callUntilResolved(() =>
                tools.getCommandPromise(COMMANDS.SKIP, [detective], true),
            ).then<DetectiveCommandResult>(r => ({ command: "skip", playerID: r.playerID }));
            promises.push(skipPromise);
            //#endregion

            const result = await Promise.race(promises);
            tools.cleanSubscribedCommands();
            tools.cleanSubscribedTargettingCommands();

            results[detective.id] = result;

            if (result.command === "spy") {
                const target = context.players.filter(p => p.id === result.targetID)[0];
                target.attributes.push(ATTRIBUTES.SPIED);
                const roles = target.roles;
                const getSpyFlavour = (flavour.spy ? flavour.spy[roles.join("_") || "none"] || flavour.spy["unknown"] : undefined)
                || ((targetInt: PlayerData, roleListInt: string[]) => `${targetInt.nickname} is a ${roleListInt.join(", ")}`);
                detectiveInterface.sendMessage(getSpyFlavour(target, roles));
                continue;
            }
            if (result.command === "skip") {
                const getSkipFlavour = flavour.skip || (() => `You didn't do anything.`);
                detectiveInterface.sendMessage(getSkipFlavour());
                continue;
            }
            const getTimeoutFlavour = flavour.timeout || (() => `Time ran out and you didn't have time to do anything.`);
            detectiveInterface.sendMessage(getTimeoutFlavour());
            continue;
        }
        return results;
    };
}
