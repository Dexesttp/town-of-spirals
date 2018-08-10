import { PlayerInterface, PlayerData } from "../data/player";
import { Message } from "../../client/type";
import { TargettingPromiseGetter, TargettingHandler, TargettingCommandData, InputTargetType } from "./types";

enum TargetRequestResult {
    VALID,
    INVALID_MODE,
    INVALID_VOTER,
    INVALID_TARGET,
}

type TargetRequestCallback = (playerID: string, target: InputTargetType, message: Message) => TargetRequestResult;

export function targetEngine(
    playerInterface: PlayerInterface,
    tryDeleteMessage: (message: Message, timeout?: number) => Promise<boolean>,
    sendMessage: (message: string) => void,
): {
        getTargettingCommandPromise: TargettingPromiseGetter,
        handleTargettingCommand: TargettingHandler,
        cleanSubscribedTargettingCommands: () => void,
    } {
    let handleTargettingOnce: {
        [command: string]: TargetRequestCallback[];
    } = {};

    function subscribeForTargetting(
        command: string,
        callback: TargetRequestCallback,
    ) {
        if (!handleTargettingOnce[command])
            handleTargettingOnce[command] = [];
        handleTargettingOnce[command].push(callback);
    }

    async function handleTargettingResult(
        result: TargetRequestResult,
        message: Message,
        voterID: string,
    ) {
        switch (result) {
            case TargetRequestResult.INVALID_MODE:
                if (message.private) {
                    playerInterface[voterID].sendMessage("You must use this command publicly.");
                    return;
                }
                await tryDeleteMessage(message);
                playerInterface[voterID].sendMessage("Do not use commands in public chats by night ! Please do it here via PMs.");
                return;
            case TargetRequestResult.INVALID_VOTER:
                if (message.private)
                    return;
                await tryDeleteMessage(message);
                sendMessage("You cannot use this command.");
                return;
            case TargetRequestResult.INVALID_TARGET:
                if (message.private) {
                    playerInterface[voterID].sendMessage(`Invalid command ${message.content} : this player isn't a valid target.`);
                    return;
                }
                sendMessage(`This player isn't a valid target.`);
                return;
            default:
                return;
        }
    }

    function getTargettingCommandPromise(
        command: string,
        players: PlayerData[],
        targets: PlayerData[],
        shouldBePrivate: boolean,
    ) {
        return new Promise<TargettingCommandData>((resolve, reject) => {
            subscribeForTargetting(command, (playerID, target, message: Message) => {
                // If the vote request is made in the wrong channel.
                if (message.private !== shouldBePrivate) {
                    reject(TargetRequestResult.INVALID_MODE);
                    return TargetRequestResult.INVALID_MODE;
                }
                // If the vote request is made by somebody who can't vote.
                if (!players.some(p => p.id === playerID)) {
                    reject(TargetRequestResult.INVALID_VOTER);
                    return TargetRequestResult.INVALID_VOTER;
                }
                // If the vote request is made towards somebody, and they cannot be targeted.
                if (target === null
                    || target === undefined
                    || target.content === null
                    || target.content === undefined
                ) {
                    reject(TargetRequestResult.INVALID_TARGET);
                    return TargetRequestResult.INVALID_TARGET;
                }
                const actualTarget = (target.type === "id"
                    ? targets.filter(t => (target.type === "id" && t.id === target.content))
                    : targets.filter((t, index) => (target.type === "index" && index === target.content))
                )[0];
                if (!actualTarget) {
                    reject(TargetRequestResult.INVALID_TARGET);
                    return TargetRequestResult.INVALID_TARGET;
                }
                // Otherwise
                resolve({ playerID, targetID: actualTarget.id });
                return TargetRequestResult.VALID;
            });
        });
    }

    function handleTargettingCommand(
        command: string,
        playerID: string,
        target: InputTargetType,
        message: Message,
    ) {
        if (!handleTargettingOnce[command])
            return;
        for (const targettingHandler of handleTargettingOnce[command]) {
            const result = targettingHandler(playerID, target, message);
            handleTargettingResult(result, message, playerID);
        }
        handleTargettingOnce[command] = [];
    }

    return {
        getTargettingCommandPromise,
        handleTargettingCommand,
        cleanSubscribedTargettingCommands() {
            handleTargettingOnce = {};
        },
    };
}
