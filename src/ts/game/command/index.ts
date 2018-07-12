import { PlayerInterface, PlayerData } from "../data/player";
import { Message } from "../../client/type";
import { VoteRequest } from "../vote/types";
import { CommandHandler, CommandPromiseGetter, CommandData } from "./types";


enum CommandResult {
    VALID,
    INVALID_MODE,
    INVALID_VOTER,
}

type CommandRequestCallback = (playerID: string, message: Message) => CommandResult;

export function commandEngine(
    playerInterface: PlayerInterface,
    tryDeleteMessage: (message: Message, timeout?: number) => Promise<boolean>,
    sendMessage: (message: string) => void,
): {
    getCommandPromise: CommandPromiseGetter,
    handleCommand: CommandHandler,
    cleanSubscribedCommands: () => void,
} {
    let commandHandlers: {
        [command: string]: CommandRequestCallback[];
    } = {};

    function subscribeForCommand(
        command: string,
        callback: CommandRequestCallback,
    ) {
        if (!commandHandlers[command])
            commandHandlers[command] = [];
        commandHandlers[command].push(callback);
    }

    async function handleCommandResult(
        result: CommandResult,
        message: Message,
        voterID: string,
    ) {
        switch (result) {
            case CommandResult.INVALID_MODE:
                if (message.private) {
                    playerInterface[voterID].sendMessage("You must use this command publically.");
                    return;
                }
                await tryDeleteMessage(message);
                playerInterface[voterID].sendMessage("Do not use commands in public chats by night ! Please do it here via PMs.");
                return;
            case CommandResult.INVALID_VOTER:
                if (message.private)
                    return;
                await tryDeleteMessage(message);
                sendMessage("You cannot use this command.");
                return;
            default:
                return;
        }
    }

    function getCommandPromise(
        command: string,
        players: PlayerData[],
        shouldBePrivate: boolean,
    ) {
        return new Promise<CommandData>((resolve, reject) => {
            subscribeForCommand(command, (playerID, message: Message) => {
                // If the vote request is made in the wrong channel.
                if (message.private !== shouldBePrivate) {
                    reject(CommandResult.INVALID_MODE);
                    return CommandResult.INVALID_MODE;
                }
                // If the vote request is made by somebody who can't vote.
                if (!players.some(p => p.id === playerID)) {
                    reject(CommandResult.INVALID_VOTER);
                    return CommandResult.INVALID_VOTER;
                }
                // Otherwise
                resolve({ playerID });
                return CommandResult.VALID;
            });
        });
    }

    function handleCommand(
        command: string,
        playerID: string,
        message: Message,
    ) {
        if (!commandHandlers[command])
            return;
        for (const commandHandler of commandHandlers[command]) {
            const result = commandHandler(playerID, message);
            handleCommandResult(result, message, playerID);
        }
        commandHandlers[command] = [];
    }

    return {
        getCommandPromise,
        handleCommand,
        cleanSubscribedCommands() {
            commandHandlers = {};
        },
    };
}
