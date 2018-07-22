import { GameContext } from "./data/context";
import { PlayerData, PlayerInterface } from "./data/player";
import { startVoteFactory } from "./vote";
import { TimerPromise } from "../utils/timer";
import { Message } from "../client/type";
import { targetEngine } from "./targetCommand";
import { commandEngine } from "./command";
import { GameTools } from "./data/tools";
import { baseResolveAllBroken } from "./base-resolve-all-broken";
import { baseDay } from "./base-day";
import { baseCheckEnd } from "./base-check-end";
import { CommandHandler } from "./command/types";
import { TargettingHandler } from "./targetCommand/types";
import { baseNotifyRoles } from "./base-notify-roles";
import { baseNight } from "./base-night";

enum CommandResult {
    VALID,
    INVALID_MODE,
    INVALID_VOTER,
}

export type GameData = {
    context: GameContext,
    handleCommand: CommandHandler,
    handleTargettingCommand: TargettingHandler,
    setDay: (newDay: (context: GameContext, tools: GameTools) => Promise<void>) => void,
    setNight: (newNight: (context: GameContext, tools: GameTools) => Promise<void>) => void,
    setCheckEnd: (newCheckEnd: (context: GameContext, tools: GameTools) => Promise<boolean>) => void,
    setNotifyRoles: (newNotifyRoles: (context: GameContext, tools: GameTools) => Promise<void>) => void,
    setResolveAllBroken: (newResolveAllBroken: (context: GameContext, tools: GameTools) => Promise<void>) => void,
    subscribeNightRole: (role: (context: GameContext, internalTools: GameTools) => Promise<any>) => void,
    start: () => Promise<any>,
};

export function Game(
    players: PlayerData[],
    sendMessage: (message: string) => Promise<void>,
    playerInterface: PlayerInterface,
    tryDeleteMessage: (message: Message, timeout?: number) => Promise<boolean>,
): GameData {
    const context: GameContext = {
        players,
        playerInterface,
        sendMessage,
    };

    const {
        cleanSubscribedCommands,
        getCommandPromise,
        handleCommand,
    } = commandEngine(playerInterface, tryDeleteMessage, sendMessage);

    const {
        cleanSubscribedTargettingCommands,
        getTargettingCommandPromise,
        handleTargettingCommand,
    } = targetEngine(playerInterface, tryDeleteMessage, sendMessage);

    function* votePromiseGenerator(
        voters: PlayerData[],
        targets: PlayerData[],
        shouldBePrivate: boolean,
    ) {
        while (true) {
            yield Promise.race([
                getTargettingCommandPromise("vote", voters, targets, shouldBePrivate)
                .then(r => {
                    cleanSubscribedCommands();
                    cleanSubscribedTargettingCommands();
                    return {voterID: r.playerID, targetID: r.targetID};
                }),
                getCommandPromise("no-vote", voters, shouldBePrivate)
                .then(r => {
                    cleanSubscribedCommands();
                    cleanSubscribedTargettingCommands();
                    return {voterID: r.playerID, targetID: null};
                }),
            ]);
        }
    }

    const startVote = startVoteFactory(
        context,
        TimerPromise,
        votePromiseGenerator,
        (message: string, voters: PlayerData[], direct?: boolean) => {
            if (direct) {
                for (const voter of voters) {
                    playerInterface[voter.id].sendMessage(message);
                }
                return;
            }
            sendMessage(message);
        },
    );

    const internalsTools: GameTools = {
        cleanSubscribedCommands,
        cleanSubscribedTargettingCommands,
        getCommandPromise,
        getTargettingCommandPromise,
        startVote,
    };

    const nightRoles: Array<(context: GameContext, tools: GameTools) => Promise<any>> = [];
    let notifyRoles: (context: GameContext, tools: GameTools) => Promise<void> = baseNotifyRoles({});
    let day: (context: GameContext, tools: GameTools) => Promise<void> = baseDay({});
    let night: (context: GameContext, tools: GameTools) => Promise<void> = baseNight({});
    let checkEnd: (context: GameContext, tools: GameTools) => Promise<boolean> = baseCheckEnd({});
    let resolveAllBroken: (context: GameContext, tools: GameTools) => Promise<void> = baseResolveAllBroken({});

    return {
        context,
        handleCommand,
        handleTargettingCommand,
        setNotifyRoles(newNotifyRoles: (context: GameContext, tools: GameTools) => Promise<void>) {
            notifyRoles = newNotifyRoles;
        },
        setDay(newDay: (context: GameContext, tools: GameTools) => Promise<void>) {
            day = newDay;
        },
        setNight(newNight: (context: GameContext, tools: GameTools) => Promise<void>) {
            night = newNight;
        },
        setCheckEnd(newCheckEnd: (context: GameContext, tools: GameTools) => Promise<boolean>) {
            checkEnd = newCheckEnd;
        },
        setResolveAllBroken(newResolveAllBroken: (context: GameContext, tools: GameTools) => Promise<void>) {
            resolveAllBroken = newResolveAllBroken;
        },
        subscribeNightRole(role: (context: GameContext, tools: GameTools) => Promise<any>) {
            nightRoles.push(role);
        },
        async start() {
            await notifyRoles(context, internalsTools);

            while (true) {
                await night(context, internalsTools);

                for (const nightResult of nightRoles)
                    await nightResult(context, internalsTools);

                await resolveAllBroken(context, internalsTools);

                if (await checkEnd(context, internalsTools))
                    break;

                await day(context, internalsTools);

                if (await checkEnd(context, internalsTools))
                    break;
            }
        },
    };
}
