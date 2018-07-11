import { PlayerData } from "../data/player";
import { Message } from "../../client/type";

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
