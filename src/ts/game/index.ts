import { GameContext } from "./data/context";
import { PlayerData, PlayerInterface } from "./data/player";
import { startVoteFactory } from "./vote";
import { TimerPromise } from "../utils/timer";
import { VoteRequest } from "./vote/types";
import { Message } from "../client/type";
import { targetEngine } from "./targetCommand";
import { commandEngine } from "./command";
import { GameTools } from "./data/tools";
import { resolveAllBroken } from "./resolve-all-broken";
import { baseDay } from "./base-day";
import { baseCheckEnd } from "./base-check-end";
import { CommandHandler } from "./command/types";
import { TargettingHandler } from "./targetCommand/types";

enum CommandResult {
    VALID,
    INVALID_MODE,
    INVALID_VOTER,
}

export type GameData = {
    context: GameContext,
    handleCommand: CommandHandler,
    handleTargettingCommand: TargettingHandler,
    setDay: (newDay: (context: GameContext, tools: GameTools) => Promise<any>) => void,
    subscribeNightRole: (role: (context: GameContext, internalTools: GameTools) => Promise<any>) => void,
    start: () => Promise<any>,
};

function notifyRoles(context: GameContext, tools: GameTools): Promise<any> {
    return Promise.all(context.players.map(p => {
        /// TODO add flavour
        const message = `A new game has started ! You are a ${p.roles.length > 0 ? p.roles.join(", ") : "normal bystander"}.`;
        return context.playerInterface[p.id].sendMessage(message);
    }));
}

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

    const night: Array<(context: GameContext, tools: GameTools) => Promise<any>> = [];
    let day: (context: GameContext, tools: GameTools) => Promise<any> = baseDay({});
    let checkEnd: (context: GameContext) => Promise<boolean> = baseCheckEnd;

    return {
        context,
        handleCommand,
        handleTargettingCommand,
        setDay(newDay: (context: GameContext, tools: GameTools) => Promise<any>) {
            day = newDay;
        },
        subscribeNightRole(role: (context: GameContext, internalTools: GameTools) => Promise<any>) {
            night.push(role);
        },
        async start() {
            await notifyRoles(context, internalsTools);

            while (true) {
                // TODO add flavour
                await context.sendMessage(`The night falls...`);
                for (const nightResult of night)
                    await nightResult(context, internalsTools);
                await resolveAllBroken(context, internalsTools);

                if (await checkEnd(context))
                    break;

                await day(context, internalsTools);

                if (await checkEnd(context))
                    break;
            }
        },
    };
}
