import { Message } from "../../client/type";
import { PlayerData } from "../data/player";

export type CommandPromiseGetter = (
    command: string,
    players: PlayerData[],
    shouldBePrivate: boolean,
) => Promise<CommandData>;

export type CommandHandler = (
    command: string,
    playerID: string,
    message: Message,
) => void;

export type CommandData = {
    playerID: string,
};
