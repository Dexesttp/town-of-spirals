import { PlayerData } from "../data/player";
import { VoteRequest } from "../vote/types";
import { Message } from "../../client/type";

export type TargettingPromiseGetter = (
    command: string,
    players: PlayerData[],
    targets: PlayerData[],
    shouldBePrivate: boolean,
) => Promise<TargettingCommandData>;

export type TargettingHandler = (
    command: string,
    playerID: string,
    targetID: string,
    message: Message,
) => void;


export type TargettingCommandData = {
    playerID: string,
    targetID: string,
};
